#!/usr/bin/env bash
#
# deploy.sh — build and (re)deploy the LMS on an Ubuntu server that already runs pm2 + nginx.
#
#   Frontend : Vite build, copied to /var/www/<domain>, served by nginx
#   Backend  : FastAPI (uvicorn) on 127.0.0.1:<free port>, managed by pm2
#   nginx    : https://<domain>/        -> static frontend (SPA fallback)
#              https://<domain>/api/... -> backend (/api prefix stripped)
#
# Run it from the repo checkout on the server (outside /var/www, e.g. /opt/lms), as the same
# user that owns your other pm2 apps:
#
#   ./deploy.sh                  pull latest code, build, restart, reload nginx
#   ./deploy.sh --no-pull        deploy the code as it is on disk
#   LMS_PORT=8123 ./deploy.sh    force a specific backend port
#
# The first run creates backend/.env from backend/.env.example and stops so you can fill it in.
# The chosen backend port is saved in .deploy_port and reused on later deploys.

set -Eeuo pipefail

# ---------------------------------------------------------------- settings
# Any of these can be overridden from the environment, e.g. DOMAIN=x ./deploy.sh
DOMAIN="${DOMAIN:-lms.quantumatix.in}"
APP_NAME="${APP_NAME:-lms-backend}"                   # pm2 process name
BRANCH="${BRANCH:-main}"
WEB_ROOT="${WEB_ROOT:-/var/www/$DOMAIN}"
PORT_RANGE_START="${PORT_RANGE_START:-8100}"          # free-port search range for the backend
PORT_RANGE_END="${PORT_RANGE_END:-8999}"
WORKERS="${WORKERS:-2}"                               # uvicorn worker processes
PYTHON_BIN="${PYTHON_BIN:-python3}"                   # needs >= 3.10
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"                    # optional, for Let's Encrypt expiry mails
SKIP_SSL="${SKIP_SSL:-0}"                             # 1 = do not request a certificate

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/myapp"
VENV_DIR="$BACKEND_DIR/venv"
ENV_FILE="$BACKEND_DIR/.env"
PORT_FILE="$APP_DIR/.deploy_port"
LE_DIR="/etc/letsencrypt/live/$DOMAIN"

# ---------------------------------------------------------------- helpers
if [[ -t 1 ]]; then
  C_STEP=$'\e[1;34m' C_OK=$'\e[1;32m' C_WARN=$'\e[1;33m' C_ERR=$'\e[1;31m' C_OFF=$'\e[0m'
else
  C_STEP="" C_OK="" C_WARN="" C_ERR="" C_OFF=""
fi
step() { printf '\n%s==> %s%s\n' "$C_STEP" "$*" "$C_OFF"; }
info() { printf '    %s\n' "$*"; }
warn() { printf '%s[warn]%s %s\n' "$C_WARN" "$C_OFF" "$*" >&2; }
die()  { printf '\n%s[error]%s %s\n' "$C_ERR" "$C_OFF" "$*" >&2; exit 1; }
trap 'die "command failed (line $LINENO): $BASH_COMMAND"' ERR

if [[ $EUID -eq 0 ]]; then SUDO=""; else SUDO="sudo"; fi

version_ge() { [[ "$(printf '%s\n%s\n' "$2" "$1" | sort -V | head -1)" == "$2" ]]; }

apt_install() {
  info "installing: $*"
  $SUDO apt-get update -qq
  $SUDO DEBIAN_FRONTEND=noninteractive apt-get install -y -qq "$@"
}

