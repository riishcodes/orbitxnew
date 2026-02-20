"use client"
import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import GitHubAuthButton from "@/components/ui/GitHubAuthButton"

export default function LandingPage() {
    const router = useRouter()

    return (
        <main className="relative w-screen h-screen overflow-hidden bg-[#F8FAFC] flex items-center justify-center font-sans">

            {/* Background graph — rotates slowly behind everything */}
            <div className="absolute inset-0 opacity-60 pointer-events-none">
                <BackgroundGraph />
            </div>

            {/* Subtle Grid Background */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-600" />

            {/* Floating particles effect - Darker for light mode */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1.5 h-1.5 bg-slate-300 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -40, 0],
                            opacity: [0.3, 0.7, 0.3],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 4 + Math.random() * 5,
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
                className="relative z-10 text-center px-6 max-w-3xl"
            >
                <div className="inline-block mb-6 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
                    >
                        Skill Intelligence Platform v1.0
                    </motion.p>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 mb-4 md:mb-6 leading-tight tracking-tight">
                    Your GitHub,<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600">
                        Decoded.
                    </span>
                </h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-slate-500 text-base md:text-lg mb-8 md:mb-10 leading-relaxed max-w-xl mx-auto"
                >
                    Connect GitHub to visualize your skills as a living 3D knowledge graph.
                    Discover gaps, plan your career, and get recruited.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex gap-4 justify-center flex-wrap items-center"
                >
                    <div className="scale-110 shadow-xl shadow-cyan-100 rounded-lg">
                        <GitHubAuthButton />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push("/dashboard?demo=true")}
                        className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-lg hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
                    >
                        View Demo
                    </motion.button>
                </motion.div>

                {/* Feature pills */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="flex gap-2 md:gap-3 justify-center flex-wrap mt-10 md:mt-16"
                >
                    {['3D Skill Graph', 'AI Gap Analysis', 'Career Roadmap', 'Recruiter Mode'].map((f) => (
                        <span
                            key={f}
                            className="px-4 py-1.5 text-[11px] font-bold text-slate-500 bg-white border border-slate-200 rounded-full shadow-sm uppercase tracking-wider"
                        >
                            {f}
                        </span>
                    ))}
                </motion.div>
            </motion.div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
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

            const Graph = (ForceGraph3D as any)()(containerRef.current)
                .backgroundColor("#F8FAFC") // Light background to match page
                .nodeColor(() => "#3B82F6") // Blue nodes
                .nodeOpacity(0.9)
                .nodeVal(() => Math.random() * 3 + 2)
                .linkColor(() => "rgba(148, 163, 184, 0.4)") // Slate-400 links
                .linkWidth(0.8)
                .showNavInfo(false)
                .enableNodeDrag(false)
                .enableNavigationControls(false)
                .graphData({
                    nodes: Array.from({ length: 45 }, (_, i) => ({ id: i })),
                    links: Array.from({ length: 65 }, () => ({
                        source: Math.floor(Math.random() * 45),
                        target: Math.floor(Math.random() * 45),
                    })),
                })

            let angle = 0
            let animationFrameId: number

            const animate = () => {
                angle += 0.0015
                Graph.cameraPosition({
                    x: 280 * Math.sin(angle),
                    z: 280 * Math.cos(angle),
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
