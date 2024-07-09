from dataclasses import dataclass, field
from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, LargeBinary, Boolean
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship, Mapped
from app.utils.db import db
import base64


@dataclass
class Users(db.Model):
    __tablename__ = "users"
    __table_args__ = {"schema": "pyrunner"}

    id: int = field(init=False)
    username: str
    password: str
    email: str
    role_id: int = None
    last_login: datetime = None
    created_by: str = None
    avatar: bytes = None
    fullname: str = None
    created_at: datetime = field(default_factory=lambda: datetime.utcnow())
    updated_at: datetime = field(default_factory=lambda: datetime.utcnow())

    id = Column(Integer, primary_key=True)
    username = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    fullname = Column(String(255))
    email = Column(String(255), unique=True, nullable=False)
    role_id = Column(Integer)
    last_login = Column(TIMESTAMP)
    created_by = Column(String(255))
    avatar = Column(LargeBinary)
    created_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    updated_at = Column(
        TIMESTAMP(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def get_sanitized(self):
        return {
            "id": self.id,
            "username": self.username,
            "fullname": self.fullname,
            "email": self.email,
            "role_id": self.role_id,
            "last_login": self.last_login,
            "created_by": self.created_by,
            "avatar": base64.b64encode(self.avatar).decode() if self.avatar else None,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    def get_claim(self):
        return {
            "role_id": self.role_id,
            "email": self.email,
            "id": self.id,
            "username": self.username,
            "fullname": self.fullname,
        }

    def get_claim_with_avatar(self):
        a = {
            "avatar": (base64.b64encode(self.avatar).decode() if self.avatar else None)
        }
        a.update(self.get_claim())

        return a


@dataclass
class Script(db.Model):
    __tablename__ = "script"
    __table_args__ = {"schema": "pyrunner"}

    id: int = field(init=False)
    user_id: int
    file_path: str
    status: str = None
    description: str = None
    instruction: str = None
    name: str = None
    code: str = None
    created_at: datetime = field(default_factory=lambda: datetime.utcnow())
    updated_at: datetime = field(default_factory=lambda: datetime.utcnow())
    label: str = None
    upload_required: bool = False
    is_active: bool = False
    user_full_name: str = None
    user: Mapped[Users] = None

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("pyrunner.users.id"))
    file_path = Column(Text, nullable=False)
    status = Column(String(50))
    description = Column(Text)
    instruction = Column(Text)
    name = Column(String(255))
    code = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    updated_at = Column(
        TIMESTAMP(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )
    label = Column(Text)
    upload_required = Column(Boolean, default=False)
    is_active = Column(Boolean, default=False)
    user_full_name = Column(Text)
    user = relationship("Users", backref="script")


@dataclass
class Execution(db.Model):
    __tablename__ = "execution"
    __table_args__ = {"schema": "pyrunner"}

    id: int = field(init=False)
    script_id: int
    user_id: int
    start_time: datetime = None
    end_time: datetime = None
    output: str = None
    status: str = None
    created_at: datetime = field(default_factory=lambda: datetime.utcnow())
    updated_at: datetime = field(default_factory=lambda: datetime.utcnow())
    task_id: str = None
    script_name: str = None
    id = Column(Integer, primary_key=True)
    script_id = Column(Integer, ForeignKey("pyrunner.script.id"))
    user_id = Column(Integer)
    start_time = Column(TIMESTAMP)
    end_time = Column(TIMESTAMP)
    output = Column(Text)
    status = Column(String(50))
    created_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    updated_at = Column(
        TIMESTAMP(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    task_id = Column(Text)
    script_name = Column(Text)

    def get_dict(self):
        return {
            "id": self.id,
            "script_id": self.script_id,
            "user_id": self.user_id,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "output": self.output,
            "status": self.status,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "task_id": self.task_id,
        }


@dataclass
class Favorite(db.Model):
    __tablename__ = "favorite"
    __table_args__ = {"schema": "pyrunner"}

    id: int = field(init=False)
    user_id: int
    script_id: int
    created_at: datetime = field(default_factory=lambda: datetime.utcnow())
    updated_at: datetime = field(default_factory=lambda: datetime.utcnow())

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    script_id = Column(Integer)
    created_at = Column(TIMESTAMP(timezone=True), default=datetime.utcnow)
    updated_at = Column(
        TIMESTAMP(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )
