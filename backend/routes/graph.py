from fastapi import APIRouter

from services.graph_service import get_graph, save_graph
from seed_data import DEMO_NODES, DEMO_LINKS
from config import settings

router = APIRouter(tags=["graph"])


@router.get("/")
async def get_graph_data():
    """Return the full knowledge graph (nodes + links)."""
    graph = get_graph()

    # If graph is empty, seed with demo data
    if not graph.get("nodes"):
        save_graph(DEMO_NODES, DEMO_LINKS)
        graph = {"nodes": DEMO_NODES, "links": DEMO_LINKS}

    return graph


@router.post("/refresh")
async def refresh_graph():
    """Re-seed graph data (useful after new data sources are connected)."""
    save_graph(DEMO_NODES, DEMO_LINKS)
    return {"status": "refreshed", "nodes": len(DEMO_NODES), "links": len(DEMO_LINKS)}
