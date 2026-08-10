from sqlalchemy import text

from app.db.session import engine


with engine.begin() as connection:
    connection.execute(
        text(
            """
            ALTER TABLE documents
            ADD COLUMN IF NOT EXISTS extracted_text TEXT
            """
        )
    )

print("Database migration completed successfully.")