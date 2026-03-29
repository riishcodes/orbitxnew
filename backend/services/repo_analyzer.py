"""
Analyze a single public GitHub repository without authentication.
Uses the public GitHub API (60 req/hr unauthenticated).
"""

import re
import httpx
from typing import Dict, List, Any, Tuple

from services.ai_service import extract_skills as ai_extract_skills
from services.tech_directory import match_technologies, TECH_DIRECTORY
from services.market_data import get_market_demand
from config import settings


GITHUB_API = "https://api.github.com"


def _github_headers() -> dict:
    """Build headers for GitHub API requests (authenticated if token available)."""
    headers = {"Accept": "application/vnd.github.mercy-preview+json"}
    if settings.github_token:
        headers["Authorization"] = f"token {settings.github_token}"
    return headers


def parse_github_url(url: str) -> Tuple[str, str]:
    """
    Extract owner and repo name from a GitHub URL.
    Supports: https://github.com/owner/repo, github.com/owner/repo, owner/repo
    """
    url = url.strip().rstrip("/")
    # Remove .git suffix if present
    if url.endswith(".git"):
        url = url[:-4]

    # Match github.com/owner/repo pattern
    match = re.match(r"(?:https?://)?(?:www\.)?github\.com/([^/]+)/([^/]+)", url)
    if match:
        return match.group(1), match.group(2)

    # Try owner/repo pattern directly
    match = re.match(r"^([^/]+)/([^/]+)$", url)
    if match:
        return match.group(1), match.group(2)

    raise ValueError(f"Invalid GitHub URL: {url}")


async def _fetch_repo_info(owner: str, repo: str) -> Dict:
    """Fetch public repo metadata."""
    async with httpx.AsyncClient(timeout=15) as client:
        res = await client.get(f"{GITHUB_API}/repos/{owner}/{repo}", headers=_github_headers())
        if res.status_code != 200:
            raise ValueError(f"Repository not found: {owner}/{repo} (status {res.status_code})")
        return res.json()


async def _fetch_readme_public(owner: str, repo: str) -> str:
    """Fetch raw README from a public repo."""
    headers = _github_headers()
    headers["Accept"] = "application/vnd.github.raw"
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            res = await client.get(f"{GITHUB_API}/repos/{owner}/{repo}/readme", headers=headers)
            if res.status_code == 200:
                return res.text[:3000]
        except Exception:
            pass
    return ""


async def _fetch_languages_public(owner: str, repo: str) -> Dict:
    """Fetch language breakdown from a public repo."""
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            res = await client.get(f"{GITHUB_API}/repos/{owner}/{repo}/languages", headers=_github_headers())
            if res.status_code == 200:
                return res.json()
        except Exception:
            pass
    return {}


def _maturity_from_stars(stars: int) -> int:
    if stars >= 50:
        return 95
    elif stars >= 20:
        return 85
    elif stars >= 5:
        return 70
    elif stars >= 1:
        return 55
    return 40


