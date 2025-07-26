import html
import re

from app.core.config import settings
from app.models.user import User
from app.services.rate_limit_service import RateLimitService
from fastapi import Depends, HTTPException, Request, status
from fastapi.responses import Response
from passlib.context import CryptContext
from starlette.middleware.base import BaseHTTPMiddleware

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
rate_limit_service = RateLimitService()

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)



class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    """Middleware to limit request size and prevent large payload attacks"""
    
    async def dispatch(self, request: Request, call_next):
        # Check content length
        content_length = request.headers.get("content-length")
        if content_length:
            content_length = int(content_length)
            if content_length > settings.max_request_size:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"Request too large. Maximum size is {settings.max_request_size} bytes."
                )
        
        response = await call_next(request)
        return response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware to add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' https:; "
            "connect-src 'self';"
        )
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        return response

def validate_and_sanitize_input(text: str, max_length: int = 2000) -> str:
    """Validate and sanitize user input to prevent injection attacks"""
    if not text:
        return ""
    
    # Check length
    if len(text) > max_length:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Input too long. Maximum {max_length} characters allowed."
        )
    
    # Basic HTML escaping to prevent XSS
    sanitized_text = html.escape(text)
    
    # Remove potentially dangerous patterns
    dangerous_patterns = [
        r'<script.*?>.*?</script>',
        r'javascript:',
        r'vbscript:',
        r'on\w+\s*=',
        r'data:text/html',
    ]
    
    for pattern in dangerous_patterns:
        sanitized_text = re.sub(pattern, '', sanitized_text, flags=re.IGNORECASE | re.DOTALL)
    
    return sanitized_text.strip()

def validate_roadmap_field(field: str) -> str:
    """Validate career field input"""
    if not field:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Career field is required"
        )
    
    # Allow only alphanumeric characters, spaces, hyphens, and underscores
    if not re.match(r'^[a-zA-Z0-9\s\-_]+$', field):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid career field format"
        )
    
    return validate_and_sanitize_input(field, max_length=100)
