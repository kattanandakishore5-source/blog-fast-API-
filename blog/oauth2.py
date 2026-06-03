from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from . import token as token_module

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    return token_module.verify_token(token, credentials_exception)