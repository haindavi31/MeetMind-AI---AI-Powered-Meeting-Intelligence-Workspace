
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )

    hashed_password = Column(
        String(255),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    meeting_id = Column(
        String(100),
        unique=True,
        index=True,
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    filename = Column(
        String(255),
        nullable=False
    )

    language = Column(
        String(20),
        nullable=True
    )

    transcript = Column(
        Text,
        nullable=True
    )

    summary = Column(
        Text,
        nullable=True
    )

    key_points = Column(
        Text,
        nullable=True
    )

    action_items = Column(
        Text,
        nullable=True
    )

    status = Column(
        String(50),
        default="uploaded",
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    analyzed_at = Column(
        DateTime(timezone=True),
        nullable=True
    )
