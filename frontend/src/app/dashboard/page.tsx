"use client"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { useGraphStore } from "@/stores/graphStore"
import { useSkillStore } from "@/stores/skillStore"
import { useAuthStore } from "@/stores/authStore"
import { MOCK_GRAPH, MOCK_USER, MOCK_GAPS, CATEGORY_COLORS } from "@/lib/mock-data"
import Topbar from "@/components/layout/Topbar"
import DashboardTour from "@/components/layout/DashboardTour"
import InsightPanel from "@/components/panels/InsightPanel"
import MarketAnalysisPanel from "@/components/panels/MarketAnalysisPanel"
import RecruiterCard from "@/components/panels/RecruiterCard"
import SearchFilter from "@/components/panels/SearchFilter"
import PanelSkeleton from "@/components/ui/PanelSkeleton"
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
    const { setGraphData, graphData, showInsights, marketOverlay, recruiterMode } = useGraphStore()
    const { setCurrentScore, setGaps } = useSkillStore()
    const { setUser, setIsDemo } = useAuthStore()

    const [panelLoading, setPanelLoading] = useState(false)
    const [isHydrated, setIsHydrated] = useState(false)
    const panelKey = `${showInsights}-${marketOverlay}-${recruiterMode}`

    // Show skeleton briefly when switching panels
    useEffect(() => {
        setPanelLoading(true)
        const timer = setTimeout(() => setPanelLoading(false), 400)
        return () => clearTimeout(timer)
    }, [panelKey])

    useEffect(() => {
        setIsDemo(false)

        // Prevent hydration flash on mobile, close default insights
        if (typeof window !== 'undefined') {
            if (window.innerWidth < 1024 && useGraphStore.getState().showInsights) {
                useGraphStore.setState({ showInsights: false })
            }
            setIsHydrated(true)
        }

        // Fetch real graph data from backend
        const fetchGraph = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
                const res = await fetch(`${apiUrl}/graph/`)
                if (res.ok) {
                    const data = await res.json()
                    if (data.nodes && data.nodes.length > 0) {
                        setGraphData(data)
                    }
                }
            } catch (err) {
                console.warn('Could not fetch graph data:', err)
            }
        }

        // Fetch career readiness + skill gaps
        const fetchCareer = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
                const res = await fetch(`${apiUrl}/career/readiness`)
                if (res.ok) {
                    const data = await res.json()
                    setCurrentScore(data.career_readiness)
                    setGaps(data.gaps || [])
                }
            } catch (err) {
                console.warn('Could not fetch career data:', err)
            }
        }

        fetchGraph()
        fetchCareer()
    }, [setIsDemo, setGraphData, setCurrentScore, setGaps])

    const panelOpen = showInsights || marketOverlay || recruiterMode

    return (
        <div className="flex flex-col h-screen bg-[#F8F9FA]">
            <Topbar />
            <DashboardTour />
            <div className="flex flex-1 overflow-hidden px-4 md:px-8 pb-4 md:pb-8 gap-4 md:gap-6 relative">
                {/* 3D Graph — takes remaining width */}
                <div id="tour-graph" className="flex-1 relative bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <SearchFilter />
                    <KnowledgeGraph3D />

                    {/* Legend */}
                    <div id="tour-legend" className="absolute bottom-4 md:bottom-6 left-4 md:left-6 z-10 bg-white/80 backdrop-blur-md rounded-xl p-2 md:p-3 border border-slate-100 flex gap-2 md:gap-4 shadow-sm flex-wrap">
                        {[
                            { label: "Repo", color: CATEGORY_COLORS.repo },
                            { label: "Language", color: CATEGORY_COLORS.language },
                            { label: "Concept", color: CATEGORY_COLORS.concept },
                            { label: "Frontend", color: CATEGORY_COLORS.frontend },
                            { label: "Backend", color: CATEGORY_COLORS.backend },
                            { label: "ML/AI", color: CATEGORY_COLORS.ml },
                            { label: "DevOps", color: CATEGORY_COLORS.devops },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center gap-1 md:gap-1.5">
                                <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-tight">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right panel — desktop: side panel, mobile/tablet: overlay */}
                <AnimatePresence initial={false}>
                    {isHydrated && panelOpen && (
                        <>
                            {/* Mobile/tablet backdrop overlay */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/30 z-30 lg:hidden"
                                onClick={() => {
                                    if (showInsights) useGraphStore.getState().toggleInsights()
                                    if (marketOverlay) useGraphStore.getState().toggleMarketOverlay()
                                    if (recruiterMode) useGraphStore.getState().toggleRecruiterMode()
                                }}
                            />

                            {/* Panel — fixed on mobile, side panel on desktop */}
                            <motion.div
                                initial={{ x: "100%", opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: "100%", opacity: 0 }}
                                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                className="
                                    fixed right-0 top-0 bottom-0 w-full z-40
                                    lg:relative lg:right-auto lg:top-auto lg:bottom-auto lg:w-[400px] lg:z-auto
                                    overflow-y-auto bg-white border border-slate-200 lg:rounded-2xl shadow-lg lg:shadow-sm
                                "
                            >
                                {/* Mobile Panel Header with Close Button */}
                                <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-100 bg-white sticky top-0 z-50">
                                    <span className="text-sm font-bold text-slate-900">
                                        {recruiterMode ? "Recruiter View" : marketOverlay ? "Market Analysis" : "Insights"}
                                    </span>
                                    <button 
                                        onClick={() => {
                                            if (showInsights) useGraphStore.getState().toggleInsights()
                                            if (marketOverlay) useGraphStore.getState().toggleMarketOverlay()
                                            if (recruiterMode) useGraphStore.getState().toggleRecruiterMode()
                                        }}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100/80 text-slate-500 hover:bg-slate-200 transition-colors"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>

                                <div className="min-w-0 lg:min-w-[400px] pb-8 lg:pb-0">
                                    {panelLoading ? <PanelSkeleton /> : recruiterMode ? <RecruiterCard /> : marketOverlay ? <MarketAnalysisPanel /> : <InsightPanel />}
                                </div>
                            </motion.div>
                        </>
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