async def analyze_public_repo(url: str) -> Dict[str, Any]:
    """
    Analyze a single public GitHub repo and return knowledge graph data.
    Returns { nodes: [...], links: [...] }
    """
    owner, repo_name = parse_github_url(url)
    print(f"ANALYZE: fetching {owner}/{repo_name}...")

    # Fetch repo info, README, and languages in parallel-ish
    repo_info = await _fetch_repo_info(owner, repo_name)
    readme = await _fetch_readme_public(owner, repo_name)
    repo_languages = await _fetch_languages_public(owner, repo_name)

    stars = repo_info.get("stargazers_count", 0)
    forks = repo_info.get("forks_count", 0)
    description = repo_info.get("description") or ""
    topics = repo_info.get("topics", [])
    primary_lang = repo_info.get("language")
    all_lang_names = list(repo_languages.keys())

    nodes: List[Dict] = []
    links: List[Dict] = []
    seen_ids: set = set()
    skill_usage: Dict[str, Dict] = {}

    def register_skill(skill_id: str, name: str, category: str, confidence: float):
        if skill_id not in skill_usage:
            skill_usage[skill_id] = {
                "name": name, "category": category,
                "confidence": confidence, "count": 0, "total_stars": 0,
            }
        skill_usage[skill_id]["count"] += 1
        skill_usage[skill_id]["total_stars"] += stars
        if confidence > skill_usage[skill_id]["confidence"]:
            skill_usage[skill_id]["confidence"] = confidence

    def add_node(n: Dict):
        if n["id"] not in seen_ids:
            nodes.append(n)
            seen_ids.add(n["id"])

    def compute_maturity(skill_id: str) -> int:
        info = skill_usage.get(skill_id)
        if not info:
            return 50
        base = int(info["confidence"] * 50)
        usage_bonus = min(30, info["count"] * 10)
        star_bonus = min(20, info["total_stars"] * 3)
        return min(100, base + usage_bonus + star_bonus)

    # ── Create repo node ──
    repo_id = f"repo:{repo_name}"
    add_node({
        "id": repo_id,
        "name": repo_name,
        "category": "repo",
        "maturity": _maturity_from_stars(stars),
        "market_demand": min(100, 50 + stars * 2 + forks * 3),
        "source": "github",
        "val": max(4, min(15, 4 + stars * 0.5)),
    })

    # Register primary language
    if primary_lang:
        lang_id = primary_lang.lower()
        lang_cat = TECH_DIRECTORY[primary_lang][0] if primary_lang in TECH_DIRECTORY else "language"
        register_skill(lang_id, primary_lang, lang_cat, 0.9)
        links.append({
            "source": repo_id, "target": lang_id,
            "type": "WRITTEN_IN", "strength": 0.9,
        })

    # Register all detected languages
    for rl in all_lang_names:
        rl_id = rl.lower()
        rl_cat = TECH_DIRECTORY[rl][0] if rl in TECH_DIRECTORY else "language"
        register_skill(rl_id, rl, rl_cat, 0.8)
        links.append({
            "source": repo_id, "target": rl_id,
            "type": "WRITTEN_IN", "strength": 0.7,
        })

    # Register topics
    for topic in topics:
        topic_id = topic.lower().replace(" ", "-")
        canonical = topic.replace("-", " ").title()
        category = "concept"
        for tech_name, (cat, aliases) in TECH_DIRECTORY.items():
            if topic_id in aliases or topic in aliases:
                canonical = tech_name
                category = cat
                break
        register_skill(topic_id, canonical, category, 0.75)
        links.append({
            "source": repo_id, "target": topic_id,
            "type": "TAGGED", "strength": 0.8,
        })

    # ── Tech Directory Scan ──
    combined_text = f"{description}\n{' '.join(topics)}\n{' '.join(all_lang_names)}\n{readme}"
    directory_matches = match_technologies(combined_text)
    print(f"  ANALYZE: directory matched {len(directory_matches)} technologies")

    # ── AI extraction ──
    ai_result = ai_extract_skills(
        source_type="github",
        name=repo_name,
        languages=all_lang_names if all_lang_names else ([primary_lang] if primary_lang else []),
        text=combined_text,
        commits=repo_info.get("open_issues_count", 0),
    )

    ai_skills: List[Dict] = []
    if ai_result and ai_result.get("skills"):
        ai_skills = ai_result["skills"]
        for concept in ai_result.get("concepts", []):
            ai_skills.append({"name": concept, "category": "concept", "confidence": 0.6})
        print(f"  ANALYZE: AI extracted {len(ai_skills)} additional skills")

    # ── Merge all extracted skills ──
    all_skills: Dict[str, Dict] = {}
    for s in directory_matches:
        key = s["name"].lower()
        if key not in all_skills:
            all_skills[key] = s
    for s in ai_skills:
        key = s["name"].lower()
        if key not in all_skills:
            all_skills[key] = s
        elif s.get("confidence", 0) > all_skills[key].get("confidence", 0):
            all_skills[key]["confidence"] = s["confidence"]

    # ── Register all extracted skills + create links ──
    for skill_info in all_skills.values():
        skill_name = skill_info["name"]
        skill_id = skill_name.lower().replace(" ", "-").replace(".", "").replace("/", "")
        category = skill_info.get("category", "concept")
        confidence = skill_info.get("confidence", 0.5)

        register_skill(skill_id, skill_name, category, confidence)

        links.append({
            "source": repo_id, "target": skill_id,
            "type": "USES", "strength": round(confidence, 2),
        })

        if primary_lang:
            lang_id = primary_lang.lower()
            if skill_id != lang_id:
                links.append({
                    "source": lang_id, "target": skill_id,
                    "type": "USED_WITH", "strength": 0.5,
                })

    # ── Create skill nodes with dynamic maturity ──
    for skill_id, info in skill_usage.items():
        maturity = compute_maturity(skill_id)
        add_node({
            "id": skill_id,
            "name": info["name"],
            "category": info["category"],
            "maturity": maturity,
            "market_demand": get_market_demand(info["name"]),
            "source": "github",
            "val": max(4, maturity / 10),
        })

    print(f"ANALYZE: done — {len(nodes)} nodes, {len(links)} links")
    return {"nodes": nodes, "links": links}
