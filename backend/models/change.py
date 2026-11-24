from datetime import datetime
from enum import Enum

from db.database import Base
from sqlalchemy import JSON, DateTime, ForeignKey, String
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Criticality(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Repository(Base):
    __tablename__ = "repositories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    changes: Mapped[list["Change"]] = relationship(back_populates="repository")

class Change(Base):
    __tablename__ = "changes"

    id: Mapped[int] = mapped_column(primary_key=True)
    change_id: Mapped[str | None] = mapped_column(String, index=True)
    commit_sha: Mapped[str | None] = mapped_column(String)
    category: Mapped[str | None] = mapped_column(String)
    criticality: Mapped[Criticality | None] = mapped_column(SqlEnum(Criticality))
    file_name: Mapped[str | None] = mapped_column(String)
    repository_id: Mapped[int] = mapped_column(ForeignKey("repositories.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    source: Mapped["ChangeSource"] = relationship(
        back_populates="changes",
        uselist=False,
        cascade="all, delete-orphan",
    )
    repository: Mapped["Repository"] = relationship(back_populates="changes")


class ChangeSource(Base):
    __tablename__ = "change_sources"

    id: Mapped[int] = mapped_column(primary_key=True)
    change_pk: Mapped[int] = mapped_column(ForeignKey("changes.id"), unique=True)
    diff: Mapped[str] = mapped_column(String)
    source: Mapped[str] = mapped_column(String)
    tree: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    changes: Mapped["Change"] = relationship(back_populates="source")
