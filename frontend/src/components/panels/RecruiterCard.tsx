"use client"
import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { useGraphStore } from "@/stores/graphStore"
import { useSkillStore } from "@/stores/skillStore"
import { useAuthStore } from "@/stores/authStore"
import { CATEGORY_COLORS } from "@/lib/mock-data"
import ScoreRing from "@/components/ui/ScoreRing"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import api from "@/lib/api"

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
}
const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
}

export default function RecruiterCard() {
    const { graphData } = useGraphStore()
    const { currentScore, targetRole } = useSkillStore()
    const { user } = useAuthStore()
    const [shareStatus, setShareStatus] = useState<"idle" | "loading" | "copied">("idle")

    const handleShareProfile = async () => {
        setShareStatus("loading")
        try {
            const username = user?.username || "developer"
            const res = await api.post("/profile/generate", { username })
            const profileUrl = `${window.location.origin}/profile/${res.data.slug}`
            await navigator.clipboard.writeText(profileUrl)
            setShareStatus("copied")
            setTimeout(() => setShareStatus("idle"), 3000)
        } catch (err) {
            setShareStatus("idle")
            alert("Share failed — make sure you have graph data first.")
        }
    }

    const allNodes = graphData.nodes
    const skills = useMemo(() => allNodes.filter((n) => n.category !== "repo"), [allNodes])
    const repos = useMemo(() => allNodes.filter((n) => n.category === "repo"), [allNodes])

    const avgMaturity = useMemo(() => {
        if (skills.length === 0) return 0
        return Math.round(skills.reduce((s, n) => s + n.maturity, 0) / skills.length)
    }, [skills])

    const avgMarketFit = useMemo(() => {
        if (skills.length === 0) return 0
        return Math.round(skills.reduce((s, n) => s + n.market_demand, 0) / skills.length)
    }, [skills])

    const projectDepth = useMemo(() => Math.min(100, repos.length * 10), [repos])

    const sources = useMemo(() => {
        const s = new Set(allNodes.map((n) => n.source).filter(Boolean))
        return s.size
    }, [allNodes])

    const radarData = useMemo(() => {
        const categories: Record<string, { total: number; count: number }> = {}
        for (const s of skills) {
            if (!categories[s.category]) categories[s.category] = { total: 0, count: 0 }
            categories[s.category].total += s.maturity
            categories[s.category].count++
        }
        return Object.entries(categories)
            .map(([cat, d]) => ({
                axis: cat.charAt(0).toUpperCase() + cat.slice(1),
                value: Math.round(d.total / d.count),
                color: CATEGORY_COLORS[cat] || "#64748B",
            }))
            .sort((a, b) => b.value - a.value)
    }, [skills])

    const topSkills = useMemo(() => {
        return [...skills].sort((a, b) => b.maturity - a.maturity).slice(0, 8)
    }, [skills])

    const riskAreas = useMemo(() => {
        const risks: string[] = []
        const catAvg: Record<string, number> = {}
        for (const r of radarData) catAvg[r.axis.toLowerCase()] = r.value
        if (!catAvg["devops"] || catAvg["devops"] < 50) risks.push("No DevOps skills")
        if (!catAvg["database"] || catAvg["database"] < 50) risks.push("Weak in Databases")
        if (!catAvg["ml"] || catAvg["ml"] < 40) risks.push("Limited ML/AI exposure")
        if (repos.length < 3) risks.push("Few public projects")
        if (skills.length < 5) risks.push("Narrow skill range")
        const lowDemand = skills.filter((s) => s.market_demand < 50)
        if (lowDemand.length > skills.length * 0.3) risks.push("Many low-demand skills")
        return risks
    }, [radarData, repos, skills])

    if (skills.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="text-4xl mb-3">👤</div>
                <p className="text-sm font-bold text-slate-900">No data for recruiter view</p>
                <p className="text-xs text-slate-400 mt-1">Sync your GitHub to generate your profile</p>
            </div>
        )
    }

    return (
        <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="h-full flex flex-col gap-4 p-4 bg-white border-l border-slate-200 overflow-y-auto"
            id="recruiter-card"
        >
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-orange-500 uppercase tracking-[0.2em]">
                    Recruiter View
                </h2>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShareProfile}
                        disabled={shareStatus === "loading"}
                        className="text-[10px] font-bold h-7 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 gap-1"
                    >
                        {shareStatus === "copied" ? "✓ Link Copied!" : shareStatus === "loading" ? "Generating..." : "🔗 Share Profile"}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportPDF()}
                        className="text-[10px] font-bold h-7 border-slate-200 text-slate-500 hover:text-orange-600 hover:border-orange-200"
                    >
                        Export PDF
                    </Button>
                </div>
            </motion.div>

            {/* Profile Summary */}
            <motion.div variants={fadeUp}>
                <Card className="p-4 space-y-1 bg-gradient-to-r from-slate-50 to-orange-50/30 border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                            {repos.length}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-900">
                                {user?.name || user?.username || "Developer"} · {repos.length} Projects · {skills.length} Skills
                            </p>
                            <p className="text-[10px] font-medium text-slate-500">
                                Target: {targetRole}
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Score Rings */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
                <div className="flex justify-center">
                    <ScoreRing score={currentScore || 0} label="Readiness" color="#0891B2" size={80} />
                </div>
                <div className="flex justify-center">
                    <ScoreRing score={avgMaturity} label="Maturity" color="#059669" size={80} />
                </div>
            </motion.div>

            {/* Metrics */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
                <MetricCard label="Project Depth" value={`${projectDepth}%`} />
                <MetricCard label="Market Fit" value={`${avgMarketFit}%`} />
                <MetricCard label="Total Skills" value={String(skills.length)} />
                <MetricCard label="Data Sources" value={String(sources)} />
            </motion.div>

            {/* Skill Radar by Category */}
            <motion.div variants={fadeUp} className="space-y-3 pt-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                    Skill Radar
                </p>
                {radarData.map((item, i) => (
                    <div key={item.axis} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-500">{item.axis}</span>
                            <span className="text-slate-900">{item.value}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.value}%` }}
                                transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Top Skills */}
            <motion.div variants={fadeUp} className="space-y-2 pt-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                    Top Skills
                </p>
                {topSkills.map((skill, i) => (
                    <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.08, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                        className="flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0"
                    >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[skill.category] || "#64748B" }} />
                        <span className="text-xs font-bold text-slate-700 flex-1">{skill.name}</span>
                        <Badge variant="secondary" className="text-[10px] font-bold h-5 bg-slate-100 text-slate-600 hover:bg-slate-200">
                            {skill.maturity}%
                        </Badge>
                    </motion.div>
                ))}
            </motion.div>

            {/* Risk Areas */}
            {riskAreas.length > 0 && (
                <motion.div variants={fadeUp} className="space-y-2 pt-2">
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-[0.2em]">
                        Risk Areas
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {riskAreas.map((risk) => (
                            <Badge key={risk} variant="destructive" className="px-2 py-0.5 text-[9px] font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100">
                                {risk}
                            </Badge>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Strengths */}
            {radarData.filter(r => r.value >= 60).length > 0 && (
                <motion.div variants={fadeUp} className="space-y-2 pt-2">
                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em]">
                        ✓ Strengths
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {radarData.filter(r => r.value >= 60).map((r) => (
                            <Badge key={r.axis} className="px-2 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100">
                                Strong {r.axis} ({r.value}%)
                            </Badge>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}

function MetricCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-lg font-bold text-slate-900 mt-1">{value}</p>
        </div>
    )
}

async function exportPDF() {
    try {
        const { default: html2canvas } = await import("html2canvas")
        const { jsPDF } = await import("jspdf")
        const element = document.getElementById("recruiter-card")
        if (!element) return
        const canvas = await html2canvas(element, { backgroundColor: "#FFFFFF", scale: 2 })
        const pdf = new jsPDF("p", "mm", "a4")
        const imgData = canvas.toDataURL("image/png")
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
        pdf.save("recruiter-profile.pdf")
    } catch (err) {
        console.error("PDF export failed:", err)
    }
}
