"""Pydantic schemas for auth."""
from datetime import datetime

from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    username: str = Field(..., min_length=1, max_length=64)
    password: str = Field(..., min_length=8, max_length=128)


class UserLogin(BaseModel):
    username: str = Field(..., min_length=1, max_length=64)
    password: str = Field(..., min_length=1, max_length=128)


class UserRead(BaseModel):
    id: int
    username: str
    created_at: datetime | None = None

    model_config = {"from_attributes": True}
