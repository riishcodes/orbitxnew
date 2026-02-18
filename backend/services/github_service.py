import httpx
from typing import List, Dict


GITHUB_API = "https://api.github.com"


async def fetch_repos(access_token: str) -> List[Dict]:
    """Fetch user's repositories sorted by last updated."""
    headers = {"Authorization": f"token {access_token}"}
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{GITHUB_API}/user/repos?per_page=50&sort=updated",
            headers=headers
        )
        return res.json()


async def fetch_readme(access_token: str, owner: str, repo: str) -> str:
    """Fetch raw README content (truncated to 2000 chars)."""
    headers = {
        "Authorization": f"token {access_token}",
        "Accept": "application/vnd.github.raw"
    }
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/readme",
            headers=headers
        )
        if res.status_code == 200:
            return res.text[:2000]
        return ""


async def fetch_commit_count(access_token: str, owner: str, repo: str) -> int:
    """Fetch recent commit count for a repo (since 2024-01-01)."""
    headers = {"Authorization": f"token {access_token}"}
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/commits?per_page=10&since=2024-01-01",
            headers=headers
        )
        commits = res.json()
        return len(commits) if isinstance(commits, list) else 0


async def fetch_languages(access_token: str, owner: str, repo: str) -> Dict:
    """Fetch language breakdown for a repo."""
    headers = {"Authorization": f"token {access_token}"}
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/languages",
            headers=headers
        )
        if res.status_code == 200:
            return res.json()
        return {}


def normalize_languages(languages: Dict) -> List[str]:
    """Sort languages by bytes and return top 5."""
    sorted_langs = sorted(languages.items(), key=lambda x: x[1], reverse=True)
    return [lang for lang, _ in sorted_langs[:5]]
