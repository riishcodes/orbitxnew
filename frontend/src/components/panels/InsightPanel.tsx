"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useGraphStore } from "@/stores/graphStore"
import { useSkillStore } from "@/stores/skillStore"
import { CATEGORY_COLORS, MOCK_GAPS, MOCK_ROADMAP } from "@/lib/mock-data"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ScoreRing from "@/components/ui/ScoreRing"
import WhatIfSimulator from "@/components/panels/WhatIfSimulator"
import RecruiterCard from "@/components/panels/RecruiterCard"

export default function InsightPanel() {
    const { selectedNode, recruiterMode } = useGraphStore()
    const { currentScore, gaps, targetRole } = useSkillStore()

    const displayGaps = gaps.length > 0 ? gaps : MOCK_GAPS

    if (recruiterMode) {
        return <RecruiterCard />
    }

    return (
        <div className="h-full flex flex-col gap-4 p-4 bg-white border-l border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
                    Insights
                </h2>
                <span className="text-[10px] font-bold text-slate-400">
                    {targetRole}
                </span>
            </div>

            {/* Score Ring */}
            <div className="flex justify-center py-2">
                <ScoreRing score={currentScore || 58} label="Career Readiness" />
            </div>

            {/* Selected Node Detail */}
            <AnimatePresence mode="wait">
                {selectedNode && (
                    <motion.div
                        key={selectedNode.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
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

                                {/* Maturity bar */}
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
            <WhatIfSimulator />

            {/* Skill Gaps */}
            <div className="space-y-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                    Skill Gaps
                </p>
                {displayGaps.map((gap, i) => (
                    <motion.div
                        key={gap.skill}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
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
            </div>

            {/* Roadmap Preview */}
            <div className="space-y-2 mt-auto">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                    Learning Roadmap
                </p>
                {MOCK_ROADMAP.phases.map((phase, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                            <div className={`w-2 h-2 rounded-full mt-1 ${i === 0 ? 'bg-slate-900 shadow-[0_0_8px_rgba(0,0,0,0.1)]' : 'bg-slate-200'}`} />
                            {i < MOCK_ROADMAP.phases.length - 1 && (
                                <div className="w-px h-8 bg-slate-200" />
                            )}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-700">{phase.title}</p>
                            <p className="text-[10px] font-medium text-slate-500">{phase.duration} · {phase.skills.join(', ')}</p>
                        </div>
                    </div>
                ))}
                <p className="text-[10px] font-bold text-slate-400 mt-2">
                    Target: {MOCK_ROADMAP.career_readiness_after}% readiness in {MOCK_ROADMAP.total_duration}
                </p>
            </div>
        </div>
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
