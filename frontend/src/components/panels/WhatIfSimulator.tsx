import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSkillStore } from "@/stores/skillStore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function WhatIfSimulator() {
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [delta, setDelta] = useState<number | null>(null)
    const [newScore, setNewScore] = useState<number | null>(null)
    const { currentScore } = useSkillStore()

    const simulate = async () => {
        if (!input.trim()) return
        setLoading(true)
        setDelta(null)

        // Simulate with heuristic boosts
        await new Promise((res) => setTimeout(res, 600))

        const skill = input.trim().toLowerCase()
        let mockDelta: number

        if (["pytorch", "tensorflow"].includes(skill)) {
            mockDelta = 16
        } else if (["docker", "kubernetes", "aws"].includes(skill)) {
            mockDelta = 8
        } else if (["scikit-learn", "keras", "pandas"].includes(skill)) {
            mockDelta = 12
        } else if (["react", "vue", "angular", "nextjs"].includes(skill)) {
            mockDelta = 6
        } else {
            mockDelta = Math.floor(Math.random() * 8) + 3
        }

        const base = currentScore || 58
        setDelta(mockDelta)
        setNewScore(Math.min(100, base + mockDelta))
        setLoading(false)
        setInput("")

        // Auto-hide after 5 seconds
        setTimeout(() => setDelta(null), 5000)
    }

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
                />
                <Button
                    onClick={simulate}
                    disabled={loading}
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
                        className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100"
                    >
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
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-wrap gap-1">
                {["PyTorch", "Docker", "scikit-learn"].map((skill) => (
                    <Badge
                        key={skill}
                        variant="outline"
                        onClick={() => {
                            setInput(skill)
                            setTimeout(simulate, 100)
                        }}
                        className="cursor-pointer hover:bg-slate-100 bg-white text-slate-500 font-bold border-slate-200"
                    >
                        + {skill}
                    </Badge>
                ))}
            </div>
        </div>
    )
}
