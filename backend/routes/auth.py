from fastapi import APIRouter, HTTPException
import httpx
from jose import jwt
from datetime import datetime, timedelta

from config import settings
from schemas.schemas import GitHubLoginRequest, TokenResponse
from seed_data import DEMO_USER

router = APIRouter(tags=["auth"])

GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"


@router.post("/github", response_model=TokenResponse)
async def github_login(payload: GitHubLoginRequest):
    """Exchange GitHub OAuth code for access token and return JWT."""
    if settings.demo_mode:
        token = _create_jwt(DEMO_USER)
        return TokenResponse(access_token=token, user=DEMO_USER)

    # Exchange code for GitHub access token
    async with httpx.AsyncClient() as client:
        res = await client.post(
            GITHUB_TOKEN_URL,
            json={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": payload.code,
            },
            headers={"Accept": "application/json"},
        )

    token_data = res.json()
    gh_token = token_data.get("access_token")
    if not gh_token:
        raise HTTPException(status_code=400, detail="Failed to get GitHub token")

    # Fetch user profile
    async with httpx.AsyncClient() as client:
        user_res = await client.get(
            GITHUB_USER_URL,
            headers={"Authorization": f"token {gh_token}"},
        )

    user_data = user_res.json()
    user = {
        "name": user_data.get("name", user_data.get("login")),
        "username": user_data.get("login"),
        "avatar": user_data.get("avatar_url", ""),
        "github_token": gh_token,
    }

    token = _create_jwt(user)
    return TokenResponse(access_token=token, user=user)


@router.get("/me")
async def get_current_user():
    """Return demo user for now — extend with JWT decode in production."""
    return DEMO_USER


def _create_jwt(user: dict) -> str:
    """Create a signed JWT token."""
    payload = {
        "sub": user.get("username", "demo"),
        "name": user.get("name", "Demo User"),
        "exp": datetime.utcnow() + timedelta(hours=24),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")
