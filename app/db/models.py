from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    filename: Mapped[str] = mapped_column(String(255))

    content_type: Mapped[str] = mapped_column(String(100))

    size: Mapped[int] = mapped_column()

    storage_path: Mapped[str] = mapped_column(String(500))

    status: Mapped[str] = mapped_column(
        String(50),
        default="uploaded",
    )

    extracted_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
    )