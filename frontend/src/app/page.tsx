"use client"
import { useRef, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    useMotionTemplate,
    useScroll,
    useInView,
    AnimatePresence,
} from "framer-motion"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import GitHubAuthButton from "@/components/ui/GitHubAuthButton"
import { ArrowRight, Sparkles, ChevronDown, GitBranch, Cpu, Route, BarChart3, TrendingUp, Layers } from "lucide-react"

/* ──────────────────────────────────────────
   FONT HELPERS
   ────────────────────────────────────────── */
const editorial = "var(--font-editorial), 'Georgia', serif"
const pixel = "var(--font-pixel), monospace"

/* ──────────────────────────────────────────
   ANIMATION CONFIG
   ────────────────────────────────────────── */
const customEase = [0.22, 1, 0.36, 1] as const

const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 20, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.8, ease: customEase, delay },
})

/* ──────────────────────────────────────────
   PRELOADER
   ────────────────────────────────────────── */
function Preloader({ onComplete }: { onComplete: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onComplete, 2200) // Let it animate for 2.2s
        return () => clearTimeout(timer)
    }, [onComplete])

    return (
        <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: customEase }}
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FCFCFD] ${GeistSans.className}`}
        >
            <div className="relative">
                {/* Expanding outer ring */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [0.8, 1.2, 1.5], opacity: [0, 1, 0] }}
                    transition={{ duration: 2, ease: "easeInOut", times: [0, 0.5, 1] }}
                    className="absolute inset-0 rounded-full border border-orange-200"
                />

                {/* Core logo */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative z-10"
                >
                    <span
                        className="text-[40px] font-bold tracking-tight"
                        style={{ fontFamily: pixel, color: "#F97316" }}
                    >
                        OrbitX
                    </span>
                </motion.div>

                {/* Particles */}
                <motion.div
                    className="absolute top-1/2 left-1/2 -ml-1 -mt-1 w-2 h-2 rounded-full bg-orange-400"
                    initial={{ x: 0, y: 0, opacity: 0 }}
                    animate={{ x: 40, y: -40, opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/2 -ml-1 -mt-1 w-1.5 h-1.5 rounded-full bg-amber-400"
                    initial={{ x: 0, y: 0, opacity: 0 }}
                    animate={{ x: -35, y: 25, opacity: [0, 1, 0] }}
                    transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-8 flex flex-col items-center gap-2"
            >
                <span className={`text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] ${GeistMono.className}`}>
                    Initializing Environment
                </span>
            </motion.div>
        </motion.div>
    )
}

/* ──────────────────────────────────────────
   ORBIT RING — Ultra Light SVG
   ────────────────────────────────────────── */
function OrbitRing({
    size,
    duration,
    dotSize = 5,
    ringOpacity = 0.08,
    dotColor = "#FB923C",
    reverse = false,
    dashed = false,
}: {
    size: number
    duration: number
    dotSize?: number
    ringOpacity?: number
    dotColor?: string
    reverse?: boolean
    dashed?: boolean
}) {
    const r = size / 2

    return (
        <div
            className="absolute top-1/2 left-1/2 pointer-events-none"
            style={{ width: size, height: size, marginLeft: -r, marginTop: -r }}
        >
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0" fill="none">
                <circle cx={r} cy={r} r={r - 1} stroke={`rgba(249,115,22,${ringOpacity})`} strokeWidth={1} strokeDasharray={dashed ? "4 8" : undefined} />
            </svg>
            <motion.div
                className="absolute inset-0"
                animate={{ rotate: reverse ? [0, -360] : [0, 360] }}
                transition={{ duration, repeat: Infinity, ease: "linear", repeatType: "loop" }}
                style={{ willChange: "transform" }}
            >
                <div
                    className="absolute rounded-full"
                    style={{
                        width: dotSize, height: dotSize, background: dotColor,
                        boxShadow: `0 0 ${dotSize * 2}px ${dotColor}60`,
                        top: 0, left: r - dotSize / 2, transform: `translateY(-${dotSize / 2}px)`,
                    }}
                />
            </motion.div>
        </div>
    )
}

/* ──────────────────────────────────────────
   SAAS FEATURE CARD
   ────────────────────────────────────────── */
function FeatureCard({
    icon: Icon,
    title,
    desc,
    gradient,
    index = 0,
    className = ""
}: {
    icon: any
    title: string
    desc: string
    gradient: string
    index?: number
    className?: string
}) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-40px" })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: customEase, delay: index * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`group relative rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 overflow-hidden transition-all duration-300 ${className}`}
        >
            {/* Top gradient line */}
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            <div className="p-8 h-full flex flex-col">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-[14px] text-slate-500 leading-relaxed flex-1">{desc}</p>
                <div className="mt-6 flex items-center gap-1.5 text-[13px] font-bold text-orange-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </div>
            </div>
        </motion.div>
    )
}

/* ──────────────────────────────────────────
   MAIN PAGE
   ────────────────────────────────────────── */
export default function LandingPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)

    // Scroll parallax (only animate when loaded)
    const { scrollYProgress } = useScroll()
    const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -40])

    // Lock scroll during preloader
    useEffect(() => {
        if (isLoading) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "auto"
        }
        return () => { document.body.style.overflow = "auto" }
    }, [isLoading])

    return (
        <div className={`relative w-full bg-[#FCFCFD] overflow-x-hidden selection:bg-orange-100 selection:text-orange-900 ${GeistSans.className}`}>

            <AnimatePresence>
                {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
            </AnimatePresence>

            {/* ═══════════ NAVBAR ═══════════ */}
            <motion.nav
                initial={{ opacity: 0, y: -20 }}
                animate={!isLoading ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: customEase, delay: 0.2 }}
                className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50"
            >
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="text-[22px] font-bold tracking-tight" style={{ fontFamily: pixel, color: "#F97316" }}>
                            OrbitX
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">Platform</a>
                        <a href="#how-it-works" className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">How it Works</a>
                        <button
                            onClick={() => router.push("/dashboard?demo=true")}
                            className="text-[13px] font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors"
                        >
                            Try Demo
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* ═══════════ HERO ═══════════ */}
            <motion.section
                style={{ y: heroY }}
                className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-20"
            >
                {/* Clean SaaS Background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />
                </div>

                {/* Minimal Orange Blob */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <motion.div
                        className="w-[600px] h-[600px] rounded-full"
                        style={{ background: "radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)", filter: "blur(60px)" }}
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>

                {/* Smooth Orbits */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <OrbitRing size={380} duration={18} dotSize={6} ringOpacity={0.15} dotColor="#F97316" />
                    <OrbitRing size={520} duration={26} dotSize={5} ringOpacity={0.08} dotColor="#FB923C" reverse />
                    <OrbitRing size={680} duration={38} dotSize={4} ringOpacity={0.04} dotColor="#FDBA74" dashed />
                </div>

                <div className="relative z-10 text-center max-w-4xl mx-auto mt-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                        animate={!isLoading ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                        transition={{ duration: 0.8, ease: customEase, delay: 0.1 }}
                    >
                        <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full border border-orange-200/60 bg-orange-50/50 text-orange-600 text-[12px] font-bold tracking-wide">
                            <Sparkles className="w-3.5 h-3.5" />
                            AI-POWERED KNOWLEDGE GRAPH
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                        animate={!isLoading ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                        transition={{ duration: 0.8, ease: customEase, delay: 0.2 }}
                        className="mb-6"
                    >
                        <span className="block text-slate-900 text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-[1.05] tracking-tight">
                            Your GitHub,
                        </span>
                        <span className="block text-[clamp(3.5rem,8vw,7.5rem)] leading-[0.9] mt-2 pb-2" style={{ fontFamily: editorial, fontStyle: "italic", color: "#F97316" }}>
                            Decoded.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                        animate={!isLoading ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                        transition={{ duration: 0.8, ease: customEase, delay: 0.3 }}
                        className="text-slate-500 text-[17px] sm:text-[19px] leading-relaxed max-w-2xl mx-auto mb-10 font-medium tracking-tight"
                    >
                        Visualize your engineering skills as a living 3D constellation. Discover gaps, plan your career roadmap, and get recruited.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                        animate={!isLoading ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                        transition={{ duration: 0.8, ease: customEase, delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <GitHubAuthButton />
                        <button
                            onClick={() => router.push("/dashboard?demo=true")}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-[14px] hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            View Live Demo
                        </button>
                    </motion.div>
                </div>
            </motion.section>

            {/* ═══════════ STATS ═══════════ */}
            <section className="relative py-16 bg-white border-y border-slate-200/60">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                        {[
                            { value: "AI-Powered", label: "Gap Analysis", icon: Cpu },
                            { value: "Interactive", label: "3D Visualization", icon: Layers },
                            { value: "Real-time", label: "Skill Tracking", icon: TrendingUp },
                        ].map((stat, i) => {
                            const ref = useRef(null)
                            const isInView = useInView(ref, { once: true, margin: "-20px" })
                            return (
                                <motion.div
                                    ref={ref}
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.6, ease: customEase, delay: i * 0.1 }}
                                    className="flex items-center gap-5 md:justify-center py-4 md:py-0"
                                >
                                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                                        <stat.icon className="w-5 h-5 text-orange-500" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <p className="text-[19px] font-bold text-slate-900 tracking-tight">{stat.value}</p>
                                        <p className={`text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 ${GeistMono.className}`}>{stat.label}</p>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ═══════════ FEATURES ═══════════ */}
            <section id="features" className="py-24 sm:py-32 px-6 bg-[#FCFCFD]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
                            Platform <span style={{ fontFamily: editorial, fontStyle: "italic", fontWeight: 400, color: "#F97316" }}>capabilities</span>
                        </h2>
                        <p className="text-[17px] text-slate-500 max-w-xl mx-auto font-medium">
                            Everything you need to understand your true engineering footprint.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard icon={GitBranch} title="3D Skill Graph" desc="Every language and framework mapped into an explorable 3D constellation." gradient="from-orange-500 to-orange-400" className="lg:col-span-2" index={0} />
                        <FeatureCard icon={Cpu} title="AI Gap Analysis" desc="Gemini reveals the exact skills between you and your dream role." gradient="from-slate-800 to-slate-700" index={1} />
                        <FeatureCard icon={Route} title="Career Roadmap" desc="A personalized, phase-by-phase learning plan." gradient="from-slate-800 to-slate-700" index={2} />
                        <FeatureCard icon={BarChart3} title="Market Insights" desc="Real-time demand data for every node in your graph." gradient="from-orange-500 to-orange-400" className="lg:col-span-2" index={3} />
                    </div>
                </div>
            </section>

            {/* ═══════════ CTA ═══════════ */}
            <section className="py-24 px-6 bg-white border-t border-slate-200/50">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl text-slate-900 font-bold tracking-tight mb-6">
                        Ready to decode <span style={{ fontFamily: editorial, fontStyle: "italic", color: "#F97316" }}>your potential?</span>
                    </h2>
                    <p className="text-[17px] text-slate-500 mb-10 font-medium">
                        Connect your GitHub in seconds. No credit card required.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <GitHubAuthButton />
                    </div>
                </div>
            </section>

            {/* ═══════════ FOOTER ═══════════ */}
            <footer className="py-8 bg-slate-50 border-t border-slate-200 border-dashed text-center">
                <p className="text-[13px] font-medium text-slate-500 flex items-center justify-center gap-1.5">
                    &copy; {new Date().getFullYear()} <span style={{ fontFamily: pixel, color: "#F97316" }} className="text-[17px] font-bold ml-1 tracking-tight">OrbitX</span>. Built for developers.
                </p>
            </footer>
        </div>
    )
}
