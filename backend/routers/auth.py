from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import os
import bcrypt
from datetime import datetime, timedelta
from jose import jwt, JWTError
from typing import Optional

from database import get_db
from models.athlete import Athlete
from schemas.athlete import (
    AthleteCreate,
    AthleteResponse,
    Token,
    AthleteLogin,
    SendOTPRequest,
    VerifyOTPRequest,
    OTPResponse,
)
from config import settings
from services.email_service import email_service
from services.otp_service import otp_service

router = APIRouter(prefix="/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8")[:72],
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8")[:72], salt).decode("utf-8")


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


async def get_current_athlete(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    clean_email = email.strip().lower()
    result = await db.execute(select(Athlete).filter(func.lower(Athlete.email) == clean_email))
    athlete = result.scalars().first()
    if athlete is None:
        raise credentials_exception
    return athlete


@router.post("/send-otp", response_model=OTPResponse)
async def send_otp(
    payload: SendOTPRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    clean_email = payload.email.strip().lower()

    # Rate limiting & cooldown check
    can_send, remaining = await otp_service.can_send_otp(clean_email, payload.purpose)
    if not can_send:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Please wait {remaining} seconds before requesting a new verification code.",
        )

    # Validate based on purpose
    result = await db.execute(select(Athlete).filter(func.lower(Athlete.email) == clean_email))
    existing_athlete = result.scalars().first()

    if payload.purpose == "registration" and existing_athlete:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is already registered. Please sign in instead.",
        )

    if payload.purpose == "login" and not existing_athlete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No athlete account found with this email. Please register first.",
        )

    # Generate and store OTP
    code = otp_service.generate_code()
    await otp_service.store_otp(clean_email, payload.purpose, code)

    # Dispatch email asynchronously in the background so the HTTP request returns instantly
    background_tasks.add_task(email_service.send_otp, clean_email, code, payload.purpose)

    response_data = {
        "message": f"A 6-digit verification code has been dispatched to {clean_email}.",
        "cooldown_seconds": settings.OTP_COOLDOWN_SECONDS,
    }
    resend_key = (settings.RESEND_API_KEY or os.getenv("RESEND_API_KEY", "")).strip()
    if not resend_key:
        response_data["dev_code"] = code

    return response_data


@router.post("/verify-otp", response_model=Token)
async def verify_otp(
    payload: VerifyOTPRequest,
    db: AsyncSession = Depends(get_db),
):
    clean_email = payload.email.strip().lower()

    # Verify code against store
    is_valid, message = await otp_service.verify_otp(clean_email, payload.purpose, payload.otp)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

    result = await db.execute(select(Athlete).filter(func.lower(Athlete.email) == clean_email))
    athlete = result.scalars().first()

    if payload.purpose == "registration":
        if athlete:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered. Please sign in.",
            )
        if not payload.full_name or not payload.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Full name and password are required to complete registration.",
            )

        new_athlete = Athlete(
            email=clean_email,
            full_name=payload.full_name.strip(),
            hashed_password=get_password_hash(payload.password),
            is_verified=True,
        )
        db.add(new_athlete)
        await db.commit()
        await db.refresh(new_athlete)

        access_token = create_access_token(data={"sub": new_athlete.email})
        return {"access_token": access_token, "token_type": "bearer"}

    # Purpose: Login
    if not athlete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No athlete account found with this email. Please register.",
        )

    if not athlete.is_verified:
        athlete.is_verified = True
        await db.commit()

    access_token = create_access_token(data={"sub": athlete.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", response_model=Token)
async def register(athlete: AthleteCreate, db: AsyncSession = Depends(get_db)):
    clean_email = athlete.email.strip().lower()
    result = await db.execute(select(Athlete).filter(func.lower(Athlete.email) == clean_email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_athlete = Athlete(
        email=clean_email,
        hashed_password=get_password_hash(athlete.password),
        full_name=athlete.full_name.strip() if athlete.full_name else "",
        is_verified=True,
    )
    db.add(new_athlete)
    await db.commit()
    await db.refresh(new_athlete)

    access_token = create_access_token(data={"sub": new_athlete.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
async def login(
    login_data: Optional[AthleteLogin] = None,
    form_data: Optional[OAuth2PasswordRequestForm] = Depends(lambda: None),
    db: AsyncSession = Depends(get_db),
):
    # Support both JSON payload and Form data
    email = None
    password = None

    if login_data and login_data.email:
        email = login_data.email
        password = login_data.password
    elif form_data and form_data.username:
        email = form_data.username
        password = form_data.password

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")

    clean_email = email.strip().lower()
    result = await db.execute(select(Athlete).filter(func.lower(Athlete.email) == clean_email))
    athlete = result.scalars().first()
    if not athlete or not verify_password(password, athlete.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = create_access_token(data={"sub": athlete.email})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=AthleteResponse)
async def read_users_me(current_athlete: Athlete = Depends(get_current_athlete)):
    return current_athlete
