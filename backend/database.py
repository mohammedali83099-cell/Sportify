from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import text
from config import settings

# SQLite needs check_same_thread=False; safe to ignore for aiosqlite
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args=connect_args,
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

        # Safe migration for sqlite to ensure new columns exist
        if settings.DATABASE_URL.startswith("sqlite"):
            tables_to_columns = {
                "athletes": [
                    ("is_verified", "BOOLEAN DEFAULT 0"),
                ],
                "athlete_profiles": [
                    ("discipline", "TEXT"),
                    ("primary_role", "TEXT"),
                    ("sub_role", "TEXT"),
                    ("secondary_role", "TEXT"),
                    ("development_objectives", "JSON"),
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
            for table, cols in tables_to_columns.items():
                try:
                    res = await conn.execute(text(f"PRAGMA table_info({table});"))
                    existing_cols = {row[1] for row in res.fetchall()}
                    for col_name, col_type in cols:
                        if col_name not in existing_cols:
                            await conn.execute(
                                text(
                                    f"ALTER TABLE {table} ADD COLUMN {col_name} {col_type};"
                                )
                            )
                except Exception:
                    pass
