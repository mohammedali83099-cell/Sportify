from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import text
from config import settings

connect_args = {}
if settings.normalized_database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_async_engine(
    settings.normalized_database_url,
    echo=False,
    connect_args=connect_args,
    pool_pre_ping=True,
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


async def create_all_tables():
    """Create all tables and perform safe additive column migrations if needed."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

        tables_to_columns = {
            "athletes": [
                ("is_verified", "BOOLEAN DEFAULT FALSE"),
                ("hashed_recovery_pin", "TEXT"),
            ],
            "athlete_profiles": [
                ("discipline", "TEXT"),
                ("primary_role", "TEXT"),
                ("sub_role", "TEXT"),
                ("secondary_role", "TEXT"),
                ("development_objectives", "JSON"),
                ("goals", "JSON"),
            ],
            "movement_assessments": [
                ("protocol_id", "TEXT"),
                ("overall_movement_quality", "FLOAT"),
                ("metric_details", "JSON"),
                ("quality_report", "JSON"),
                ("error_details", "JSON"),
            ],
            "bottleneck_reports": [
                ("strengths", "JSON"),
                ("proficient", "JSON"),
                ("development_areas", "JSON"),
                ("critical_bottlenecks", "JSON"),
            ],
            "progress_logs": [
                ("workload_index", "FLOAT"),
                ("exercises_completed", "JSON"),
            ],
        }

        is_sqlite = settings.normalized_database_url.startswith("sqlite")

        for table, cols in tables_to_columns.items():
            if is_sqlite:
                try:
                    res = await conn.execute(text(f"PRAGMA table_info({table});"))
                    existing_cols = {row[1] for row in res.fetchall()}
                    for col_name, col_type in cols:
                        if col_name not in existing_cols:
                            sqlite_type = col_type.replace("BOOLEAN DEFAULT FALSE", "BOOLEAN DEFAULT 0")
                            await conn.execute(
                                text(f"ALTER TABLE {table} ADD COLUMN {col_name} {sqlite_type};")
                            )
                except Exception as e:
                    print(f"[WARN] SQLite column migration error on {table}: {e}")
            else:
                # PostgreSQL safe additive column migration
                for col_name, col_type in cols:
                    try:
                        await conn.execute(
                            text(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {col_name} {col_type};")
                        )
                    except Exception as e:
                        print(f"[WARN] Postgres column migration error on {table}.{col_name}: {e}")
