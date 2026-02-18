from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import auth, github, notion, certifications, graph, career, recruiter

app = FastAPI(
    title="3D Knowledge Graph API",
    description="AI-powered career intelligence platform",
    version="1.0.0",
)

# CORS — allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(auth.router,           prefix="/auth")
app.include_router(github.router,         prefix="/github")
app.include_router(notion.router,         prefix="/notion")
app.include_router(certifications.router, prefix="/certifications")
app.include_router(graph.router,          prefix="/graph")
app.include_router(career.router,         prefix="/career")
app.include_router(recruiter.router,      prefix="/recruiter")


@app.get("/")
def root():
    return {"status": "ok", "message": "3D Knowledge Graph API running"}


@app.get("/health")
def health():
    return {"status": "healthy"}