# ---------------------------------------------------------------- 1. prerequisites
preflight() {
  step "Checking server prerequisites"
  [[ -r /etc/os-release ]] && info "OS: $(. /etc/os-release && echo "${PRETTY_NAME:-unknown}")"

  # The checkout holds backend/.env (API keys) and .git; nginx's default site serves /var/www/html,
  # so a checkout under /var/www can end up downloadable. Only the built frontend belongs there.
  if [[ $APP_DIR == /var/www/* ]]; then
    die "this checkout is inside /var/www ($APP_DIR), where nginx can serve backend/.env and .git publicly.
        Move it out of the web root, e.g.:  mv $APP_DIR /opt/lms && cd /opt/lms && ./deploy.sh"
  fi

  if [[ -n $SUDO ]]; then
    command -v sudo >/dev/null || die "run as root or install sudo"
    sudo -v || die "this script needs sudo for nginx and $WEB_ROOT"
  fi

  local cmd
  for cmd in node npm pm2 nginx git curl ss; do
    command -v "$cmd" >/dev/null || die "'$cmd' not found in PATH (if node/pm2 come from nvm, run this as that user, not via sudo)"
  done
  command -v rsync >/dev/null || apt_install rsync

  local node_v; node_v="$(node -v | sed 's/^v//')"
  if ! { [[ ${node_v%%.*} -eq 20 ]] && version_ge "$node_v" 20.19.0; } && ! version_ge "$node_v" 22.12.0; then
    die "Node $node_v is too old for the Vite build (need 20.19+ or 22.12+)"
  fi
  info "node $node_v, pm2 $(pm2 -v 2>/dev/null | tail -1), $(nginx -v 2>&1 | sed 's|.*/||;s|^|nginx |')"

  command -v "$PYTHON_BIN" >/dev/null || die "$PYTHON_BIN not found (set PYTHON_BIN=python3.x)"
  local py_v; py_v="$("$PYTHON_BIN" -c 'import sys; print("%d.%d" % sys.version_info[:2])')"
  version_ge "$py_v" 3.10 || die "Python $py_v is too old (need 3.10+); install a newer one and set PYTHON_BIN"
  if ! "$PYTHON_BIN" -c 'import ensurepip' 2>/dev/null; then
    apt_install "python${py_v}-venv"
  fi
  info "python $py_v"

  # pm2 keeps a separate process list per OS user; warn if the other apps live under someone else.
  local pm2_users
  pm2_users="$(ps -eo user:32=,args= | awk '/[P]M2 v[0-9]/ {print $1}' | sort -u | tr '\n' ' ')"
  if [[ -n $pm2_users && " $pm2_users " != *" $(id -un) "* ]]; then
    warn "existing pm2 daemons run as: ${pm2_users% }; you are '$(id -un)'. The backend will be in $(id -un)'s pm2 list."
  fi

  $SUDO nginx -t >/dev/null 2>&1 || die "nginx config is already failing 'nginx -t' before this deploy; fix that first"
}

# ---------------------------------------------------------------- 2. code
update_code() {
  [[ ${NO_PULL:-0} == 1 ]] && { info "skipping git pull (--no-pull)"; return; }
  if ! git -C "$APP_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    warn "not a git checkout; deploying files as they are"
    return
  fi
  step "Pulling latest code ($BRANCH)"
  local before after
  before="$(sha256sum "$APP_DIR/deploy.sh" | cut -d' ' -f1)"
  git -C "$APP_DIR" fetch --quiet origin "$BRANCH"
  git -C "$APP_DIR" checkout --quiet "$BRANCH"
  git -C "$APP_DIR" merge --ff-only --quiet "origin/$BRANCH" \
    || die "local checkout has diverged from origin/$BRANCH; resolve it manually"
  info "at $(git -C "$APP_DIR" log -1 --format='%h %s')"
  after="$(sha256sum "$APP_DIR/deploy.sh" | cut -d' ' -f1)"
  if [[ $before != "$after" ]]; then
    info "deploy.sh changed in this pull, restarting with the new version"
    exec env NO_PULL=1 bash "$APP_DIR/deploy.sh" "$@"
  fi
}

# ---------------------------------------------------------------- 3. env
check_env() {
  step "Checking backend/.env"
  if [[ ! -f $ENV_FILE ]]; then
    cp "$BACKEND_DIR/.env.example" "$ENV_FILE"
    chmod 600 "$ENV_FILE"
    die "created $ENV_FILE from .env.example. Fill in the values, then run ./deploy.sh again."
  fi
  chmod 600 "$ENV_FILE"

  local key val missing=()
  for key in OPENAI_API_KEY GEMINI_API_KEY; do
    val="$(grep -E "^[[:space:]]*${key}[[:space:]]*=" "$ENV_FILE" | tail -1 | cut -d= -f2- | tr -d "\"' \r" || true)"
    [[ -z $val ]] && missing+=("$key")
  done
  ((${#missing[@]} == 0)) || die "set ${missing[*]} in $ENV_FILE (the backend will not start without them)"
  info "ok"
}

# ---------------------------------------------------------------- 4. backend deps
setup_backend() {
  step "Installing backend dependencies"
  if [[ ! -x $VENV_DIR/bin/python ]]; then
    "$PYTHON_BIN" -m venv "$VENV_DIR"
  fi
  "$VENV_DIR/bin/pip" install --quiet --upgrade pip
  "$VENV_DIR/bin/pip" install --quiet -r "$BACKEND_DIR/requirements.prod.txt"
  info "venv: $VENV_DIR"
}

check_mongo() {
  step "Checking MongoDB connection"
  "$VENV_DIR/bin/python" - "$ENV_FILE" <<'PY' || die "cannot reach MongoDB with MONGO_URI from backend/.env (default mongodb://localhost:27017). Check: sudo systemctl status mongod"
import os, sys
from dotenv import dotenv_values
from pymongo import MongoClient
uri = dotenv_values(sys.argv[1]).get("MONGO_URI") or "mongodb://localhost:27017"
MongoClient(uri, serverSelectionTimeoutMS=5000).admin.command("ping")
PY
  info "ok"
}

# ---------------------------------------------------------------- 5. frontend build
build_frontend() {
  step "Building frontend"
  (
    cd "$FRONTEND_DIR"
    npm ci --include=dev --no-audit --no-fund --loglevel=error
    npm run build
  )
  [[ -f $FRONTEND_DIR/dist/index.html ]] || die "build produced no dist/index.html"
}

publish_frontend() {
  step "Publishing frontend to $WEB_ROOT"
  $SUDO mkdir -p "$WEB_ROOT"
  $SUDO rsync -a --delete --chmod=D755,F644 "$FRONTEND_DIR/dist/" "$WEB_ROOT/"
  info "ok"
}

# ---------------------------------------------------------------- 6. port selection
# Every port that is taken or reserved by something else on this server.
ports_in_use() {
  {
    # anything listening right now (IPv4 + IPv6)
    ss -tlnH | awk '{print $4}' | sed -E 's/.*[:.]([0-9]+)$/\1/'
    # ports other nginx sites proxy to (their app might just be stopped right now)
    $SUDO grep -RhoE '(127\.0\.0\.1|localhost|0\.0\.0\.0|\[::1?\]):[0-9]+' /etc/nginx \
      --exclude="$DOMAIN" --exclude="$DOMAIN.conf" 2>/dev/null | sed -E 's/.*:([0-9]+)$/\1/' || true
    # ports configured for other pm2 apps, including stopped ones
    pm2 jlist 2>/dev/null | node -e '
      let s = ""; process.stdin.on("data", d => s += d).on("end", () => {
        let apps = []; try { apps = JSON.parse(s.slice(s.indexOf("["))); } catch { return; }
        for (const a of apps) {
          if (a.name === process.argv[1]) continue;
          const e = a.pm2_env || {}, env = e.env || {};
          for (const v of [env.PORT, e.PORT, env.port]) if (v) console.log(v);
          const args = [].concat(e.args || []).join(" ");
          for (const m of args.matchAll(/(?:--port[= ]|-p )(\d+)/g)) console.log(m[1]);
        }
      });' "$APP_NAME" || true
  } | grep -E '^[0-9]+$' | sort -un || true
}

# True if the port is held by this app's own pm2 process (i.e. a redeploy).
port_is_ours() {
  local pid; pid="$(pm2 pid "$APP_NAME" 2>/dev/null | tail -1 || true)"
  [[ -n $pid && $pid != 0 ]] && ss -tlnpH "sport = :$1" 2>/dev/null | grep -q "pid=$pid,"
}

pick_port() {
  step "Choosing backend port"
  local used p
  used="$(ports_in_use)"
  is_used() { grep -qx "$1" <<<"$used"; }

  if [[ -n ${LMS_PORT:-} ]]; then
    if is_used "$LMS_PORT" && ! port_is_ours "$LMS_PORT"; then die "LMS_PORT=$LMS_PORT is already in use"; fi
    PORT="$LMS_PORT"
  elif [[ -s $PORT_FILE ]] && p="$(<"$PORT_FILE")" && [[ $p =~ ^[0-9]+$ ]] && { ! is_used "$p" || port_is_ours "$p"; }; then
    PORT="$p"
    info "reusing port $PORT from previous deploy"
  else
    [[ -s $PORT_FILE ]] && warn "previous port $(<"$PORT_FILE") is now taken by something else, picking a new one"
    PORT=""
    for ((p = PORT_RANGE_START; p <= PORT_RANGE_END; p++)); do
      if ! is_used "$p"; then PORT="$p"; break; fi
    done
    [[ -n $PORT ]] || die "no free port between $PORT_RANGE_START and $PORT_RANGE_END"
    info "selected free port $PORT"
  fi
  echo "$PORT" >"$PORT_FILE"
}

# ---------------------------------------------------------------- 7. pm2
start_backend() {
  step "Starting backend with pm2 ($APP_NAME -> 127.0.0.1:$PORT)"
  pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
  pm2 start "$VENV_DIR/bin/uvicorn" \
    --name "$APP_NAME" --cwd "$BACKEND_DIR" --interpreter none --time \
    -- main:app --host 127.0.0.1 --port "$PORT" --workers "$WORKERS" \
       --env-file "$ENV_FILE" --proxy-headers --forwarded-allow-ips 127.0.0.1 >/dev/null
  pm2 save >/dev/null

  local i out
  for ((i = 0; i < 40; i++)); do
    out="$(curl -fsS "http://127.0.0.1:$PORT/" 2>/dev/null || true)"
    if [[ $out == *"LMS Backend"* ]]; then
      info "backend is up"
      if ! ls /etc/systemd/system/pm2-*.service >/dev/null 2>&1; then
        warn "pm2 is not set to start on boot. Run 'pm2 startup' once and execute the command it prints."
      fi
      return
    fi
    sleep 1
  done
  pm2 logs "$APP_NAME" --lines 40 --nostream || true
  die "backend did not respond on 127.0.0.1:$PORT within 40s (logs above)"
}

# ---------------------------------------------------------------- 8. nginx
nginx_paths() {
  if [[ -d /etc/nginx/sites-available && -d /etc/nginx/sites-enabled ]]; then
    NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
    NGINX_LINK="/etc/nginx/sites-enabled/$DOMAIN"
  else
    NGINX_CONF="/etc/nginx/conf.d/$DOMAIN.conf"
    NGINX_LINK=""
  fi
}

render_nginx() {
  local with_ssl=$1 l80="    listen 80;" l443="    listen 443 ssl http2;"
  if [[ -f /proc/net/if_inet6 ]]; then
    l80+=$'\n    listen [::]:80;'
    l443+=$'\n    listen [::]:443 ssl http2;'
  fi

  # shared by the HTTP-only and HTTPS server blocks
  local body
  body="$(cat <<EOF
    root $WEB_ROOT;
    index index.html;

    client_max_body_size 25m;

    gzip on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;

    # API -> FastAPI on 127.0.0.1:$PORT (the trailing slash strips the /api prefix)
    location /api/ {
        proxy_pass http://127.0.0.1:$PORT/;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        # AI content generation can take a while
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }

    # Hashed build assets never change
    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files \$uri =404;
    }

    # Single-page app: unknown paths serve index.html, which must not be cached
    location / {
        add_header Cache-Control "no-cache";
        try_files \$uri \$uri/ /index.html;
    }
EOF
)"

  echo "# Managed by $APP_DIR/deploy.sh and rewritten on every deploy. Edit the script, not this file."
  echo "# Backend: pm2 app '$APP_NAME' on 127.0.0.1:$PORT"
  echo
  if [[ $with_ssl == 1 ]]; then
    cat <<EOF
server {
$l80
    server_name $DOMAIN;
    return 301 https://\$host\$request_uri;
}

server {
$l443
    server_name $DOMAIN;

    ssl_certificate     $LE_DIR/fullchain.pem;
    ssl_certificate_key $LE_DIR/privkey.pem;
EOF
    if $SUDO test -f /etc/letsencrypt/options-ssl-nginx.conf; then
      echo "    include /etc/letsencrypt/options-ssl-nginx.conf;"
    else
      echo "    ssl_protocols TLSv1.2 TLSv1.3;"
    fi
    if $SUDO test -f /etc/letsencrypt/ssl-dhparams.pem; then
      echo "    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;"
    fi
    printf '\n%s\n}\n' "$body"
  else
    cat <<EOF
server {
$l80
    server_name $DOMAIN;

$body
}
EOF
  fi
}

configure_nginx() {
  step "Configuring nginx for $DOMAIN"
  nginx_paths

  # refuse to fight another site config that already claims this domain
  local others
  others="$($SUDO grep -RlE "server_name[^;]*[[:space:]]${DOMAIN//./\\.}[[:space:];]" /etc/nginx/sites-enabled /etc/nginx/conf.d 2>/dev/null \
    | grep -vE "/${DOMAIN//./\\.}(\.conf)?$" || true)"
  [[ -z $others ]] || die "another nginx config already serves $DOMAIN: $others"

  local with_ssl=0 tmp backup=""
  $SUDO test -f "$LE_DIR/fullchain.pem" && with_ssl=1

  tmp="$(mktemp)"
  render_nginx "$with_ssl" >"$tmp"
  if $SUDO test -f "$NGINX_CONF"; then
    backup="$(mktemp)"
    $SUDO cat "$NGINX_CONF" >"$backup"
  fi
  $SUDO install -m 644 "$tmp" "$NGINX_CONF"
  rm -f "$tmp"
  [[ -n $NGINX_LINK ]] && $SUDO ln -sfn "$NGINX_CONF" "$NGINX_LINK"

  local test_log; test_log="$(mktemp)"
  if ! $SUDO nginx -t 2>"$test_log"; then
    sed 's/^/    /' "$test_log" >&2; rm -f "$test_log"
    if [[ -n $backup ]]; then
      $SUDO install -m 644 "$backup" "$NGINX_CONF"
    else
      $SUDO rm -f "$NGINX_CONF" ${NGINX_LINK:+"$NGINX_LINK"}
    fi
    rm -f "$backup"
    die "nginx -t failed with the new config; previous config restored and nginx NOT reloaded"
  fi
  rm -f "$test_log" ${backup:+"$backup"}
  $SUDO systemctl reload nginx
  info "$NGINX_CONF ($([[ $with_ssl == 1 ]] && echo HTTPS || echo HTTP only))"
}

# ---------------------------------------------------------------- 9. SSL
setup_ssl() {
  if $SUDO test -f "$LE_DIR/fullchain.pem"; then return; fi
  if [[ $SKIP_SSL == 1 ]]; then warn "SKIP_SSL=1, site stays on plain HTTP"; return; fi

  step "Requesting Let's Encrypt certificate for $DOMAIN"
  if ! getent hosts "$DOMAIN" >/dev/null; then
    warn "$DOMAIN does not resolve yet. Add an A record for 'lms' pointing to this server, wait for DNS, then re-run."
    return
  fi
  command -v certbot >/dev/null || apt_install certbot python3-certbot-nginx

  local email_args=(--register-unsafely-without-email)
  [[ -n $CERTBOT_EMAIL ]] && email_args=(-m "$CERTBOT_EMAIL")
  # certonly: certbot validates through nginx but leaves our config file alone; we render the HTTPS block ourselves
  if $SUDO certbot certonly --nginx -d "$DOMAIN" --non-interactive --agree-tos "${email_args[@]}"; then
    configure_nginx
  else
    warn "certbot failed (usually DNS not pointing here yet). Site is live on HTTP; re-run ./deploy.sh to retry."
  fi
}

# ---------------------------------------------------------------- 10. smoke test
smoke_test() {
  step "Smoke test through nginx"
  local scheme=http port=80
  $SUDO test -f "$LE_DIR/fullchain.pem" && scheme=https port=443
  local url="$scheme://$DOMAIN" out
  out="$(curl -fsS --resolve "$DOMAIN:$port:127.0.0.1" "$url/api/" || true)"
  [[ $out == *"LMS Backend"* ]] || die "$url/api/ did not reach the backend through nginx"
  out="$(curl -fsS --resolve "$DOMAIN:$port:127.0.0.1" "$url/" || true)"
  [[ $out == *'id="root"'* ]] || die "$url/ did not serve the frontend"
  info "frontend and /api OK"

  printf '\n%sDeployed:%s %s\n' "$C_OK" "$C_OFF" "$url"
  info "backend  : pm2 '$APP_NAME' on 127.0.0.1:$PORT   (pm2 logs $APP_NAME)"
  info "frontend : $WEB_ROOT"
  info "nginx    : $NGINX_CONF"
}

# ---------------------------------------------------------------- main
main() {
  local arg
  for arg in "$@"; do
    case $arg in
      --no-pull) NO_PULL=1 ;;
      -h|--help) sed -n '2,19p' "$0"; exit 0 ;;
      *) die "unknown option: $arg (see --help)" ;;
    esac
  done

  preflight
  update_code "$@"
  check_env
  setup_backend
  check_mongo
  build_frontend      # build before touching anything live, so a failed build changes nothing
  pick_port
  start_backend
  publish_frontend
  configure_nginx
  setup_ssl
  smoke_test
}

main "$@"; exit
