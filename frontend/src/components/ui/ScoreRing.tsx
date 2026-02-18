"use client"
import { useEffect, useState } from "react"

interface Props {
    score: number
    label?: string
    color?: string
    size?: number
}

export default function ScoreRing({
    score,
    label = "Readiness",
    color = "#06B6D4",
    size = 112,
}: Props) {
    const [displayed, setDisplayed] = useState(0)
    const radius = 45
    const circumference = 2 * Math.PI * radius

    useEffect(() => {
        setDisplayed(0)
        let current = 0
        const step = Math.max(1, Math.floor(score / 60))
        const interval = setInterval(() => {
            current += step
            if (current >= score) {
                current = score
                clearInterval(interval)
            }
            setDisplayed(current)
        }, 25)
        return () => clearInterval(interval)
    }, [score])

    return (
        <div className="flex flex-col items-center gap-1">
            <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
                {/* Background circle */}
                <circle
                    cx="50" cy="50" r={radius}
                    fill="none" stroke="#E2E8F0" strokeWidth="6"
                />
                {/* Progress arc */}
                <circle
                    cx="50" cy="50" r={radius}
                    fill="none" stroke={color} strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - displayed / 100)}
                    strokeLinecap="round"
                    style={{
                        filter: `drop-shadow(0 0 6px ${color}60)`,
                        transform: "rotate(-90deg)",
                        transformOrigin: "center",
                        transition: "stroke-dashoffset 0.08s linear",
                    }}
                />
                {/* Score text */}
                <text
                    x="50" y="52" textAnchor="middle" fill="#0F172A"
                    className="font-sans font-bold"
                >
                    <tspan fontSize="20">{displayed}</tspan>
                    <tspan fontSize="10" dx="1" dy="-6" fontFamily="var(--font-geist-mono)">%</tspan>
                </text>
                <text
                    x="50" y="68" textAnchor="middle" fill="#0F172A"
                    fontSize="6" fontFamily="var(--font-geist-mono)"
                    letterSpacing="0.15em"
                >
                    {label.toUpperCase()}
                </text>
            </svg>
        </div>
    )
}
