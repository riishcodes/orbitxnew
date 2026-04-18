"""
OpenRouter API client — provides access to Grok and other models via OpenAI-compatible API.
"""

import httpx
from config import settings

OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions"


def chat_openrouter(
    system_prompt: str,
    user_message: str,
    model: str = "x-ai/grok-2-1212",
) -> str:
    """
    Send a chat completion request to OpenRouter.
    Returns the assistant's text response.
    Falls back to None if the key is missing or the call fails.
    """
    if not settings.openrouter_api_key:
        return None

    headers = {
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://orbitx.dev",
        "X-Title": "OrbitX",
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        "max_tokens": 1024,
        "temperature": 0.8,
    }

    try:
        with httpx.Client(timeout=30) as client:
            res = client.post(OPENROUTER_BASE, json=payload, headers=headers)
            if res.status_code == 200:
                data = res.json()
                return data["choices"][0]["message"]["content"].strip()
            else:
                print(f"WARN: OpenRouter returned {res.status_code}: {res.text[:200]}")
                return None
    except Exception as e:
        print(f"WARN: OpenRouter call failed: {e}")
        return None
