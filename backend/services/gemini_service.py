import json
import logging
import re
from typing import Optional, Dict, Any

from config import settings

logger = logging.getLogger(__name__)


class GeminiService:
    """
    Service for invoking Google Gemini API with structured JSON outputs.
    Falls back gracefully to deterministic outputs if API key is not yet set or network fails.
    """

    def __init__(self):
        self._client = None

    def _get_client(self):
        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key == "your_gemini_api_key_here":
            return None
        if self._client is not None:
            return self._client
        try:
            from google import genai
            self._client = genai.Client(api_key=api_key)
            return self._client
        except Exception as e:
            logger.warning(f"Failed to initialize google.genai Client: {e}")
            return None

    def _call_model(
        self,
        target_model: str,
        prompt: str,
        system_instruction: Optional[str],
        temperature: float,
        api_key: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Attempts generation via direct REST API first (fastest, zero SDK sleep on 429),
        then falls back to SDK if REST fails with non-quota errors.
        """
        # 1. Primary: Direct REST API via httpx (fast, explicit timeout, no automatic retry delays)
        try:
            import httpx
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{target_model}:generateContent?key={api_key}"

            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": prompt}],
                    }
                ],
                "generationConfig": {
                    "responseMimeType": "application/json",
                    "temperature": temperature,
                },
            }
            if system_instruction:
                payload["systemInstruction"] = {
                    "parts": [{"text": system_instruction}]
                }

            with httpx.Client(timeout=4.0) as http_client:
                resp = http_client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            raw = parts[0].get("text", "").strip()
                            raw = re.sub(r"^```(?:json)?", "", raw, flags=re.MULTILINE).strip()
                            raw = re.sub(r"```$", "", raw, flags=re.MULTILINE).strip()
                            m = re.search(r"\{.*\}", raw, re.DOTALL)
                            if m:
                                return json.loads(m.group())
                elif resp.status_code == 429:
                    logger.info("Gemini quota exhausted (429). Fast-failing immediately to deterministic role baseline.")
                    return "QUOTA_EXHAUSTED"
                else:
                    logger.warning(f"Gemini REST error {resp.status_code} for {target_model}: {resp.text}")
        except Exception as e:
            logger.warning(f"Gemini REST call failed for {target_model}: {e}")

        # 2. Secondary: Official google.genai SDK
        try:
            from google.genai import types
            client = self._get_client()
            if client:
                config_args = {
                    "response_mime_type": "application/json",
                    "temperature": temperature,
                }
                if system_instruction:
                    config_args["system_instruction"] = system_instruction

                response = client.models.generate_content(
                    model=target_model,
                    contents=prompt,
                    config=types.GenerateContentConfig(**config_args),
                )
                if response and response.text:
                    raw = response.text.strip()
                    raw = re.sub(r"^```(?:json)?", "", raw, flags=re.MULTILINE).strip()
                    raw = re.sub(r"```$", "", raw, flags=re.MULTILINE).strip()
                    m = re.search(r"\{.*\}", raw, re.DOTALL)
                    if m:
                        return json.loads(m.group())
        except Exception as e:
            err_str = str(e)
            logger.warning(f"google.genai SDK error for model {target_model}: {e}")
            if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                return "QUOTA_EXHAUSTED"

        return None

    def generate_json(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.2,
    ) -> Optional[Dict[str, Any]]:
        """
        Generate structured JSON response using Gemini API.
        Fast-fails to deterministic baseline if quota is exhausted or API is unavailable.
        """
        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key == "your_gemini_api_key_here":
            logger.info("GEMINI_API_KEY not set. Using verified deterministic fallback.")
            return None

        primary_model = model or settings.GEMINI_MODEL or "gemini-3.6-flash"
        fallback_model = getattr(settings, "GEMINI_FALLBACK_MODEL", "gemini-2.5-flash")

        # Build candidate list with primary first, then fallback
        candidate_models = []
        for m in [primary_model, fallback_model]:
            if m and m not in candidate_models:
                candidate_models.append(m)

        for candidate in candidate_models:
            try:
                result = self._call_model(
                    target_model=candidate,
                    prompt=prompt,
                    system_instruction=system_instruction,
                    temperature=temperature,
                    api_key=api_key,
                )
                if result == "QUOTA_EXHAUSTED":
                    # Project quota exhausted across all models; return immediately without waiting
                    break
                if result is not None and isinstance(result, dict):
                    return result
            except Exception as e:
                logger.warning(f"Error invoking candidate model {candidate}: {e}")

        logger.info("Gemini generation skipped/failed. Using deterministic role baseline.")
        return None




gemini_service = GeminiService()
