import os
import decimal
from datetime import datetime, date
from sqlalchemy import create_engine, text, inspect
from dotenv import load_dotenv

load_dotenv()

_engine = None


def get_engine():
    global _engine
    if _engine is None:
        server = os.getenv("DB_SERVER")
        username = os.getenv("DB_USERNAME")
        password = os.getenv("DB_PASSWORD")
        db_name = os.getenv("DB_NAME")
        url = f"mssql+pymssql://{username}:{password}@{server}/{db_name}"
        _engine = create_engine(url, pool_pre_ping=True)
    return _engine


def _serialize(value):
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, decimal.Decimal):
        return float(value)
    if isinstance(value, bytes):
        return value.hex()
    return value


def get_tables() -> list[str]:
    inspector = inspect(get_engine())
    return sorted(inspector.get_table_names())


def get_table_schema(table_name: str) -> list[dict]:
    inspector = inspect(get_engine())
    return [
        {"name": col["name"], "type": str(col["type"])}
        for col in inspector.get_columns(table_name)
    ]


def get_table_data(table_name: str, offset: int = 0, limit: int = 100) -> dict:
    with get_engine().connect() as conn:
        count_result = conn.execute(text(f"SELECT COUNT(*) FROM [{table_name}]"))
        total = count_result.scalar()

        result = conn.execute(
            text(
                f"SELECT * FROM [{table_name}]"
                f" ORDER BY (SELECT NULL)"
                f" OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY"
            ),
            {"offset": offset, "limit": limit},
        )
        columns = list(result.keys())
        rows = [
            {col: _serialize(val) for col, val in zip(columns, row)}
            for row in result.fetchall()
        ]
        return {"total": total, "columns": columns, "rows": rows}
