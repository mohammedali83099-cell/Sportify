import asyncio
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database import engine
from sqlalchemy import text

async def add_cols():
    cols = [
        ('primary_playstyle', 'VARCHAR'),
        ('secondary_tendencies', 'JSON'),
        ('playstyle_profile', 'JSON'),
        ('dominant_hand', 'VARCHAR'),
        ('dominant_foot', 'VARCHAR'),
        ('stance', 'VARCHAR'),
        ('surface_preference', 'VARCHAR'),
        ('training_environment', 'VARCHAR'),
        ('equipment_access', 'JSON'),
        ('athlete_description', 'TEXT'),
        ('personal_goals_text', 'TEXT'),
    ]
    async with engine.begin() as conn:
        if engine.dialect.name == 'sqlite':
            res = await conn.execute(text('PRAGMA table_info(athlete_profiles);'))
            existing = [row[1] for row in res.fetchall()]
        else:
            res = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='athlete_profiles';"))
            existing = [row[0] for row in res.fetchall()]

        for col_name, col_type in cols:
            if col_name not in existing:
                query = text(f'ALTER TABLE athlete_profiles ADD COLUMN {col_name} {col_type};')
                await conn.execute(query)
                print(f'Added column: {col_name}')
            else:
                print(f'Column already exists: {col_name}')
    print('Database schema update complete.')

if __name__ == '__main__':
    asyncio.run(add_cols())
