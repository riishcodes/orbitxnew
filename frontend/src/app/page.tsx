"use client"
import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function LandingPage() {
    const router = useRouter()

    return (
        <main className="relative w-screen h-screen overflow-hidden bg-[#030712] flex items-center justify-center">

            {/* Background graph — rotates slowly behind everything */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <BackgroundGraph />
            </div>

            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.8, 0.2],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 4,
                            repeat: Infinity,
                            delay: Math.random() * 3,
                        }}
                    />
                ))}
            </div>

            {/* Hero content */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 text-center px-6 max-w-2xl"
            >
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xs text-cyan-400 font-mono tracking-[0.3em] mb-6 uppercase"
                >
                    Skill Intelligence Platform v1.0
                </motion.p>

                <h1 className="text-6xl md:text-7xl text-white mb-4 leading-tight tracking-tighter">
                    Your GitHub,<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">
                        Decoded.
                    </span>
                </h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-slate-400 font-mono text-sm mb-10 leading-relaxed"
                >
                    Connect GitHub + Notion + Certifications.<br />
                    See your skills as a living 3D knowledge graph.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex gap-4 justify-center flex-wrap"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push("/dashboard?demo=true")}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-cyan-500 text-[#030712] font-mono font-bold text-sm rounded-lg hover:shadow-lg hover:shadow-cyan-400/25 transition-all"
                    >
                        → Analyze My Profile
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push("/dashboard?demo=true")}
                        className="px-6 py-3 border border-[#1C2333] text-slate-300 font-mono text-sm rounded-lg hover:border-cyan-400 hover:text-cyan-400 transition-colors"
                    >
                        Launch Demo
                    </motion.button>
                </motion.div>

                {/* Feature pills */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="flex gap-3 justify-center flex-wrap mt-12"
                >
                    {['3D Skill Graph', 'AI Gap Analysis', 'Career Roadmap', 'Recruiter Mode'].map((f) => (
                        <span
                            key={f}
                            className="px-3 py-1 text-[10px] font-mono text-slate-500 border border-[#1C2333] rounded-full uppercase tracking-wider"
                        >
                            {f}
                        </span>
                    ))}
                </motion.div>
            </motion.div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#030712] to-transparent" />
        </main>
    )
}

function BackgroundGraph() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (typeof window === "undefined") return

        let cleanup: (() => void) | undefined

        import("3d-force-graph").then(({ default: ForceGraph3D }) => {
            if (!containerRef.current) return

            const Graph = ForceGraph3D()(containerRef.current)
                .backgroundColor("#030712")
                .nodeColor(() => "#06B6D4")
                .nodeOpacity(0.6)
                .nodeVal(() => Math.random() * 3 + 1)
                .linkColor(() => "rgba(6,182,212,0.15)")
                .linkWidth(0.5)
                .showNavInfo(false)
                .enableNodeDrag(false)
                .enableNavigationControls(false)
                .graphData({
                    nodes: Array.from({ length: 40 }, (_, i) => ({ id: i })),
                    links: Array.from({ length: 55 }, () => ({
                        source: Math.floor(Math.random() * 40),
                        target: Math.floor(Math.random() * 40),
                    })),
                })

            let angle = 0
            let animationFrameId: number

            const animate = () => {
                angle += 0.002
                Graph.cameraPosition({
                    x: 250 * Math.sin(angle),
                    z: 250 * Math.cos(angle),
                })
                animationFrameId = requestAnimationFrame(animate)
            }
            animate()

            cleanup = () => {
                cancelAnimationFrame(animationFrameId)
                Graph._destructor?.()
            }
        })

        return () => cleanup?.()
    }, [])

    return <div ref={containerRef} className="w-full h-full" />
}
