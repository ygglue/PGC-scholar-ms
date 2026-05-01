from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import SECRET_KEY, ALGORITHM
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_token_from_request(request: Request) -> str | None:
    """Extract token from Authorization header or cookie."""
    # Try Authorization header first
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:]
    
    # Try cookie
    return request.cookies.get("access_token")

def get_current_user(request: Request = None, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Get token from request
    token = None
    if request:
        token = get_token_from_request(request)
    else:
        # Fallback: try OAuth2 scheme (for backward compatibility)
        token = Depends(oauth2_scheme)
        # This won't work with the new setup, so we need proper handling
        # We'll handle this by making the token parameter optional
        pass
    
    if not token:
        raise credentials_exception
        
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user

# Updated dependency that works with both header and cookie
def get_current_user_from_request(request: Request, db: Session = Depends(get_db)):
    token = get_token_from_request(request)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
        
    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    return user

# Use the new function as the default
get_current_user = get_current_user_from_request

def get_current_scholar(current_user: User = Depends(get_current_user)):
    if current_user.role != "scholar":
        raise HTTPException(status_code=403, detail="Scholars only")
    return current_user

def get_current_evaluator(current_user: User = Depends(get_current_user)):
    if current_user.role not in ["evaluator", "admin"]:
        raise HTTPException(status_code=403, detail="Evaluators only")
    return current_user