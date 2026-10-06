#!/usr/bin/env bash
#
# seed_all.sh — fill the LMS database with the Python Core course and create the admin account.
#
# Run it on the server from the repo checkout, after ./deploy.sh has created backend/venv and backend/.env:
#
#   ./seed_all.sh          asks before seeding a database that already has lessons, and for the admin password
#   ./seed_all.sh --yes    no questions; creates the admin only if ADMIN_PASSWORD is set in the environment
#
# Connects with MONGO_URI from backend/.env, the same database the backend uses.

set -Eeuo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PY="$APP_DIR/backend/venv/bin/python"
ENV_FILE="$APP_DIR/backend/.env"

# Order matters: the five lesson phases only upsert (they never delete), exercises are generated
# from whatever lessons exist, and the course migration runs last so it tags everything with course_id.
SEEDS=(
  seed_master_lms.py
  seed_master_lms_phase2.py
  seed_master_lms_phase3.py
  seed_master_lms_phase4a.py
  seed_master_lms_phase4b.py
  seed_master_exercises.py
  backend/seed_practice_interview.py
  backend/migrate_add_course_id.py
)

if [[ -t 1 ]]; then C_STEP=$'\e[1;34m' C_OK=$'\e[1;32m' C_ERR=$'\e[1;31m' C_OFF=$'\e[0m'; else C_STEP="" C_OK="" C_ERR="" C_OFF=""; fi
step() { printf '\n%s==> %s%s\n' "$C_STEP" "$*" "$C_OFF"; }
die()  { printf '\n%s[error]%s %s\n' "$C_ERR" "$C_OFF" "$*" >&2; exit 1; }
trap 'die "command failed (line $LINENO): $BASH_COMMAND"' ERR

main() {
  local assume_yes=0 arg
  for arg in "$@"; do
    case $arg in
      -y|--yes) assume_yes=1 ;;
      -h|--help) sed -n '2,10p' "$0"; exit 0 ;;
      *) die "unknown option: $arg (see --help)" ;;
    esac
  done

  [[ -x $PY ]] || die "$PY not found; run ./deploy.sh first"
  cd "$APP_DIR"

  step "Connecting to MongoDB"
  MONGO_URI="$("$PY" - "$ENV_FILE" <<'PY'
import sys
from dotenv import dotenv_values
print(dotenv_values(sys.argv[1]).get("MONGO_URI") or "mongodb://localhost:27017")
PY
)"
  export MONGO_URI

  local lessons
  lessons="$(trap - ERR; "$PY" - <<'PY'
import os, re, sys
from pymongo import MongoClient
uri = os.environ["MONGO_URI"]
try:
    db = MongoClient(uri, serverSelectionTimeoutMS=5000)["lms_database"]
    db.command("ping")
except Exception as e:
    shown = re.sub(r"//[^@/]*@", "//***@", uri)
    sys.exit(f"    {shown}: {str(e).split(' (configured')[0]}")
print(db["lessons"].count_documents({}))
PY
)" || die "cannot reach MongoDB. Check MONGO_URI in backend/.env (or, for a local server: systemctl status mongod)"
  echo "    ok, lms_database has $lessons lessons"

  if ((lessons > 0 && !assume_yes)); then
    echo
    echo "    This database already has content. Seeding will:"
    echo "      - add or overwrite the 24 Python Core lessons"
    echo "      - REPLACE all practice exercises, coding challenges and interview questions"
    echo "        (edits made to those in the admin panel are lost)"
    local reply
    read -rp "    Continue? [y/N] " reply
    [[ $reply == [yY]* ]] || { echo "    Nothing changed."; exit 0; }
  fi

  # Ask for the admin password up front so the run is not interrupted halfway.
  local admin_pw="${ADMIN_PASSWORD:-}" confirm
  if [[ -z $admin_pw && $assume_yes == 0 && -t 0 ]]; then
    echo
    read -rsp "    Password for admin@lms.com (min 8 chars, empty = skip admin): " admin_pw; echo
    if [[ -n $admin_pw ]]; then
      ((${#admin_pw} >= 8)) || die "admin password must be at least 8 characters"
      read -rsp "    Repeat password: " confirm; echo
      [[ $admin_pw == "$confirm" ]] || die "passwords do not match"
    fi
  fi

  local s
  for s in "${SEEDS[@]}"; do
    step "$s"
    "$PY" "$s" || die "$s failed (output above). Fix it and re-run ./seed_all.sh; the steps are safe to repeat."
  done

  step "Admin account"
  if [[ -n $admin_pw ]]; then
    ADMIN_PASSWORD="$admin_pw" "$PY" admin_init.py
  else
    echo "    skipped (run: backend/venv/bin/python admin_init.py)"
  fi

  step "Database contents"
  "$PY" - <<'PY'
import os
from pymongo import MongoClient
db = MongoClient(os.environ["MONGO_URI"])["lms_database"]
for name in ["courses", "lessons", "lesson_exercises", "coding_challenges", "interview_questions", "users"]:
    print(f"    {name:22} {db[name].count_documents({})}")
PY
  printf '\n%sDone.%s No restart needed, the backend reads the database live.\n' "$C_OK" "$C_OFF"
}

main "$@"; exit
