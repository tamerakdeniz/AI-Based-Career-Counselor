"""
Rate limiting service for AI API requests.
Provides rate limiting functionality with in-memory storage for development
and Redis support for production environments.
"""

import json
import logging
import time
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

from app.core.config import settings

logger = logging.getLogger(__name__)

@dataclass
class RateLimitInfo:
    """Information about rate limiting for a user"""
    requests_made: int
    requests_remaining: int
    reset_time: datetime
    is_limited: bool

class RateLimitService:
    """Service for handling rate limiting of AI requests"""
    
    def __init__(self):
        self.user_requests: Dict[int, List[datetime]] = defaultdict(list)
        self.redis_client: Optional[Any] = None
        self._initialize_redis()
    
    def _initialize_redis(self):
        """Initialize Redis client if available"""
        try:
            import redis
            import os

            # Get Redis configuration from environment variables
            redis_host = os.getenv('REDIS_HOST', 'localhost')
            redis_port = int(os.getenv('REDIS_PORT', '6379'))
            redis_db = int(os.getenv('REDIS_DB', '0'))

            self.redis_client = redis.Redis(
                host=redis_host,
                port=redis_port,
                db=redis_db,
                decode_responses=True
            )
            self.redis_client.ping()  # Test connection
            logger.info("Redis connected for rate limiting")
        except (ImportError, Exception) as e:
            logger.warning(f"Redis not available, using in-memory rate limiting: {e}")
            self.redis_client = None
    
    def check_rate_limit(self, user_id: int) -> RateLimitInfo:
        """Check if user has exceeded rate limits"""
        
        current_time = datetime.now()
        
        if self.redis_client:
            return self._check_rate_limit_redis(user_id, current_time)
        else:
            return self._check_rate_limit_memory(user_id, current_time)
    
    def _check_rate_limit_memory(self, user_id: int, current_time: datetime) -> RateLimitInfo:
        """Check rate limit using in-memory storage"""
        
        # Get user's request history
        user_requests = self.user_requests[user_id]
        
        # Clean old requests (older than 1 hour)
        one_hour_ago = current_time - timedelta(hours=1)
        user_requests[:] = [req_time for req_time in user_requests if req_time > one_hour_ago]
        
        # Check limits
        requests_made = len(user_requests)
        requests_remaining = max(0, settings.ai_requests_per_hour - requests_made)
        is_limited = requests_made >= settings.ai_requests_per_hour
        
        # Calculate reset time (next hour)
        reset_time = current_time.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
        
        return RateLimitInfo(
            requests_made=requests_made,
            requests_remaining=requests_remaining,
            reset_time=reset_time,
            is_limited=is_limited
        )
    
    def _check_rate_limit_redis(self, user_id: int, current_time: datetime) -> RateLimitInfo:
        """Check rate limit using Redis storage"""
        
        try:
            # Redis key for user requests
            key = f"rate_limit:user:{user_id}"
            
            # Get current requests count
            requests_made = self.redis_client.get(key)
            if requests_made is None:
                requests_made = 0
            else:
                requests_made = int(requests_made)
            
            # Check if limited
            is_limited = requests_made >= settings.ai_requests_per_hour
            requests_remaining = max(0, settings.ai_requests_per_hour - requests_made)
            
            # Calculate reset time (next hour)
            reset_time = current_time.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
            
            return RateLimitInfo(
                requests_made=requests_made,
                requests_remaining=requests_remaining,
                reset_time=reset_time,
                is_limited=is_limited
            )
            
        except Exception as e:
            logger.error(f"Redis rate limit check failed: {e}")
            # Fallback to memory-based rate limiting
            return self._check_rate_limit_memory(user_id, current_time)
    
    def increment_request_count(self, user_id: int) -> bool:
        """Increment request count for user. Returns True if successful, False if rate limited."""
        
        current_time = datetime.now()
        
        # Check current rate limit
        rate_limit_info = self.check_rate_limit(user_id)
        
        if rate_limit_info.is_limited:
            return False
        
        # Increment counter
        if self.redis_client:
            self._increment_redis(user_id, current_time)
        else:
            self._increment_memory(user_id, current_time)
        
        return True
    
    def _increment_memory(self, user_id: int, current_time: datetime):
        """Increment counter in memory"""
        self.user_requests[user_id].append(current_time)
    
    def _increment_redis(self, user_id: int, current_time: datetime):
        """Increment counter in Redis"""
        try:
            key = f"rate_limit:user:{user_id}"
            
            # Use Redis pipeline for atomic operations
            pipe = self.redis_client.pipeline()
            pipe.incr(key)
            pipe.expire(key, 3600)  # Expire after 1 hour
            pipe.execute()
            
        except Exception as e:
            logger.error(f"Redis increment failed: {e}")
            # Fallback to memory
            self._increment_memory(user_id, current_time)
    
    def get_rate_limit_headers(self, user_id: int) -> Dict[str, str]:
        """Get rate limit headers for HTTP responses"""
        
        rate_limit_info = self.check_rate_limit(user_id)
        
        return {
            "X-RateLimit-Limit": str(settings.ai_requests_per_hour),
            "X-RateLimit-Remaining": str(rate_limit_info.requests_remaining),
            "X-RateLimit-Reset": str(int(rate_limit_info.reset_time.timestamp())),
            "X-RateLimit-Window": "3600"  # 1 hour in seconds
        }
    
    def reset_user_rate_limit(self, user_id: int) -> bool:
        """Reset rate limit for a user (admin function)"""
        
        try:
            if self.redis_client:
                key = f"rate_limit:user:{user_id}"
                self.redis_client.delete(key)
            else:
                if user_id in self.user_requests:
                    del self.user_requests[user_id]
            
            logger.info(f"Rate limit reset for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to reset rate limit for user {user_id}: {e}")
            return False
    
    def get_global_stats(self) -> Dict[str, int]:
        """Get global rate limiting statistics"""
        
        if self.redis_client:
            return self._get_redis_stats()
        else:
            return self._get_memory_stats()
    
    def _get_memory_stats(self) -> Dict[str, int]:
        """Get statistics from memory storage"""
        
        current_time = datetime.now()
        one_hour_ago = current_time - timedelta(hours=1)
        
        total_users = len(self.user_requests)
        total_requests = 0
        active_users = 0
        
        for user_id, requests in self.user_requests.items():
            # Filter recent requests
            recent_requests = [req for req in requests if req > one_hour_ago]
            total_requests += len(recent_requests)
            
            if recent_requests:
                active_users += 1
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "total_requests": total_requests,
            "requests_per_hour_limit": settings.ai_requests_per_hour
        }
    
    def _get_redis_stats(self) -> Dict[str, int]:
        """Get statistics from Redis storage"""
        
        try:
            # Get all rate limit keys
            keys = self.redis_client.keys("rate_limit:user:*")
            
            total_users = len(keys)
            total_requests = 0
            active_users = 0
            
            for key in keys:
                count = self.redis_client.get(key)
                if count:
                    count = int(count)
                    total_requests += count
                    if count > 0:
                        active_users += 1
            
            return {
                "total_users": total_users,
                "active_users": active_users,
                "total_requests": total_requests,
                "requests_per_hour_limit": settings.ai_requests_per_hour
            }
            
        except Exception as e:
            logger.error(f"Failed to get Redis stats: {e}")
            return self._get_memory_stats()

# Global instance
rate_limit_service = RateLimitService() 