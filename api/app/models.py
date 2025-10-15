from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, date

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str
    email: Optional[str] = None
    hashed_password: Optional[str] = None
    role: str = Field(default="user")  # "user" or "admin"


class Destination(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    region: Optional[str] = None
    price: Optional[float] = None


class Reservation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    destination_id: int = Field(foreign_key="destination.id")
    people: int = Field(default=1)
    check_in: date
    check_out: date
    total_price: float
    created_at: datetime = Field(default_factory=datetime.utcnow)

