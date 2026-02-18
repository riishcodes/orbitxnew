from fastapi import APIRouter
from typing import List

from schemas.schemas import WhatIfRequest, WhatIfResponse
from services.scoring_service import whatif_simulation
from services.ai_service import generate_gap_explanation, generate_career_roadmap
from seed_data import DEMO_USER, DEMO_GAPS, DEMO_NODES, CAREER_ROLES

router = APIRouter(tags=["career"])


@router.get("/readiness")
async def get_career_readiness(target_role: str = "ML Engineer"):
    """Calculate career readiness score for a target role."""
    role_data = CAREER_ROLES.get(target_role, CAREER_ROLES["ML Engineer"])
    required = role_data["required"]

    # Check which required skills the user has
    user_skill_ids = [n["name"] for n in DEMO_NODES]
    matched = [s for s in required if s in user_skill_ids]
    coverage = len(matched) / len(required) if required else 0

    # Average maturity of matched skills
    matched_nodes = [n for n in DEMO_NODES if n["name"] in matched]
    avg_maturity = (
        sum(n["maturity"] for n in matched_nodes) / len(matched_nodes)
        if matched_nodes
        else 0
    ) / 100

    # Market alignment
    market_scores = [n.get("market_demand", 70) for n in matched_nodes]
    market_alignment = (
        sum(market_scores) / len(market_scores) if market_scores else 0
    ) / 100

    # Gaps
    missing = [s for s in required if s not in user_skill_ids]
    gaps = []
    for skill in missing:
        explanation = generate_gap_explanation(skill, target_role)
        gaps.append({
            "skill": skill,
            "priority": round(0.95 - len(gaps) * 0.08, 2),
            "reason": explanation,
        })

    return {
        "career_readiness": DEMO_USER["career_readiness"],
        "target_role": target_role,
        "skill_coverage": round(coverage, 2),
        "avg_maturity": round(avg_maturity * 100, 1),
        "market_alignment": round(market_alignment * 100, 1),
        "matched_skills": matched,
        "gaps": gaps if gaps else DEMO_GAPS,
        "available_roles": list(CAREER_ROLES.keys()),
    }


@router.post("/whatif", response_model=WhatIfResponse)
async def what_if_simulation(req: WhatIfRequest):
    """Simulate adding skills and show how readiness score changes."""
    result = whatif_simulation(DEMO_USER["career_readiness"], req.add_skills)
    return WhatIfResponse(**result)


@router.get("/roadmap")
async def get_roadmap(target_role: str = "ML Engineer"):
    """Generate a learning roadmap for a target career role."""
    current_skills = [n["name"] for n in DEMO_NODES]
    roadmap = generate_career_roadmap(current_skills, target_role, DEMO_GAPS)
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
