"use client"
import { useRouter } from "next/navigation"
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
        <div className="h-20 bg-transparent flex items-center justify-between px-8">
            {/* Logo Section */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push("/")}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                    <div>
                        <span className="text-3xl font-bold text-[#FF7A00] block leading-none font-pixel tracking-wider">OrbitX</span>
                    </div>
                </button>
            </div>

            {/* Controls Bar - Styled like Search bar from image */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-xl px-2 py-1.5 min-w-[500px] justify-center">
                <ToggleButton
                    label="Insights"
                    active={showInsights}
                    onClick={toggleInsights}
                />
                <ToggleButton
                    label="Market Analysis"
                    active={marketOverlay}
                    onClick={toggleMarketOverlay}
                />
                <ToggleButton
                    label="Recruiter Mode"
                    active={recruiterMode}
                    onClick={toggleRecruiterMode}
                />
                <div className="w-[1px] h-4 bg-slate-200 mx-2" />
                <Button
                    variant="ghost"
                    onClick={() => router.push("/dashboard/analytics")}
                    className="px-4 py-1.5 text-[11px] font-bold text-slate-600 hover:text-[#FF7A00] uppercase tracking-wider h-auto"
                >
                    Analytics
                </Button>
            </div>

            {/* Profile Section */}
            <div className="flex items-center gap-4 bg-white border border-slate-200 shadow-sm rounded-xl px-3 py-1.5">
                <div className="text-right">
                    <p className="text-xs font-bold text-slate-900 leading-none">{MOCK_USER.name}</p>
                    <p className="text-[10px] font-medium text-slate-400">Pro Member</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                    <img
                        src={MOCK_USER.avatar}
                        alt="avatar"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </div>
    )
}

function ToggleButton({
    label,
    active,
    onClick,
}: {
    label: string
    active: boolean
    onClick: () => void
}) {
    return (
        <Button
            variant="ghost"
            onClick={onClick}
            className={`px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all uppercase tracking-wider h-auto ${active ? "bg-[#FF7A00]/10 text-[#FF7A00] hover:bg-[#FF7A00]/20 hover:text-[#FF7A00]" : "text-slate-500 hover:text-slate-900"
                }`}
        >
            {label}
        </Button>
    )
}
