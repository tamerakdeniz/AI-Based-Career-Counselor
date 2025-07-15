from datetime import datetime
from typing import List

from app.api.routes_ai import router as ai_router
from app.api.routes_auth import router as auth_router
from app.api.routes_chat import router as chat_router
from app.api.routes_roadmap import router as roadmap_router
from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from app.database import Base, SessionLocal, engine
from app.models.user import User
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Pathyvo - AI Career Counselor",
    description="AI-powered career mentorship platform with personalized roadmaps",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(auth_router)
app.include_router(roadmap_router)
app.include_router(chat_router)
app.include_router(ai_router)


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Pydantic Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    avatar: str | None = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    avatar: str | None = None
    password: str | None = None


class UserResponse(UserBase):
    id: int
    joined_at: datetime

    class Config:
        orm_mode = True


@app.get("/")
def root():
    return {"message": "AI Mentör SQLite veritabanı ile çalışıyor."}


@app.post("/users/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    new_user = User(
        name=user.name,
        email=user.email,
        avatar=user.avatar,
        hashed_password=hashed_password,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.get("/users/", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.put("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user_update.name is not None:
        setattr(user, 'name', str(user_update.name))
    if user_update.email is not None:
        # Check for duplicate email
        if (
            db.query(User)
            .filter(User.email == user_update.email, User.id != user_id)
            .first()
        ):
            raise HTTPException(status_code=400, detail="Email already registered")
        setattr(user, 'email', str(user_update.email))
    if user_update.avatar is not None:
        setattr(user, 'avatar', str(user_update.avatar) if user_update.avatar else None)
    if user_update.password is not None:
        setattr(user, 'hashed_password', get_password_hash(user_update.password))
    db.commit()
    db.refresh(user)
    return user


@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"ok": True}
