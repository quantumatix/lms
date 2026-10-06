// Backend base URL.
// Production builds call the API through nginx at /api (same origin as the app).
// Local dev talks to uvicorn directly. Override either with VITE_API_URL in myapp/.env.
export const API_BASE =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.PROD ? "/api" : "http://127.0.0.1:8000");
