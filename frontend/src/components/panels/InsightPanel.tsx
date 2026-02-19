"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGraphStore } from "@/stores/graphStore"
import { useSkillStore } from "@/stores/skillStore"
import { CATEGORY_COLORS } from "@/lib/mock-data"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ScoreRing from "@/components/ui/ScoreRing"
import WhatIfSimulator from "@/components/panels/WhatIfSimulator"
import RecruiterCard from "@/components/panels/RecruiterCard"

const ROLES = [
    "Full Stack Developer",
    "Frontend Developer",
    "Backend Developer",
    "ML Engineer",
    "Data Scientist",
]

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
}
const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
}

export default function InsightPanel() {
    const { selectedNode, recruiterMode } = useGraphStore()
    const { currentScore, gaps, targetRole, setCurrentScore, setGaps, setTargetRole } = useSkillStore()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchCareer = async () => {
            setLoading(true)
            try {
                const res = await fetch(`http://localhost:8000/career/readiness?target_role=${encodeURIComponent(targetRole)}`)
                if (res.ok) {
                    const data = await res.json()
                    setCurrentScore(data.career_readiness)
                    setGaps(data.gaps || [])
                }
            } catch (err) {
                console.warn('Could not fetch career data:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchCareer()
    }, [targetRole, setCurrentScore, setGaps])

    if (recruiterMode) {
        return <RecruiterCard />
    }

    return (
        <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="h-full flex flex-col gap-4 p-4 bg-white border-l border-slate-200 overflow-y-auto"
        >
            {/* Header + Role Selector */}
            <motion.div variants={fadeUp}>
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">
                    Insights
                </h2>
                <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Target Role
                    </label>
                    <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg appearance-none cursor-pointer hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                    >
                        {ROLES.map((role) => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 bottom-2.5 pointer-events-none text-slate-400 text-xs">▼</div>
                </div>
            </motion.div>

            {/* Score Ring */}
            <motion.div variants={fadeUp} className="flex justify-center py-2">
                <ScoreRing score={currentScore || 0} label="Career Readiness" />
            </motion.div>

            {/* Selected Node Detail */}
            <AnimatePresence mode="wait">
                {selectedNode && (
                    <motion.div
                        key={selectedNode.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.25 }}
                    >
                        <Card className="bg-slate-50/50 border-slate-200 shadow-sm">
                            <CardHeader className="p-4 pb-2">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: CATEGORY_COLORS[selectedNode.category] || "#64748B" }}
                                    />
                                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                                        {selectedNode.name}
                                    </h3>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-2 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <MetricBox label="Maturity" value={`${selectedNode.maturity}%`} />
                                    <MetricBox label="Demand" value={`${selectedNode.market_demand}%`} />
                                    <MetricBox label="Category" value={selectedNode.category} />
                                    <MetricBox label="Source" value={selectedNode.source} />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                        <span>MATURITY</span>
                                        <span>{selectedNode.maturity}%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${selectedNode.maturity}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: CATEGORY_COLORS[selectedNode.category] || "#0f172a" }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* What-If Simulator */}
            <motion.div variants={fadeUp}>
                <WhatIfSimulator />
            </motion.div>

            {/* Skill Gaps */}
            <motion.div variants={fadeUp} className="space-y-2">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                        Skill Gaps
                    </p>
                    {loading && (
                        <div className="w-3 h-3 border border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                    )}
                </div>
                {gaps.length === 0 && !loading && (
                    <p className="text-xs text-slate-400 italic">No gaps detected — sync GitHub first</p>
                )}
                {gaps.map((gap, i) => (
                    <motion.div
                        key={gap.skill}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                        <Card className="flex items-center gap-3 p-3 bg-white hover:bg-slate-50 transition-colors shadow-sm border-slate-200">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-900">{gap.skill}</span>
                                    <Badge variant="secondary" className="text-[9px] font-bold text-orange-600 bg-orange-50 hover:bg-orange-100">
                                        P{Math.round(gap.priority * 100)}
                                    </Badge>
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-relaxed">
                                    {gap.reason}
                                </p>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    )
}

function MetricBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white rounded-lg p-2 border border-slate-200 shadow-sm">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{value}</p>
        </div>
    )
}
