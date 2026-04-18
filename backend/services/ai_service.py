import json
from typing import Dict, List

from config import settings

# Lazy-init Gemini model — only when API key is available
_model = None


def _get_model():
    global _model
    if _model is None and settings.gemini_api_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.gemini_api_key)
            # Try current model names in order
            for model_name in ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"]:
                try:
                    _model = genai.GenerativeModel(model_name)
                    # Quick test
                    _model.generate_content("test")
                    print(f"AI: Using model {model_name}")
                    break
                except Exception:
                    continue
        except Exception as e:
            print(f"WARN: Could not init Gemini: {e}")
    return _model


def extract_skills(
    source_type: str,
    name: str,
    languages: list,
    text: str,
    commits: int = 0,
) -> dict:
    """
    Extract skills from content using Gemini 1.5 Flash.
    Works for GitHub repos, Notion pages, and cert descriptions.
    """
    if settings.demo_mode or not settings.gemini_api_key:
        return _mock_extraction(name, languages)

    model = _get_model()
    if model is None:
        return _mock_extraction(name, languages)

    prompt = f"""You are a senior developer analyzing a {source_type} project to extract technologies, frameworks, and libraries that are ACTUALLY USED in this project.

Project: {name}
Languages detected: {languages}
Content (README + description):
\"\"\"
{text[:2000]}
\"\"\"
Activity: {commits} recent commits

STRICT RULES:
1. ONLY extract technologies that are CLEARLY AND EXPLICITLY mentioned as being used in this project.
2. DO NOT infer or guess technologies that are merely referenced in comparisons, alternatives, or "see also" sections.
3. If the README says "unlike Express" or "alternative to Django", do NOT extract Express or Django — those are comparisons, not actual usage.
4. Look for: "Built with", import statements, package.json/requirements.txt dependencies, Dockerfile references, config files mentioned, badges.
5. The detected languages list is RELIABLE — include those. But only add frameworks if there's clear evidence they're used.
6. Extract 3 to 12 skills — quality over quantity. Only include things you're confident about.
7. category MUST be one of: frontend, backend, ml, devops, database, mobile, concept
8. confidence is 0.5 to 1.0 — use 0.5 for loosely mentioned, 0.9+ for clearly core technologies

Return ONLY this JSON, no explanation, no markdown fences:
{{"skills": [{{"name": "string", "category": "string", "confidence": 0.0}}], "concepts": ["string"], "domain": "string"}}
"""
    try:
        response = model.generate_content(prompt)
        text_response = response.text.strip()
        # Clean markdown fences if model adds them
        text_response = text_response.replace("```json", "").replace("```", "").strip()
        result = json.loads(text_response)
        print(f"  AI extracted: {[s['name'] for s in result.get('skills', [])]}")
        return result
    except Exception as e:
        print(f"  WARN: Gemini extraction failed: {e}")
        return _mock_extraction(name, languages)


def generate_gap_explanation(skill_name: str, target_role: str) -> str:
    """Generate a one-sentence explanation of why a skill matters for a role."""
    if settings.demo_mode or not settings.gemini_api_key:
        return (
            f"{skill_name} is commonly required for {target_role} roles "
            f"and would strengthen your profile."
        )

    model = _get_model()
    if model is None:
        return f"{skill_name} is commonly required for {target_role} roles."

    prompt = (
        f"In one sentence, explain why {skill_name} is important for a "
        f"{target_role}. Be direct and practical."
    )
    try:
        return model.generate_content(prompt).text.strip()
    except Exception:
        return f"{skill_name} is commonly required for {target_role} roles."


