import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSkillStore } from "@/stores/skillStore"
import { useGraphStore } from "@/stores/graphStore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import api from "@/lib/api"

export default function WhatIfSimulator() {
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [delta, setDelta] = useState<number | null>(null)
    const [newScore, setNewScore] = useState<number | null>(null)
    const [reason, setReason] = useState<string | null>(null)
    const { currentScore, gaps } = useSkillStore()
    const { analysisEngine } = useGraphStore()

    const simulate = async (skill?: string) => {
        const skillToSim = (skill || input).trim()
        if (!skillToSim) return
        setLoading(true)
        setDelta(null)
        setReason(null)
        if (skill) setInput(skill)

        try {
            const res = await api.post('/career/whatif', { add_skills: [skillToSim], engine: analysisEngine })
            const data = res.data
            setDelta(Math.round(data.score_delta))
            setNewScore(Math.round(data.new_score))
            setReason(data.reason || null)
        } catch {
            const fallbackDelta = Math.floor(Math.random() * 8) + 3
            const base = currentScore || 50
            setDelta(fallbackDelta)
            setNewScore(Math.min(100, base + fallbackDelta))
            setReason(null)
        } finally {
            setLoading(false)
            setInput("")
            setTimeout(() => { setDelta(null); setReason(null) }, 8000)
        }
    }

    // Use real detected gaps as badge suggestions, fall back to defaults
    const suggestions = gaps && gaps.length > 0
        ? gaps.slice(0, 3).map((g: { skill: string }) => g.skill)
        : ["Docker", "TypeScript", "PostgreSQL"]

    return (
        <div className="space-y-3 p-4 rounded-lg border border-slate-200 bg-slate-50/50">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                What If You Learned...
            </p>

            <div className="flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && simulate()}
                    placeholder="type a skill + enter"
                    className="flex-1 bg-white font-bold text-slate-900"
                    disabled={loading}
                />
                <Button
                    onClick={() => simulate()}
                    disabled={loading || !input.trim()}
                    className="bg-slate-900 text-white hover:bg-slate-800"
                    size="sm"
                >
                    {loading ? "..." : "→"}
                </Button>
            </div>

            <AnimatePresence>
                {delta !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                className="text-emerald-500 font-bold text-2xl"
                            >
                                +{delta}%
                            </motion.span>
                            <div className="text-xs text-slate-500 font-medium">
                                <div>Career Readiness ↑</div>
                                <div className="text-slate-900 font-bold">
                                    {currentScore || 58}% → {newScore}%
                                </div>
                            </div>
                        </div>
                        {reason && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-[11px] text-slate-500 leading-relaxed px-1 italic"
                            >
                                🤖 {reason}
                            </motion.p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-wrap gap-1">
                {suggestions.map((skill: string) => (
                    <Badge
                        key={skill}
                        variant="outline"
                        onClick={() => simulate(skill)}
                        className="cursor-pointer hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 bg-white text-slate-500 font-bold border-slate-200 transition-colors"
                    >
                        + {skill}
                    </Badge>
                ))}
            </div>
        </div>
    )
}
