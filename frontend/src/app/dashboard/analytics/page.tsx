"use client"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts"
import { MOCK_GRAPH, MOCK_RECRUITER, CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/mock-data"
import ScoreRing from "@/components/ui/ScoreRing"

export default function AnalyticsPage() {
    const router = useRouter()

    // Compute chart data from mock
    const distributionData = Object.entries(MOCK_RECRUITER.skill_distribution).map(([key, value]) => ({
        name: CATEGORY_LABELS[key] || key,
        value: value as number,
        color: CATEGORY_COLORS[key] || "#64748B",
    }))

    const maturityData = MOCK_GRAPH.nodes
        .sort((a, b) => b.maturity - a.maturity)
        .map((n) => ({
            name: n.name,
            maturity: n.maturity,
            demand: n.market_demand,
            fill: CATEGORY_COLORS[n.category] || "#64748B",
        }))

    const radarData = MOCK_RECRUITER.radar_data.map((d) => ({
        ...d,
        fullMark: 100,
    }))

    // Simulated growth timeline
    const growthData = [
        { month: "Aug", skills: 4, maturity: 35 },
        { month: "Sep", skills: 6, maturity: 42 },
        { month: "Oct", skills: 8, maturity: 48 },
        { month: "Nov", skills: 10, maturity: 52 },
        { month: "Dec", skills: 12, maturity: 55 },
        { month: "Jan", skills: 14, maturity: 58 },
        { month: "Feb", skills: 15, maturity: 61 },
    ]

    return (
        <div className="min-h-screen bg-[#F4F7FE]">
            {/* Header */}
            <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/dashboard?demo=true")}
                        className="text-xs font-bold font-mono text-slate-500 hover:text-orange-600 transition-colors"
                    >
                        ← Back to Graph
                    </button>
                    <span className="text-slate-300">|</span>
                    <h1 className="text-sm font-bold font-mono text-slate-900 tracking-wide">Analytics Dashboard</h1>
                </div>
            </div>

            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                {/* Score row */}
                <div className="grid grid-cols-4 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl p-6 flex justify-center shadow-sm border border-slate-100"
                    >
                        <ScoreRing score={58} label="Career Ready" color="#0891B2" />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl p-6 flex justify-center shadow-sm border border-slate-100"
                    >
                        <ScoreRing score={61} label="Avg Maturity" color="#059669" />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl p-6 flex justify-center shadow-sm border border-slate-100"
                    >
                        <ScoreRing score={78} label="Market Fit" color="#7C3AED" />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-xl p-6 flex justify-center shadow-sm border border-slate-100"
                    >
                        <ScoreRing score={100} label="Sources" color="#D97706" />
                    </motion.div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Skill Distribution Pie */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
                    >
                        <h3 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-[0.2em] mb-4">
                            Skill Distribution
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={distributionData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    innerRadius={50}
                                    dataKey="value"
                                    stroke="#FFFFFF"
                                    strokeWidth={3}
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {distributionData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: "#FFFFFF",
                                        border: "1px solid #E2E8F0",
                                        borderRadius: "8px",
                                        fontFamily: "var(--font-geist-mono)",
                                        fontSize: "11px",
                                        color: "#1E293B",
                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                                    }}
                                    itemStyle={{ color: "#475569" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Domain Radar */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
                    >
                        <h3 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-[0.2em] mb-4">
                            Domain Clustering
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#E2E8F0" />
                                <PolarAngleAxis
                                    dataKey="axis"
                                    tick={{ fill: "#64748B", fontSize: 10, fontFamily: "var(--font-geist-mono)", fontWeight: "bold" }}
                                />
                                <PolarRadiusAxis
                                    angle={30}
                                    domain={[0, 100]}
                                    tick={{ fill: "#94A3B8", fontSize: 8 }}
                                    axisLine={false}
                                />
                                <Radar
                                    dataKey="value"
                                    stroke="#06B6D4"
                                    fill="#06B6D4"
                                    fillOpacity={0.3}
                                    strokeWidth={2}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "#FFFFFF",
                                        border: "1px solid #E2E8F0",
                                        borderRadius: "8px",
                                        fontFamily: "var(--font-geist-mono)",
                                        fontSize: "11px",
                                        color: "#1E293B",
                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                                    }}
                                    itemStyle={{ color: "#475569" }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Growth Timeline */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
                    >
                        <h3 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-[0.2em] mb-4">
                            Growth Timeline
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={growthData}>
                                <defs>
                                    <linearGradient id="gradientCyan" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="month"
                                    tick={{ fill: "#64748B", fontSize: 10, fontFamily: "var(--font-geist-mono)", fontWeight: "bold" }}
                                    axisLine={{ stroke: "#E2E8F0" }}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: "#94A3B8", fontSize: 10 }}
                                    axisLine={{ stroke: "#E2E8F0" }}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "#FFFFFF",
                                        border: "1px solid #E2E8F0",
                                        borderRadius: "8px",
                                        fontFamily: "var(--font-geist-mono)",
                                        fontSize: "11px",
                                        color: "#1E293B",
                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                                    }}
                                    itemStyle={{ color: "#475569" }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="maturity"
                                    stroke="#06B6D4"
                                    fill="url(#gradientCyan)"
                                    strokeWidth={2}
                                    activeDot={{ r: 6, strokeWidth: 0, fill: "#06B6D4" }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Skill Maturity Bars */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
                    >
                        <h3 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-[0.2em] mb-4">
                            Skill Maturity
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={maturityData} layout="vertical">
                                <XAxis
                                    type="number"
                                    domain={[0, 100]}
                                    tick={{ fill: "#94A3B8", fontSize: 10 }}
                                    axisLine={{ stroke: "#E2E8F0" }}
                                    tickLine={false}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={80}
                                    tick={{ fill: "#64748B", fontSize: 9, fontFamily: "var(--font-geist-mono)", fontWeight: "bold" }}
                                    axisLine={{ stroke: "#E2E8F0" }}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "#FFFFFF",
                                        border: "1px solid #E2E8F0",
                                        borderRadius: "8px",
                                        fontFamily: "var(--font-geist-mono)",
                                        fontSize: "11px",
                                        color: "#1E293B",
                                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                                    }}
                                    cursor={{ fill: "#F1F5F9" }}
                                    itemStyle={{ color: "#475569" }}
                                />
                                <Bar dataKey="maturity" radius={[0, 4, 4, 0]}>
                                    {maturityData.map((entry, i) => (
                                        <Cell key={i} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
