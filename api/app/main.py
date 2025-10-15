from fastapi import FastAPI, Depends, HTTPException, Header
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, select
from sqlmodel.ext.asyncio.session import AsyncSession
from .db import engine, get_session
from .models import User, Destination, Reservation
from datetime import date
import os
import jwt

app = FastAPI(title="explora-api")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


JWT_SECRET = os.environ.get("JWT_SECRET", os.environ.get("AUTH_JWT_SECRET", "devsecret"))


async def require_token(authorization: str | None = Header(default=None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid auth scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Malformed Authorization header")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def require_admin(authorization: str | None = Header(default=None)):
    payload = await require_token(authorization)
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return payload


class ReservationCreate(BaseModel):
    destination_id: int
    people: int = 1
    check_in: date
    check_out: date


class DestinationUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    region: str | None = None
    price: float | None = None


@app.on_event("startup")
async def on_startup():
    import asyncio
    # Wait for DB to be ready with retries
    retries = 12
    delay = 2
    for attempt in range(1, retries + 1):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(SQLModel.metadata.create_all)
            break
        except Exception:
            if attempt == retries:
                raise
            await asyncio.sleep(delay)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/destinations")
async def list_destinations(session: AsyncSession = Depends(get_session)):
    result = await session.exec(select(Destination))
    return result.all()


@app.post("/destinations")
async def create_destination(dest: Destination, session: AsyncSession = Depends(get_session), payload=Depends(require_admin)):
    # only admin users can create destinations
    session.add(dest)
    await session.commit()
    await session.refresh(dest)
    return dest


@app.patch("/destinations/{destination_id}")
async def update_destination(
    destination_id: int, 
    updates: DestinationUpdate, 
    session: AsyncSession = Depends(get_session), 
    payload=Depends(require_admin)
):
    # only admin users can update destinations
    q = select(Destination).where(Destination.id == destination_id)
    r = await session.exec(q)
    dest = r.first()
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    
    # Apply updates only for fields that were provided
    if updates.name is not None:
        dest.name = updates.name
    if updates.description is not None:
        dest.description = updates.description
    if updates.region is not None:
        dest.region = updates.region
    if updates.price is not None:
        dest.price = updates.price
    
    session.add(dest)
    await session.commit()
    await session.refresh(dest)
    return dest


@app.delete("/destinations/{destination_id}")
async def delete_destination(
    destination_id: int, 
    session: AsyncSession = Depends(get_session), 
    payload=Depends(require_admin)
):
    # only admin users can delete destinations
    q = select(Destination).where(Destination.id == destination_id)
    r = await session.exec(q)
    dest = r.first()
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    
    await session.delete(dest)
    await session.commit()
    return {"message": "Destination deleted successfully"}

@app.post("/reservations")
async def create_reservation(body: 'ReservationCreate', session: AsyncSession = Depends(get_session), payload=Depends(require_token)):
    # Validate dates
    if body.check_out <= body.check_in:
        raise HTTPException(status_code=400, detail="Check-out date must be after check-in date")
    
    # Ensure destination exists and get price
    q = select(Destination).where(Destination.id == body.destination_id)
    r = await session.exec(q)
    dest = r.first()
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    
    if not dest.price:
        raise HTTPException(status_code=400, detail="Destination has no price set")
    
    # Calculate total price: (price per person per day) * people * days
    days = (body.check_out - body.check_in).days
    total_price = dest.price * body.people * days
    
    res = Reservation(
        user_id=payload.get("user_id"), 
        destination_id=body.destination_id, 
        people=body.people,
        check_in=body.check_in,
        check_out=body.check_out,
        total_price=total_price
    )
    session.add(res)
    await session.commit()
    await session.refresh(res)
    return res


@app.get("/reservations")
async def list_reservations(session: AsyncSession = Depends(get_session), payload=Depends(require_token)):
    user_id = payload.get("user_id")
    result = await session.exec(select(Reservation).where(Reservation.user_id == user_id))
    return result.all()

