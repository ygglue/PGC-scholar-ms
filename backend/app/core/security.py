import os
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from google.oauth2 import id_token
from google.auth.transport import requests as grequests

# Security settings
SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-development-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 8
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_google_token(token: str):
    try:
        idinfo = id_token.verify_oauth2_token(
            token, grequests.Request(), GOOGLE_CLIENT_ID
        )
        return idinfo
    except ValueError:
        # Invalid token
        return None
