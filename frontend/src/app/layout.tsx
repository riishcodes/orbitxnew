import type { Metadata } from 'next'
import { Instrument_Serif } from "next/font/google"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Pixelify_Sans } from "next/font/google"
import './globals.css'

const editorial = Instrument_Serif({
    subsets: ["latin"],
    weight: "400",
    variable: "--font-editorial",
    display: "swap",
})

const pixelify = Pixelify_Sans({
    subsets: ["latin"],
    variable: "--font-pixel",
    display: "swap",
})

export const metadata: Metadata = {
    title: 'OrbitX — 3D Knowledge Graph Builder',
    description: 'AI-powered career intelligence platform. Connect GitHub, Notion & Certifications to visualize your skills as an interactive 3D knowledge graph.',
    icons: {
        icon: '/favicon.svg',
        apple: '/favicon.svg',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={`${GeistSans.variable} ${GeistMono.variable} ${editorial.variable} ${pixelify.variable} font-sans antialiased`}>
                {children}
            </body>
        </html>
    )
}
