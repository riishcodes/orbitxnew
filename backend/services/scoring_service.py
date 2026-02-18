from typing import List, Dict


def skill_maturity(
    commit_recency: float,
    commit_frequency: float,
    project_diversity: float,
    co_occurrence: float,
    ai_confidence: float,
) -> float:
    """
    Calculate skill maturity score (0-100).
    All inputs normalised 0.0 to 1.0.
    """
    return round(
        (
            commit_recency * 0.20
            + commit_frequency * 0.20
            + project_diversity * 0.20
            + co_occurrence * 0.20
            + ai_confidence * 0.20
        )
        * 100,
        1,
    )


def career_readiness(
    skill_coverage: float,
    avg_maturity: float,
    market_alignment: float,
    project_depth: float,
) -> float:
    """
    Calculate career readiness score (0-100).
    All inputs normalised 0.0 to 1.0.
    """
    return round(
        (
            skill_coverage * 0.40
            + avg_maturity * 0.30
            + market_alignment * 0.20
            + project_depth * 0.10
        )
        * 100,
        1,
    )


def gap_priority(
    career_weight: float,
    demand_weight: float,
    missing_severity: float,
) -> float:
    """Calculate gap priority as weighted product of three factors."""
    return round(career_weight * demand_weight * missing_severity, 3)


def whatif_simulation(
    current_score: float,
    simulated_skills: List[str],
) -> Dict:
    """
    Inject simulated skills, recalculate readiness, return delta.
    Uses heuristic boosts by skill category.
    """
    boost = 0.0
    for skill in simulated_skills:
        skill_lower = skill.lower()
        if skill_lower in ["pytorch", "tensorflow", "scikit-learn", "keras"]:
            boost += 0.06
        elif skill_lower in ["docker", "kubernetes", "aws", "gcp", "azure"]:
            boost += 0.04
        elif skill_lower in ["react", "vue", "angular", "nextjs", "next.js"]:
            boost += 0.03
        elif skill_lower in ["system design", "distributed systems", "microservices"]:
            boost += 0.05
        else:
            boost += 0.025

    new_score = min(100, round(current_score + (boost * 100), 1))
    delta = round(new_score - current_score, 1)

    return {
        "original_score": current_score,
        "new_score": new_score,
        "score_delta": delta,
        "simulated_skills": simulated_skills,
    }
