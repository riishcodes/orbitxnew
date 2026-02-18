import { motion } from "framer-motion"
import { MOCK_RECRUITER, CATEGORY_COLORS } from "@/lib/mock-data"
import ScoreRing from "@/components/ui/ScoreRing"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function RecruiterCard() {
    const data = MOCK_RECRUITER

    return (
        <div className="h-full flex flex-col gap-4 p-4 bg-white border-l border-slate-200 overflow-y-auto" id="recruiter-card">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-orange-500 uppercase tracking-[0.2em]">
                    Recruiter View
                </h2>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportPDF()}
                    className="text-[10px] font-bold h-7 border-slate-200 text-slate-500 hover:text-orange-600 hover:border-orange-200"
                >
                    Export PDF
                </Button>
            </div>

            {/* Profile */}
            <Card className="p-4 space-y-2 bg-slate-50/50 border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    {data.name}
                </h3>
                <p className="text-xs font-bold text-slate-500">@{data.username} · Target: {data.target_role}</p>
            </Card>

            {/* Score Rings */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-center">
                    <ScoreRing score={data.career_readiness} label="Readiness" color="#0891B2" size={80} />
                </div>
                <div className="flex justify-center">
                    <ScoreRing score={data.skill_maturity_avg} label="Maturity" color="#059669" size={80} />
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
                <MetricCard label="Project Depth" value={`${data.project_depth}%`} />
                <MetricCard label="Market Fit" value={`${data.market_alignment}%`} />
                <MetricCard label="Total Skills" value={String(data.total_skills)} />
                <MetricCard label="Data Sources" value={String(data.total_sources)} />
            </div>

            {/* Radar Chart (simplified as bars) */}
            <div className="space-y-3 pt-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                    Skill Radar
                </p>
                {data.radar_data.map((item, i) => (
                    <div key={item.axis} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-500">{item.axis}</span>
                            <span className="text-slate-900">{item.value}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.value}%` }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Top Skills */}
            <div className="space-y-2 pt-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                    Top Skills
                </p>
                {data.top_skills.map((skill, i) => (
                    <motion.div
                        key={skill.name}
                        initial={{ opacity: 0, x: 5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0"
                    >
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: CATEGORY_COLORS[skill.category] || "#64748B" }}
                        />
                        <span className="text-xs font-bold text-slate-700 flex-1">{skill.name}</span>
                        <Badge variant="secondary" className="text-[10px] font-bold h-5 bg-slate-100 text-slate-600 hover:bg-slate-200">
                            {skill.maturity}%
                        </Badge>
                    </motion.div>
                ))}
            </div>

            {/* Risk Areas */}
            {data.risk_areas.length > 0 && (
                <div className="space-y-2 pt-2">
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-[0.2em]">
                        Risk Areas
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {data.risk_areas.map((risk) => (
                            <Badge
                                key={risk}
                                variant="destructive"
                                className="px-2 py-0.5 text-[9px] font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                            >
                                {risk}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
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

        const canvas = await html2canvas(element, {
            backgroundColor: "#030712",
            scale: 2,
        })

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
