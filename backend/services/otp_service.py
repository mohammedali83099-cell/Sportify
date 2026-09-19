import secrets
import time
import logging
from typing import Tuple, Optional, Dict, Any
from config import settings

logger = logging.getLogger("sportify.otp")

# Optional Redis support
try:
    import redis.asyncio as aioredis
except ImportError:
    aioredis = None


class OTPService:
    """
    High-performance, secure OTP storage and verification engine.
    Supports native Redis with automatic TTL and rate-limiting.
    Seamlessly falls back to an in-memory TTL dictionary for zero-setup local dev.
    """

    def __init__(self):
        self._redis_client = None
        self._memory_store: Dict[str, Dict[str, Any]] = {}

    async def _get_redis(self):
        if settings.REDIS_URL and aioredis:
            if self._redis_client is None:
                try:
                    self._redis_client = aioredis.from_url(
                        settings.REDIS_URL, decode_responses=True
                    )
                    await self._redis_client.ping()
                except Exception as e:
                    logger.warning(
                        f"Redis connection failed ({e}). Falling back to in-memory OTP store."
                    )
                    self._redis_client = None
            return self._redis_client
        return None

    def _make_key(self, email: str, purpose: str) -> str:
        clean_email = email.strip().lower()
        return f"otp:{purpose}:{clean_email}"

    def generate_code(self) -> str:
        """Generates a cryptographically random 6-digit numeric string."""
        return str(secrets.randbelow(900000) + 100000)

    async def can_send_otp(self, email: str, purpose: str) -> Tuple[bool, int]:
        """
        Checks if cooldown window has passed to prevent email spam.
        Returns: (can_send: bool, cooldown_seconds_remaining: int)
        """
        key = self._make_key(email, purpose)
        cooldown = settings.OTP_COOLDOWN_SECONDS
        redis = await self._get_redis()

        if redis:
            last_sent = await redis.get(f"{key}:cooldown")
            if last_sent:
                elapsed = time.time() - float(last_sent)
                if elapsed < cooldown:
                    return False, int(cooldown - elapsed)
            return True, 0

        # In-memory store
        record = self._memory_store.get(key)
        if record:
            elapsed = time.time() - record["created_at"]
            if elapsed < cooldown:
                return False, int(cooldown - elapsed)
        return True, 0

    async def store_otp(self, email: str, purpose: str, code: str) -> None:
        """Stores the generated OTP with an expiration TTL and cooldown marker."""
        key = self._make_key(email, purpose)
        ttl = settings.OTP_EXPIRE_MINUTES * 60
        now = time.time()
        redis = await self._get_redis()

        if redis:
            pipe = redis.pipeline()
            # Store code and attempt counter
            pipe.hset(key, mapping={"code": code, "attempts": "0"})
            pipe.expire(key, ttl)
            # Set cooldown marker
            pipe.set(f"{key}:cooldown", str(now), ex=settings.OTP_COOLDOWN_SECONDS)
            await pipe.execute()
            return

        # In-memory store
        self._memory_store[key] = {
            "code": code,
            "attempts": 0,
            "created_at": now,
            "expires_at": now + ttl,
        }

    async def verify_otp(self, email: str, purpose: str, candidate_code: str) -> Tuple[bool, str]:
        """
        Validates the candidate OTP code.
        Enforces 5-attempt brute-force protection and immediate consumption upon success.
        Returns: (is_valid: bool, message: str)
        """
        key = self._make_key(email, purpose)
        candidate = candidate_code.strip()
        max_attempts = settings.OTP_MAX_ATTEMPTS
        redis = await self._get_redis()

        if redis:
            record = await redis.hgetall(key)
            if not record or "code" not in record:
                return False, "Verification code has expired or was not requested. Please request a new code."

            actual_code = record["code"]
            attempts = int(record.get("attempts", "0")) + 1

            if secrets.compare_digest(actual_code, candidate):
                # Valid OTP - consume immediately (one-time use)
                await redis.delete(key)
                return True, "Verification successful."

            if attempts >= max_attempts:
                # Invalidate on excessive failed attempts
                await redis.delete(key)
                return False, "Too many failed attempts. This code is now invalid. Please request a new one."

            await redis.hset(key, "attempts", str(attempts))
            remaining = max_attempts - attempts
            return False, f"Incorrect verification code. {remaining} attempt(s) remaining."

        # In-memory store
        now = time.time()
        record = self._memory_store.get(key)
        if not record or now > record["expires_at"]:
            self._memory_store.pop(key, None)
            return False, "Verification code has expired or was not requested. Please request a new code."

        actual_code = record["code"]
        record["attempts"] += 1

        if secrets.compare_digest(actual_code, candidate):
            # Valid OTP - consume immediately (one-time use)
            self._memory_store.pop(key, None)
            return True, "Verification successful."

        if record["attempts"] >= max_attempts:
            self._memory_store.pop(key, None)
            return False, "Too many failed attempts. This code is now invalid. Please request a new one."

        remaining = max_attempts - record["attempts"]
        return False, f"Incorrect verification code. {remaining} attempt(s) remaining."


otp_service = OTPService()
