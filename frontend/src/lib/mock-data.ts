// Mock data removed per user request
export const MOCK_GRAPH = { nodes: [], links: [] }
export const MOCK_USER = {
    name: "",
    username: "",
    avatar: "",
    target_role: "",
    career_readiness: 0
}
export const MOCK_GAPS = []
export const MOCK_ROADMAP = { phases: [], total_duration: "", career_readiness_after: 0 }
export const MOCK_RECRUITER = {
    name: "",
    username: "",
    target_role: "",
    career_readiness: 0,
    skill_maturity_avg: 0,
    project_depth: 0,
    market_alignment: 0,
    risk_areas: [],
    top_skills: [],
    skill_distribution: {},
    radar_data: [], // Added to prevent crash
    total_skills: 0, // Added to prevent crash
    total_sources: 0 // Added to prevent crash
}
export const CATEGORY_COLORS: Record<string, string> = {
    frontend: "#3B82F6",
    backend: "#10B981",
    ml: "#8B5CF6",
    devops: "#F59E0B",
    cert: "#EC4899",
    concept: "#64748B",
    language: "#06B6D4",
    repo: "#F97316",
    database: "#6366F1",
}
