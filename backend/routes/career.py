from fastapi import APIRouter
from typing import List

from schemas.schemas import WhatIfRequest, WhatIfResponse
from services.scoring_service import career_readiness, whatif_simulation
from services.ai_service import generate_gap_explanation, generate_career_roadmap
from services.graph_service import get_graph
from seed_data import CAREER_ROLES

router = APIRouter(tags=["career"])


@router.get("/readiness")
async def get_career_readiness(target_role: str = "Full Stack Developer"):
    """Calculate career readiness score for a target role using REAL graph data."""
    role_data = CAREER_ROLES.get(target_role, CAREER_ROLES.get("Full Stack Developer", CAREER_ROLES[list(CAREER_ROLES.keys())[0]]))
    required = role_data["required"]

    # Implied skills — if you know X, you almost certainly know Y
    IMPLIED_SKILLS = {
        "React":        ["HTML", "CSS", "JavaScript"],
        "Next.js":      ["React", "HTML", "CSS", "JavaScript"],
        "Vue.js":       ["HTML", "CSS", "JavaScript"],
        "Angular":      ["HTML", "CSS", "TypeScript", "JavaScript"],
        "Svelte":       ["HTML", "CSS", "JavaScript"],
        "Node.js":      ["JavaScript"],
        "Express.js":   ["Node.js", "JavaScript"],
        "NestJS":       ["Node.js", "TypeScript"],
        "FastAPI":      ["Python"],
        "Django":       ["Python"],
        "Flask":        ["Python"],
        "Spring Boot":  ["Java"],
        "PyTorch":      ["Python"],
        "TensorFlow":   ["Python"],
        "scikit-learn": ["Python"],
        "Pandas":       ["Python"],
        "NumPy":        ["Python"],
        "React Native": ["React", "JavaScript"],
        "Flutter":      ["Dart"],
        "Tailwind CSS": ["CSS"],
        "SCSS":         ["CSS"],
        "TypeScript":   ["JavaScript"],
        "Docker":       ["Linux"],
        "Kubernetes":   ["Docker"],
    }

    # Get real graph data
    graph = get_graph()
    user_nodes = graph.get("nodes", [])
    user_skill_names_raw = [n["name"] for n in user_nodes if n.get("category") != "repo"]

    # Build expanded user skills set (lowercase for matching)
    user_skills_lower = set()
    for name in user_skill_names_raw:
        user_skills_lower.add(name.lower())
        # Also add implied skills
        for known, implies in IMPLIED_SKILLS.items():
            if name.lower() == known.lower():
                for imp in implies:
                    user_skills_lower.add(imp.lower())

    # Match required skills (case-insensitive)
    matched = [s for s in required if s.lower() in user_skills_lower]
    coverage = len(matched) / len(required) if required else 0

    # Average maturity of matched skills (find nodes case-insensitively)
    matched_nodes = [n for n in user_nodes if n["name"].lower() in {s.lower() for s in matched}]
    avg_maturity = (
        sum(n.get("maturity", 50) for n in matched_nodes) / len(matched_nodes)
        if matched_nodes
        else 0
    ) / 100

    # Market alignment
    market_scores = [n.get("market_demand", 70) for n in matched_nodes]
    market_alignment = (
        sum(market_scores) / len(market_scores) if market_scores else 0
    ) / 100

    # Project depth
    repo_count = len([n for n in user_nodes if n.get("category") == "repo"])
    project_depth = min(1.0, repo_count / 10)

    # Calculate real career readiness
    score = career_readiness(coverage, avg_maturity, market_alignment, project_depth)

    # Gaps — only skills NOT implied by what the user already knows
    missing = [s for s in required if s.lower() not in user_skills_lower]
    gaps = []
    for skill in missing[:5]:
        explanation = generate_gap_explanation(skill, target_role)
        gaps.append({
            "skill": skill,
            "priority": round(0.95 - len(gaps) * 0.08, 2),
            "reason": explanation,
        })

    return {
        "career_readiness": score,
        "target_role": target_role,
        "skill_coverage": round(coverage, 2),
        "avg_maturity": round(avg_maturity * 100, 1),
        "market_alignment": round(market_alignment * 100, 1),
        "total_skills": len(user_skill_names_raw),
        "matched_skills": matched,
        "gaps": gaps,
        "available_roles": list(CAREER_ROLES.keys()),
    }


@router.post("/whatif", response_model=WhatIfResponse)
async def what_if_simulation(req: WhatIfRequest):
    """Simulate adding skills and show how readiness score changes."""
    # Get the current real score
    graph = get_graph()
    user_nodes = graph.get("nodes", [])
    skill_count = len([n for n in user_nodes if n.get("category") != "repo"])
    # Approximate current score from graph data
    current_score = min(100, skill_count * 5.0) if skill_count > 0 else 30
    result = whatif_simulation(current_score, req.add_skills)
    return WhatIfResponse(**result)


@router.get("/roadmap")
async def get_roadmap(target_role: str = "Full Stack Developer"):
    """Generate a learning roadmap for a target career role."""
    graph = get_graph()
    current_skills = [n["name"] for n in graph.get("nodes", []) if n.get("category") != "repo"]

    # Get gaps
    role_data = CAREER_ROLES.get(target_role, CAREER_ROLES.get("Full Stack Developer", CAREER_ROLES[list(CAREER_ROLES.keys())[0]]))
    missing = [s for s in role_data["required"] if s not in current_skills]
    gaps = [{"skill": s, "priority": 0.8} for s in missing[:5]]

    roadmap = generate_career_roadmap(current_skills, target_role, gaps)
    return roadmap


@router.get("/roles")
async def list_roles():
    """List all available career roles."""
    return {
        "roles": [
            {
                "name": role,
                "required_count": len(data["required"]),
                "nice_to_have_count": len(data["nice_to_have"]),
            }
            for role, data in CAREER_ROLES.items()
        ]
    }
