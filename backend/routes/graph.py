from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any

from schemas.schemas import GitHubSyncRequest, RepoAnalyzeRequest
from services.graph_service import get_graph, save_graph
from services.github_service import sync_github_data
from services.repo_analyzer import analyze_public_repo
from config import settings

router = APIRouter(tags=["graph"])


@router.get("/")
async def get_graph_data():
    """Return the full knowledge graph (nodes + links)."""
    graph = get_graph()
    return graph


@router.post("/sync/github")
async def sync_github_graph(payload: GitHubSyncRequest):
    """Sync graph with GitHub data — fully replaces old graph."""
    try:
        print(f"DEBUG: Syncing GitHub data with token {payload.token[:10]}...")
        data = await sync_github_data(payload.token)
        # Replace entire graph so deleted repos / stale skills are removed
        save_graph(data["nodes"], data["links"])
        print(f"DEBUG: Sync complete. {len(data['nodes'])} nodes, {len(data['links'])} links.")
        return {
            "status": "synced",
            "nodes": len(data["nodes"]),
            "links": len(data["links"])
        }
    except Exception as e:
        print(f"ERROR: GitHub sync failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to sync GitHub data: {str(e)}")


@router.post("/analyze-repo")
async def analyze_repo(payload: RepoAnalyzeRequest):
    """Analyze a public GitHub repo by URL — no auth needed."""
    try:
        print(f"DEBUG: Analyzing repo URL: {payload.url} (engine: {payload.engine})")
        data = await analyze_public_repo(payload.url, engine=payload.engine or "orbitx")
        save_graph(data["nodes"], data["links"])
        print(f"DEBUG: Analysis complete. {len(data['nodes'])} nodes, {len(data['links'])} links.")
        return {
            "status": "analyzed",
            "nodes": len(data["nodes"]),
            "links": len(data["links"]),
            "graph": data,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"ERROR: Repo analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze repo: {str(e)}")


@router.post("/refresh")
async def refresh_graph():
    """Re-seed graph data (useful after new data sources are connected)."""
    # Modification: Removed demo data seeding
    return {"status": "refreshed", "nodes": 0, "links": 0}