def generate_career_roadmap(
    current_skills: List[str],
    target_role: str,
    gaps: List[Dict],
) -> dict:
    """Generate a learning roadmap for a target career role."""
    if settings.demo_mode or not settings.gemini_api_key:
        return _mock_roadmap(target_role, gaps)

    model = _get_model()
    if model is None:
        return _mock_roadmap(target_role, gaps)

    prompt = f"""
A student wants to become a {target_role}.
Their current skills: {current_skills}
Their skill gaps: {[g['skill'] for g in gaps]}

Generate a learning roadmap as JSON:
{{
  "phases": [
    {{
      "title": "Phase name",
      "duration": "estimated time",
      "skills": ["skill1", "skill2"],
      "resources": ["course or resource name"]
    }}
  ],
  "total_duration": "X months",
  "career_readiness_after": 85
}}

Return ONLY JSON, no explanation, no markdown. Generate 3-4 phases.
"""
    try:
        response = model.generate_content(prompt)
        text_response = response.text.strip()
        text_response = text_response.replace("```json", "").replace("```", "").strip()
        return json.loads(text_response)
    except Exception:
        return _mock_roadmap(target_role, gaps)


def _mock_extraction(name: str, languages: list) -> dict:
    """Fallback mock extraction when Gemini is unavailable."""
    lang_skill_map = {
        "JavaScript": {"name": "JavaScript", "category": "frontend", "confidence": 0.95},
        "TypeScript": {"name": "TypeScript", "category": "frontend", "confidence": 0.92},
        "Python":     {"name": "Python",     "category": "backend",  "confidence": 0.95},
        "CSS":        {"name": "CSS",        "category": "frontend", "confidence": 0.85},
        "Node.js":    {"name": "Node.js",    "category": "backend",  "confidence": 0.88},
        "Jupyter":    {"name": "Jupyter",    "category": "ml",       "confidence": 0.80},
        "React":      {"name": "React",      "category": "frontend", "confidence": 0.90},
        "FastAPI":    {"name": "FastAPI",    "category": "backend",  "confidence": 0.88},
        "HTML":       {"name": "HTML",       "category": "frontend", "confidence": 0.90},
        "Jupyter Notebook": {"name": "Jupyter", "category": "ml",   "confidence": 0.80},
    }
    skills = [lang_skill_map[lang] for lang in languages if lang in lang_skill_map]
    return {"skills": skills, "concepts": [], "domain": "fullstack"}


def _mock_roadmap(target_role: str, gaps: List[Dict]) -> dict:
    """Fallback mock roadmap data."""
    return {
        "phases": [
            {
                "title": "Foundation",
                "duration": "4 weeks",
                "skills": [g["skill"] for g in gaps[:2]] if gaps else ["Python"],
                "resources": [
                    "Coursera ML Specialization",
                    "Fast.ai Practical Deep Learning",
                ],
            },
            {
                "title": "Core Skills",
                "duration": "8 weeks",
                "skills": [g["skill"] for g in gaps[1:3]] if len(gaps) > 1 else ["PyTorch"],
                "resources": [
                    "PyTorch Official Tutorials",
                    "Kaggle Competitions",
                ],
            },
            {
                "title": "Production & Deployment",
                "duration": "4 weeks",
                "skills": ["Docker", "MLOps", "CI/CD"],
                "resources": [
                    "Docker Mastery on Udemy",
                    "MLOps Zoomcamp",
                ],
            },
        ],
        "total_duration": "4 months",
        "career_readiness_after": 82,
    }


# ═══════════════════════════════════════════════════════════
#  OFF-TOPIC VALIDATION
# ═══════════════════════════════════════════════════════════

_OFF_TOPIC_KEYWORDS = [
    "recipe", "cook", "food", "restaurant", "meal", "diet", "workout", "gym",
    "movie", "film", "series", "netflix", "music", "song", "lyrics",
    "politics", "election", "government", "president", "war", "country",
    "relationship", "girlfriend", "boyfriend", "dating", "love",
    "sports", "football", "cricket", "tennis", "basketball",
    "weather", "horoscope", "astrology", "religion", "god",
    "homework", "essay", "history", "geography", "biology", "chemistry",
    "stock market", "crypto", "bitcoin", "investment", "money",
]


def _is_off_topic(message: str) -> bool:
    """Fast check: is this message clearly off-topic for a tech career coach?"""
    msg_lower = message.lower()
    return any(kw in msg_lower for kw in _OFF_TOPIC_KEYWORDS)
