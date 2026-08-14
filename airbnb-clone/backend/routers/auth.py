from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: str

@router.post("/login", response_model=schemas.User)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    print(f"DEBUG: login called for email={request.email}")
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        # Auto-create user for mock auth (treat email/phone as identifier)
        user = models.User(
            name="Guest User", 
            email=request.email,
            role="guest"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user
