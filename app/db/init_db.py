from app.db.session import engine, Base
from app.db.models import Document

Base.metadata.create_all(bind=engine)

print("Database tables created successfully.")