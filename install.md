# IIS Deployment Plan for CSI Tools

## Context

CSI Tools is a monorepo with a Python/FastAPI backend (port 8000, ASGI/Uvicorn) and a React/Vite SPA frontend. The goal is to serve both from a single IIS site on Windows, with IIS handling static files for the frontend and reverse-proxying `/api/*` requests to a Uvicorn process running as a Windows service.

No deployment infrastructure currently exists — no `web.config`, no service config, no CI/CD.

---

## Architecture

```
Browser → IIS (port 80/443)
            ├── /           → serve frontend/dist/ (static files)
            └── /api/*      → reverse proxy → localhost:8000 (Uvicorn)
```

Uvicorn runs as a Windows service managed by **NSSM** (Non-Sucking Service Manager), independent of IIS. IIS proxies to it via the **URL Rewrite + ARR** modules.

---

## Prerequisites (IIS Server)

- IIS with **URL Rewrite** module and **Application Request Routing (ARR)** module installed
- **Python 3.13+** installed system-wide or in a virtualenv
- **Node.js** (for building the frontend — can be done on a dev machine)
- **NSSM** downloaded to e.g. `C:\tools\nssm.exe`
- Poetry installed: `pip install poetry`

---

## Step 1 — Build the Frontend

Run on any machine with Node.js:

```bash
cd frontend
npm install
npm run build
# Output: frontend/dist/
```

Copy `frontend/dist/` to the IIS server (e.g., `C:\inetpub\wwwroot\csi-tools\`).

---

## Step 2 — Install Backend Dependencies

On the IIS server:

```bash
cd backend
poetry install --no-dev
```

Note the virtualenv path (needed for NSSM):
```bash
poetry env info --path
# e.g., C:\Users\svc_account\AppData\Local\pypoetry\Cache\virtualenvs\backend-xxxx
```

---

## Step 3 — Set Environment Variables

Set these as **system environment variables** (or IIS Application Pool environment variables) instead of a `.env` file in production:

```
DB_SERVER=bot-data-server.database.windows.net
DB_USERNAME=bot
DB_PASSWORD=<secret>
DB_NAME=mms-tools
```

Use Windows system properties → Advanced → Environment Variables, or PowerShell:
```powershell
[System.Environment]::SetEnvironmentVariable("DB_SERVER", "...", "Machine")
```

---

## Step 4 — Update CORS in `main.py`

**File**: `backend/src/backend/main.py`

Change the hardcoded dev origin to read from an environment variable so it works for production:

```python
import os
# ...
allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
```

Then set `CORS_ORIGINS=https://your-iis-domain.com` in the system environment.

---

## Step 5 — Create IIS `web.config`

Place this file at the root of `frontend/dist/` (i.e., alongside `index.html`):

**File**: `frontend/dist/web.config`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>

    <!-- Proxy /api/* to Uvicorn -->
    <rewrite>
      <rules>
        <rule name="API Proxy" stopProcessing="true">
          <match url="^api/(.*)" />
          <action type="Rewrite" url="http://localhost:8000/api/{R:1}" />
        </rule>
        <!-- SPA fallback: all non-file/dir routes → index.html -->
        <rule name="SPA Fallback" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>

    <!-- Serve static assets with long cache -->
    <staticContent>
      <clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="365.00:00:00" />
    </staticContent>

  </system.webServer>
</configuration>
```

> **Requires**: IIS URL Rewrite module + ARR proxy enabled. Enable ARR proxy in IIS Manager → Application Request Routing → Server Proxy Settings → Enable proxy.

---

## Step 6 — Register Uvicorn as a Windows Service (NSSM)

```cmd
nssm install csi-tools-api
```

In the NSSM GUI (or via CLI):
- **Path**: `C:\path\to\poetry\venv\Scripts\uvicorn.exe`
- **Arguments**: `backend.main:app --host 127.0.0.1 --port 8000`
- **Startup directory**: `C:\path\to\csi-tools\backend`
- **Environment**: Add `PYTHONPATH=src` if needed

Or via CLI:
```cmd
nssm set csi-tools-api Application C:\...\venv\Scripts\uvicorn.exe
nssm set csi-tools-api AppParameters "backend.main:app --host 127.0.0.1 --port 8000"
nssm set csi-tools-api AppDirectory C:\path\to\csi-tools\backend
nssm start csi-tools-api
```

Verify: `curl http://localhost:8000/api/tables`

---

## Step 7 — Configure IIS Site

1. In IIS Manager, create a new site pointing to `frontend/dist/`
2. Set the app pool to use **No Managed Code** (since .NET isn't involved)
3. Bind to port 80 (and 443 with a cert for HTTPS)
4. Ensure the app pool identity has read access to `frontend/dist/`

---

## Files to Create

| File | Purpose |
|------|---------|
| `frontend/dist/web.config` | IIS URL rewrite (SPA + API proxy) — generated after build |
| Optional: `frontend/public/web.config` | Add here so Vite copies it to `dist/` on each build |

## Files to Modify

| File | Change |
|------|--------|
| `backend/src/backend/main.py` | CORS `allow_origins` → env var |

---

## Verification

1. `nssm status csi-tools-api` → `SERVICE_RUNNING`
2. `curl http://localhost:8000/api/tables` → JSON list of tables
3. Open `http://your-server/` in browser → React app loads
4. Click a table → data loads (confirms `/api/*` proxy works)
5. Refresh on a sub-route → still loads (confirms SPA fallback works)
