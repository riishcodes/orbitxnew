from fastapi import APIRouter

from seed_data import DEMO_USER, DEMO_NODES

router = APIRouter(tags=["recruiter"])


@router.get("/profile")
async def get_recruiter_profile():
    """Generate recruiter evaluation profile for the current user."""
    nodes = DEMO_NODES

    # Skill distribution by category
    distribution = {}
    for node in nodes:
        cat = node.get("category", "other")
        distribution[cat] = distribution.get(cat, 0) + 1

    # Top skills by maturity
    top_skills = sorted(nodes, key=lambda n: n.get("maturity", 0), reverse=True)[:5]

    # Average maturity
    maturities = [n.get("maturity", 0) for n in nodes]
    avg_maturity = round(sum(maturities) / len(maturities), 1) if maturities else 0

    # Market alignment average
    demands = [n.get("market_demand", 0) for n in nodes]
    avg_demand = round(sum(demands) / len(demands), 1) if demands else 0

    # Project depth (how many distinct sources)
    sources = set(n.get("source", "github") for n in nodes)
    project_depth = round(len(sources) / 3 * 100, 1)  # max 3 sources

    # Risk areas — skills with low maturity but high demand
    risk_areas = [
        n["name"]
        for n in nodes
        if n.get("maturity", 0) < 50 and n.get("market_demand", 0) > 75
    ]

    # Radar chart data (for frontend)
    radar_data = [
        {"axis": "Frontend",  "value": _avg_category(nodes, "frontend")},
        {"axis": "Backend",   "value": _avg_category(nodes, "backend")},
        {"axis": "ML/AI",     "value": _avg_category(nodes, "ml")},
        {"axis": "DevOps",    "value": _avg_category(nodes, "devops")},
        {"axis": "Database",  "value": _avg_category(nodes, "database")},
        {"axis": "Concepts",  "value": _avg_category(nodes, "concept")},
    ]

    return {
        "name": DEMO_USER["name"],
        "username": DEMO_USER["username"],
        "target_role": DEMO_USER["target_role"],
        "career_readiness": DEMO_USER["career_readiness"],
        "skill_maturity_avg": avg_maturity,
        "project_depth": project_depth,
        "market_alignment": avg_demand,
        "risk_areas": risk_areas,
        "top_skills": [
            {"name": s["name"], "maturity": s["maturity"], "category": s["category"]}
            for s in top_skills
        ],
        "skill_distribution": distribution,
        "radar_data": radar_data,
        "total_skills": len(nodes),
        "total_sources": len(sources),
    }


def _avg_category(nodes: list, category: str) -> float:
    """Average maturity for a skill category."""
    cat_nodes = [n for n in nodes if n.get("category") == category]
    if not cat_nodes:
        return 0
    return round(sum(n.get("maturity", 0) for n in cat_nodes) / len(cat_nodes), 1)
