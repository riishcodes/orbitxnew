"use client"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/stores/authStore"
import { authGithub, syncGithubGraph } from "@/lib/api"

export default function AuthCallback() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { setUser, setIsDemo } = useAuthStore()
    const [status, setStatus] = useState("Authenticating...")

    useEffect(() => {
        const code = searchParams.get("code")
        if (!code) {
            router.push("/")
            return
        }

        const processLogin = async () => {
            try {
                console.log("Exchanging code related to GitHub...")
                const { access_token, user } = await authGithub(code)

                localStorage.setItem("token", access_token)
                setUser({
                    name: user.name,
                    username: user.username,
                    avatar: user.avatar,
                    target_role: user.target_role
                })
                setIsDemo(false)

                setStatus("Syncing GitHub Data... (This takes a moment)")
                await syncGithubGraph(user.github_token || access_token) // Assuming backend handles token usage

                setStatus("Redirecting...")
                router.push("/dashboard")
            } catch (err: any) {
                console.error("Login failed", err)
                const msg = err.response?.data?.detail || err.message || "Unknown error"
                setStatus(`Login failed: ${msg}`)
                // setTimeout(() => router.push("/"), 5000) // Give time to read error
            }
        }

        processLogin()
    }, [searchParams, router, setUser, setIsDemo])

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-[#F8FAFC]">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-cyan-500 rounded-full animate-spin mx-auto" />
                <p className="text-slate-500 font-bold font-mono animate-pulse">{status}</p>
            </div>
        </div>
    )
}
