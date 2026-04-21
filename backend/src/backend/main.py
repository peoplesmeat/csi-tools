import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from . import database
from .routers import sites

app = FastAPI(title="CSI Tools API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_methods=["GET"],
    allow_headers=["*"],
)


app.include_router(sites.router)


@app.get("/api/tables")
def list_tables():
    return {"tables": database.get_tables()}


@app.get("/api/tables/{table_name}/schema")
def table_schema(table_name: str):
    if table_name not in database.get_tables():
        raise HTTPException(status_code=404, detail="Table not found")
    return database.get_table_schema(table_name)


@app.get("/api/tables/{table_name}/data")
def table_data(
    table_name: str,
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
):
    if table_name not in database.get_tables():
        raise HTTPException(status_code=404, detail="Table not found")
    return database.get_table_data(table_name, offset, limit)
