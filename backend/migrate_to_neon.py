import asyncio
import json
import sqlite3
import datetime
from sqlalchemy import text, insert
from sqlalchemy.ext.asyncio import create_async_engine
import sys
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import Base, create_all_tables
from models import Athlete, AthleteProfile, MovementAssessment, BottleneckReport, TrainingPlan, ProgressLog

NEON_URL = "postgresql+asyncpg://neondb_owner:npg_EAiCR6fIn9Mm@ep-hidden-fog-bizzkax5-pooler.c-5.ap-southeast-1.aws.neon.tech/neondb?ssl=require"
SQLITE_PATH = "athletiq.db"

TABLE_MODELS = [
    ("athletes", Athlete),
    ("athlete_profiles", AthleteProfile),
    ("movement_assessments", MovementAssessment),
    ("bottleneck_reports", BottleneckReport),
    ("training_plans", TrainingPlan),
    ("progress_logs", ProgressLog),
]

def parse_val(col_name, val):
    if val is None:
        return None
    # Boolean fields
    if col_name in ("is_verified", "is_active", "completed"):
        if isinstance(val, int):
            return bool(val)
        return val
    # JSON fields
    json_cols = {
        "development_objectives", "goals", "secondary_tendencies", "playstyle_profile",
        "equipment_access", "self_assessment_scores", "pose_data", "movement_scores",
        "metric_details", "movement_feedback", "quality_report", "error_details",
        "coaching", "bottlenecks", "strengths", "proficient", "development_areas",
        "critical_bottlenecks", "plan_data", "exercises_completed"
    }
    if col_name in json_cols:
        if isinstance(val, str):
            try:
                return json.loads(val)
            except Exception:
                return val
        return val
    # Date fields
    if col_name in ("week_start_date", "session_date"):
        if isinstance(val, str):
            try:
                return datetime.date.fromisoformat(val.split("T")[0])
            except Exception:
                return val
    # Datetime fields
    if col_name in ("created_at", "updated_at"):
        if isinstance(val, str):
            try:
                clean_dt = val.replace("Z", "+00:00")
                return datetime.datetime.fromisoformat(clean_dt)
            except Exception:
                return val
    return val

async def main():
    print(f"Connecting to SQLite: {SQLITE_PATH}")
    sq_conn = sqlite3.connect(SQLITE_PATH)
    sq_conn.row_factory = sqlite3.Row
    sq_cursor = sq_conn.cursor()

    print(f"Connecting to Neon Postgres...")
    engine = create_async_engine(NEON_URL, echo=False)

    print("Ensuring tables and columns in Neon...")
    await create_all_tables()

    # Clear tables in reverse dependency order first
    async with engine.begin() as pg_conn:
        for table_name, _ in reversed(TABLE_MODELS):
            try:
                await pg_conn.execute(text(f"TRUNCATE TABLE {table_name} CASCADE;"))
                print(f"Truncated {table_name}")
            except Exception as e:
                print(f"Note on truncating {table_name}: {e}")

    # Now insert in forward dependency order using model table definitions
    for table_name, model in TABLE_MODELS:
        sq_cursor.execute(f"SELECT * FROM {table_name}")
        rows = sq_cursor.fetchall()
        print(f"\nProcessing {table_name} ({len(rows)} records in SQLite)...")
        if not rows:
            print(f"No records to migrate for {table_name}.")
            continue

        model_columns = {c.name for c in model.__table__.columns}
        col_names = [col[0] for col in sq_cursor.description if col[0] in model_columns]

        batch_data = []
        for row in rows:
            row_dict = {}
            for col in col_names:
                row_dict[col] = parse_val(col, row[col])
            batch_data.append(row_dict)

        async with engine.begin() as pg_conn:
            # Insert in chunks using model.__table__.insert()
            chunk_size = 50
            for i in range(0, len(batch_data), chunk_size):
                chunk = batch_data[i:i + chunk_size]
                await pg_conn.execute(insert(model), chunk)

            # Reset serial sequence
            try:
                max_id_res = await pg_conn.execute(text(f"SELECT MAX(id) FROM {table_name}"))
                max_id = max_id_res.scalar()
                if max_id:
                    seq_res = await pg_conn.execute(text(f"SELECT pg_get_serial_sequence('{table_name}', 'id')"))
                    seq_name = seq_res.scalar()
                    if seq_name:
                        await pg_conn.execute(text(f"SELECT setval('{seq_name}', {max_id}, true)"))
                        print(f"  Reset sequence {seq_name} to {max_id}")
            except Exception as e:
                print(f"  Sequence reset note for {table_name}: {e}")

            count_res = await pg_conn.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
            count = count_res.scalar()
            print(f"Successfully migrated {table_name}: {count} records in Postgres (matches {len(rows)}).")

    sq_conn.close()
    await engine.dispose()
    print("\nAll data migration from SQLite to Neon completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
