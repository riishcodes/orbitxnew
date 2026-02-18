# SkillGraph AI — Interactive 3D Knowledge Graph Builder

> AI-powered Career Intelligence Platform that transforms GitHub activity, Notion notes, and certifications into measurable hiring intelligence using AI reasoning and interactive 3D knowledge graphs.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Cost](https://img.shields.io/badge/Cost-$0-green.svg)
![Status](https://img.shields.io/badge/Status-Demo_Ready-brightgreen.svg)

---

## ✨ Features

- **🔮 Interactive 3D Knowledge Graph** — Force-directed, zoomable, clickable skill visualization
- **🔗 GitHub Integration** — OAuth login, live repo fetching, language extraction
- **📓 Notion Integration** — Connect learning notes and pages
- **📜 Certifications** — Manual upload with auto skill mapping
- **🤖 AI Skill Extraction** — Gemini 1.5 Flash NLP-based extraction (free)
- **📊 Career Readiness Score** — Quantified 0-100 with breakdown
- **🎯 Skill Gap Analysis** — AI-powered gap identification with priority scores
- **🔮 What-If Simulator** — "If you learn PyTorch, readiness +16%"
- **👔 Recruiter Mode** — Radar chart + PDF export
- **📈 Analytics Dashboard** — Pie, radar, area, and bar charts
- **🔍 Search & Filter** — Real-time node search + category filter
- **🌊 Market Demand Overlay** — Node glow intensity by demand

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| 3D Engine | 3d-force-graph + Three.js |
| State | Zustand |
| Charts | Recharts |
| Backend | FastAPI (Python) |
| AI | Gemini 1.5 Flash (free) |
| Graph DB | Neo4j AuraDB (free) |
| Auth | GitHub OAuth + JWT |

**Total cost: $0**

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- (Optional) Gemini API key from [aistudio.google.com](https://aistudio.google.com)

### 1. Clone & Setup

```bash
git clone <your-repo-url>
cd 3dgraph-builders
cp .env.example .env
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs available at: `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: `http://localhost:3000`

### 4. Demo Mode

The app works immediately with `DEMO_MODE=true` (default). No API keys needed.

Click **"Launch Demo"** on the landing page to see Aryan Sharma's skill graph.

---

## 🔑 Environment Variables

```bash
# AI (free at aistudio.google.com)
GEMINI_API_KEY=

# GitHub OAuth (github.com → Settings → Developer Settings)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Notion (notion.so/my-integrations)
NOTION_TOKEN=

# Neo4j AuraDB (neo4j.com/cloud/aura — free)
NEO4J_URI=
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=

# Auth
JWT_SECRET=your-secret-here

# Demo mode (runs without any keys)
DEMO_MODE=true
```

---

## 📁 Project Structure

```
3dgraph-builders/
├── backend/
│   ├── main.py              # FastAPI entry point
│   ├── config.py             # Pydantic settings
│   ├── seed_data.py          # Demo dataset (Aryan Sharma)
│   ├── routes/               # API endpoints
│   │   ├── auth.py
│   │   ├── github.py
│   │   ├── notion.py
│   │   ├── certifications.py
│   │   ├── graph.py
│   │   ├── career.py
│   │   └── recruiter.py
│   ├── services/             # Business logic
│   │   ├── github_service.py
│   │   ├── notion_service.py
│   │   ├── certification_service.py
│   │   ├── ai_service.py
│   │   ├── scoring_service.py
│   │   ├── graph_service.py
│   │   └── cache_service.py
│   └── schemas/              # Pydantic models
│       └── schemas.py
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js pages
│   │   │   ├── page.tsx      # Landing page
│   │   │   └── dashboard/
│   │   │       ├── page.tsx  # Main dashboard
│   │   │       └── analytics/
│   │   │           └── page.tsx
│   │   ├── components/       # React components
│   │   │   ├── graph/        # 3D graph
│   │   │   ├── panels/       # Side panels
│   │   │   ├── ui/           # UI primitives
│   │   │   └── layout/       # Layout shells
│   │   ├── stores/           # Zustand stores
│   │   └── lib/              # API + mock data
│   └── package.json
├── .env.example
└── README.md
```

---

## 🎯 PS9 Requirements Coverage

| Requirement | Status |
|------------|--------|
| GitHub data extraction | ✅ |
| Notion integration | ✅ |
| Certifications | ✅ |
| NLP-based skill extraction | ✅ |
| Graph database (Neo4j) | ✅ |
| Auto-generate knowledge graph | ✅ |
| Interactive 3D visualization | ✅ |
| Search & filter | ✅ |
| Skill gap analysis | ✅ |
| Career roadmap | ✅ |
| What-If simulator | ✅ |
| Recruiter mode | ✅ |
| Market demand overlay | ✅ |
| Analytics dashboard | ✅ |
| Secure authentication | ✅ |

---

## 📄 License

MIT
