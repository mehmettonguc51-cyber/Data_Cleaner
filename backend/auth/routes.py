"""Auth routes: register, login, logout, me."""
import os
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from auth.models import User, get_db
from auth.schemas import UserCreate, UserLogin, UserRead
from auth.security import (
    COOKIE_NAME,
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])

# Cookie options: HttpOnly, SameSite for CSRF, Secure in production
IS_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"
SAME_SITE = "lax"
MAX_AGE_SECONDS = 24 * 3600  # 24 hours


@router.post("/register", response_model=UserRead)
def register(
    data: UserCreate,
    db: Annotated[Session, Depends(get_db)],
):
    """Register a new user. Username must be unique."""
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu kullanıcı adı zaten kullanılıyor.",
        )
    user = User(
        username=data.username,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login")
def login(
    data: UserLogin,
    response: Response,
    db: Annotated[Session, Depends(get_db)],
):
    """Login: validate credentials and set HttpOnly cookie with JWT."""
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı adı veya şifre hatalı.",
        )
    token = create_access_token(user.username)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=MAX_AGE_SECONDS,
        httponly=True,
        secure=IS_SECURE,
        samesite=SAME_SITE,
        path="/",
    )
    return {"success": True, "username": user.username}


@router.post("/logout")
def logout(response: Response):
    """Clear auth cookie."""
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"success": True}


@router.get("/me", response_model=UserRead)
def me(current_user: Annotated[User, Depends(get_current_user)]):
    """Return current user from cookie. Use for session check."""
    return current_user
