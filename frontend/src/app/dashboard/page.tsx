"use client"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"
import { useGraphStore } from "@/stores/graphStore"
import { useSkillStore } from "@/stores/skillStore"
import { useAuthStore } from "@/stores/authStore"
import { MOCK_GRAPH, MOCK_USER, MOCK_GAPS, CATEGORY_COLORS } from "@/lib/mock-data"
import Topbar from "@/components/layout/Topbar"
import InsightPanel from "@/components/panels/InsightPanel"
import SearchFilter from "@/components/panels/SearchFilter"
import { motion, AnimatePresence } from "framer-motion"

// Dynamic import — 3d-force-graph cannot run on server
const KnowledgeGraph3D = dynamic(
    () => import("@/components/graph/KnowledgeGraph3D"),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center w-full h-full bg-[#030712]">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs font-mono text-slate-600">Loading 3D Graph...</p>
                </div>
            </div>
        ),
    }
)

function DashboardContent() {
    const searchParams = useSearchParams()
    const isDemo = searchParams.get("demo") === "true"
    const { setGraphData, showInsights } = useGraphStore()
    const { setCurrentScore, setGaps } = useSkillStore()
    const { setUser, setIsDemo } = useAuthStore()

    useEffect(() => {
        // In demo mode (or always for now), load mock data
        setGraphData(MOCK_GRAPH)
        setCurrentScore(MOCK_USER.career_readiness)
        setGaps(MOCK_GAPS)
        setUser({
            name: MOCK_USER.name,
            username: MOCK_USER.username,
            avatar: MOCK_USER.avatar,
            target_role: MOCK_USER.target_role,
        })
        setIsDemo(isDemo)
    }, [isDemo, setGraphData, setCurrentScore, setGaps, setUser, setIsDemo])

    return (
        <div className="flex flex-col h-screen bg-[#F8F9FA]">
            <Topbar />
            <div className="flex flex-1 overflow-hidden px-8 pb-8 gap-6">
                {/* 3D Graph — takes remaining width */}
                <div className="flex-1 relative bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <SearchFilter />
                    <KnowledgeGraph3D />

                    {/* Legend */}
                    <div className="absolute bottom-6 left-6 z-10 bg-white/80 backdrop-blur-md rounded-xl p-3 border border-slate-100 flex gap-4 shadow-sm">
                        {[
                            { label: "Frontend", color: CATEGORY_COLORS.frontend },
                            { label: "Backend", color: CATEGORY_COLORS.backend },
                            { label: "ML/AI", color: CATEGORY_COLORS.ml },
                            { label: "DevOps", color: CATEGORY_COLORS.devops },
                            { label: "Cert", color: CATEGORY_COLORS.cert },
                            { label: "Concept", color: CATEGORY_COLORS.concept },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right insight panel — (Animate Toggle) */}
                <AnimatePresence initial={false}>
                    {showInsights && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 400, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-sm"
                        >
                            <div className="min-w-[400px]">
                                <InsightPanel />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default function Dashboard() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center w-screen h-screen bg-[#F8F9FA]">
                <div className="w-8 h-8 border-2 border-[#FF7A00] border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <DashboardContent />
        </Suspense>
    )
}
