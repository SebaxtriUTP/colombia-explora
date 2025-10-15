from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import jwt
import os
from datetime import datetime, timedelta
from passlib.context import CryptContext
from .db import engine, get_session
from .models import User
from sqlmodel import SQLModel, select
from sqlmodel.ext.asyncio.session import AsyncSession

app = FastAPI(title="explora-auth")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET = os.environ.get("JWT_SECRET", "devsecret")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class RegisterRequest(BaseModel):
    username: str
    email: str | None = None
    password: str


class TokenRequest(BaseModel):
    username: str
    password: str


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
            # Create default admin user if it doesn't exist
            async with AsyncSession(engine) as session:
                q = select(User).where(User.username == "admin")
                r = await session.exec(q)
                admin = r.first()
                if not admin:
                    hashed = pwd_context.hash("admin123")
                    admin = User(username="admin", email="admin@explora.com", hashed_password=hashed, role="admin")
                    session.add(admin)
                    await session.commit()
            break
        except Exception as exc:
            if attempt == retries:
                raise
            await asyncio.sleep(delay)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/register")
async def register(req: RegisterRequest, session: AsyncSession = Depends(get_session)):
    q = select(User).where(User.username == req.username)
    r = await session.exec(q)
    existing = r.first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed = pwd_context.hash(req.password)
    user = User(username=req.username, email=req.email, hashed_password=hashed)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return {"id": user.id, "username": user.username}


@app.post("/token")
async def token(req: TokenRequest, session: AsyncSession = Depends(get_session)):
    q = select(User).where(User.username == req.username)
    r = await session.exec(q)
    user = r.first()
    if not user or not pwd_context.verify(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    now = datetime.utcnow()
    payload = {
        "sub": user.username,
        "user_id": user.id,
        "role": user.role,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=4)).timestamp()),
    }
    token = jwt.encode(payload, SECRET, algorithm="HS256")
    return {"access_token": token}


@app.get("/verify")
async def verify(token: str = ""):
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        return {"valid": True, "sub": payload.get("sub"), "user_id": payload.get("user_id")}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
