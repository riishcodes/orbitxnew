"use client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useGraphStore } from "@/stores/graphStore"
import { MOCK_USER } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"

export default function Topbar() {
    const router = useRouter()
    const {
        marketOverlay, toggleMarketOverlay,
        recruiterMode, toggleRecruiterMode,
        showInsights, toggleInsights
    } = useGraphStore()

    return (
        <div className="h-auto md:h-20 bg-transparent flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-3 md:py-0 gap-3 md:gap-0">
            {/* Logo Section */}
            <div className="flex items-center gap-4 shrink-0">
                <button
                    onClick={() => router.push("/")}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                    <div>
                        <span className="text-2xl md:text-3xl font-bold text-[#FF7A00] block leading-none font-pixel tracking-wider">OrbitX</span>
                    </div>
                </button>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center gap-1 md:gap-2 bg-white border border-slate-200 shadow-sm rounded-xl px-2 py-1.5 justify-center flex-wrap">
                <ToggleButton
                    label="Insights"
                    active={showInsights}
                    onClick={toggleInsights}
                />
                <ToggleButton
                    label="Market"
                    shortLabel="Market"
                    active={marketOverlay}
                    onClick={toggleMarketOverlay}
                />
                <ToggleButton
                    label="Recruiter"
                    shortLabel="Recruiter"
                    active={recruiterMode}
                    onClick={toggleRecruiterMode}
                />
                <div className="w-[1px] h-4 bg-slate-200 mx-1 md:mx-2 hidden sm:block" />
                <Button
                    variant="ghost"
                    onClick={() => router.push("/dashboard/analytics")}
                    className="px-3 md:px-4 py-1.5 text-[10px] md:text-[11px] font-bold text-slate-600 hover:text-[#FF7A00] uppercase tracking-wider h-auto"
                >
                    Analytics
                </Button>
            </div>

            {/* Profile Section */}
            <div className="hidden md:flex items-center gap-4 bg-white border border-slate-200 shadow-sm rounded-xl px-3 py-1.5">
                <div className="text-right">
                    <p className="text-xs font-bold text-slate-900 leading-none">{MOCK_USER.name}</p>
                    <p className="text-[10px] font-medium text-slate-400">Pro Member</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                    <Image
                        src={MOCK_USER.avatar}
                        alt="avatar"
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </div>
    )
}

function ToggleButton({
    label,
    shortLabel,
    active,
    onClick,
}: {
    label: string
    shortLabel?: string
    active: boolean
    onClick: () => void
}) {
    return (
        <Button
            variant="ghost"
            onClick={onClick}
            className={`px-2 md:px-4 py-1.5 text-[10px] md:text-[11px] font-bold rounded-lg transition-all uppercase tracking-wider h-auto ${active ? "bg-[#FF7A00]/10 text-[#FF7A00] hover:bg-[#FF7A00]/20 hover:text-[#FF7A00]" : "text-slate-500 hover:text-slate-900"
                }`}
        >
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{shortLabel || label}</span>
        </Button>
    )
}
