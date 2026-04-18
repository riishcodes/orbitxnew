"use client"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useGraphStore, type AnalysisEngine } from "@/stores/graphStore"

const ENGINES: {
    id: AnalysisEngine
    label: string
    shortLabel: string
    icon: string
    color: string
    bgColor: string
    borderColor: string
    description: string
    badge: string
}[] = [
    {
        id: "orbitx",
        label: "OrbitX Engine",
        shortLabel: "OrbitX",
        icon: "⚡",
        color: "#F97316",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        description: "Fast local heuristics. Privacy-first, instant results.",
        badge: "Local",
    },
    {
        id: "gemini",
        label: "Gemini 1.5 Pro",
        shortLabel: "Gemini",
        icon: "✦",
        color: "#4285F4",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        description: "Google Gemini AI. Deep contextual reasoning.",
        badge: "AI",
    },
    {
        id: "grok",
        label: "Grok (Brutal Mode)",
        shortLabel: "Grok",
        icon: "𝕏",
        color: "#18181B",
        bgColor: "bg-slate-50",
        borderColor: "border-slate-200",
        description: "Brutally honest. No sugarcoating.",
        badge: "Raw",
    },
]

export default function EngineToggle() {
    const { analysisEngine, setAnalysisEngine } = useGraphStore()
    const [open, setOpen] = useState(false)
    const [justChanged, setJustChanged] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    const active = ENGINES.find((e) => e.id === analysisEngine) ?? ENGINES[0]

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSelect = (engine: AnalysisEngine) => {
        setAnalysisEngine(engine)
        setOpen(false)
        setJustChanged(true)
        setTimeout(() => setJustChanged(false), 1500)
    }

    return (
        <div ref={ref} className="relative">
            {/* Trigger Button */}
            <motion.button
                onClick={() => setOpen((p) => !p)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                    open
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
            >
                <span className="text-[13px] leading-none" style={{ color: open ? "white" : active.color }}>
                    {active.icon}
                </span>
                <span className="hidden sm:block">{active.shortLabel}</span>
                <span
                    className="text-[8px] font-black px-1 py-0.5 rounded uppercase tracking-wider leading-none"
                    style={{
                        backgroundColor: open ? "rgba(255,255,255,0.15)" : `${active.color}20`,
                        color: open ? "white" : active.color,
                    }}
                >
                    {active.badge}
                </span>
                <svg
                    width="8" height="8" viewBox="0 0 10 6" fill="none"
                    className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                >
                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </motion.button>

            {/* "Engine changed" micro-toast */}
            <AnimatePresence>
                {justChanged && !open && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.9 }}
                        className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-lg z-50"
                        style={{ backgroundColor: active.color }}
                    >
                        {active.icon} Switched to {active.shortLabel}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
                        className="absolute top-full mt-2 right-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="px-4 pt-3 pb-2 border-b border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Analysis Engine</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">Powers WhatIf, Copilot & scoring</p>
                        </div>

                        {/* Options */}
                        <div className="p-2 space-y-1">
                            {ENGINES.map((engine) => {
                                const isActive = analysisEngine === engine.id
                                return (
                                    <motion.button
                                        key={engine.id}
                                        onClick={() => handleSelect(engine.id)}
                                        whileHover={{ x: 2 }}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                                            isActive
                                                ? `${engine.bgColor} ${engine.borderColor} border`
                                                : "hover:bg-slate-50 border border-transparent"
                                        }`}
                                    >
                                        {/* Icon bubble */}
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 font-bold"
                                            style={{ backgroundColor: `${engine.color}15`, color: engine.color }}
                                        >
                                            {engine.icon}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1">
                                                <span className="text-[12px] font-bold text-slate-900 truncate">{engine.label}</span>
                                                <span
                                                    className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0"
                                                    style={{ backgroundColor: `${engine.color}15`, color: engine.color }}
                                                >
                                                    {engine.badge}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{engine.description}</p>
                                        </div>

                                        {/* Active check */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="engine-check"
                                                className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                                                style={{ backgroundColor: engine.color }}
                                            >
                                                <svg width="8" height="8" viewBox="0 0 12 10" fill="none">
                                                    <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </motion.div>
                                        )}
                                    </motion.button>
                                )
                            })}
                        </div>

                        {/* Footer note */}
                        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
                            <p className="text-[9px] text-slate-400 leading-tight">
                                Gemini & Grok require a valid API key in your environment. OrbitX engine always works offline.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
