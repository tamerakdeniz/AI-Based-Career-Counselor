from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.database import SessionLocal, engine, Base
from app.models.user import User

Base.metadata.create_all(bind=engine)

app = FastAPI()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# DB session dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"message": "AI Mentör SQLite veritabanı ile çalışıyor."}


@app.post("/users/")
def create_user(
    name: str, email: str, password: str, role: str, db: Session = Depends(get_db)
):
    hashed = pwd_context.hash(password)  # Properly hash the password
    user = User(name=name, email=email, hashed_password=hashed, role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.get("/users/")
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()
