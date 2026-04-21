# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

Monorepo: `backend/` (Python/FastAPI/Poetry) + `frontend/` (React/Vite/Tailwind CSS v4).  
The app reads from an Azure SQL Server database (`mms-tools`) and presents it in a browser UI.

## Backend

Managed with Poetry. Python ≥ 3.13. Source lives in `backend/src/backend/`.

```bash
cd backend
poetry install                          # install deps
poetry run uvicorn backend.main:app --reload   # dev server on :8000
```

Credentials are loaded from `backend/.env` (not committed). Key files:
- `main.py` — FastAPI app + CORS + routes
- `database.py` — SQLAlchemy engine (pymssql driver), table listing, schema, paginated data

API endpoints:
- `GET /api/tables` — list all tables
- `GET /api/tables/{name}/schema` — column names + types
- `GET /api/tables/{name}/data?offset=0&limit=100` — paginated rows

## Frontend

Vite + React + TypeScript + Tailwind CSS v4 (`@tailwindcss/vite` plugin).

```bash
cd frontend
npm install          # first time
npm run dev          # dev server on :5173 (proxies /api → :8000)
npm run build        # production build to dist/
```

Key files:
- `src/api.ts` — typed fetch wrappers for all three backend endpoints
- `src/App.tsx` — root: fetches table list, manages selected table state
- `src/components/TableList.tsx` — sidebar of clickable table names
- `src/components/DataTable.tsx` — paginated data grid with sticky column headers

The Vite dev server proxies `/api/*` to `http://localhost:8000`, so both servers must be running during development.
