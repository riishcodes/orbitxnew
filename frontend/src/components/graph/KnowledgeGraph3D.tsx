"use client"
import { useEffect, useRef, useState, useMemo, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Billboard, Text, Line, OrbitControls, useTexture } from "@react-three/drei"
import { useGraphStore } from "@/stores/graphStore"
import { CATEGORY_COLORS } from "@/lib/mock-data"
import * as THREE from "three"
import {
    forceSimulation,
    forceLink,
    forceManyBody,
    forceCenter,
} from "d3-force-3d"

// ─── Icon URL map (local files) ───
const ICON_MAP: Record<string, string> = {
    react: "/icons/react.svg",
    javascript: "/icons/javascript.svg",
    css3: "/icons/css3.svg",
    html5: "/icons/html5.svg",
    nodejs: "/icons/nodejs.svg",
    express: "/icons/express.svg",
    python: "/icons/python.svg",
    fastapi: "/icons/fastapi.svg",
    mongodb: "/icons/mongodb.svg",
    numpy: "/icons/numpy.svg",
    jupyter: "/icons/jupyter.svg",
    git: "/icons/git.svg",
}

// Fallback labels for nodes without icons
const FALLBACK: Record<string, string> = {
    "ml-roadmap": "🗺️",
    "sys-design": "SD",
    "meta-cert": "🏅",
}

// ─── Types ───
interface SimNode {
    id: string
    name: string
    category: string
    maturity: number
    market_demand: number
    source?: string
    icon?: string
    x: number
    y: number
    z: number
    vx?: number
    vy?: number
    vz?: number
}

interface SimLink {
    source: string | SimNode
    target: string | SimNode
    type: string
    label?: string
    strength: number
}

// ─── Single Graph Node ───
function GraphNode({
    node,
    onClick,
    isSelected,
}: {
    node: SimNode
    onClick: () => void
    isSelected: boolean
}) {
    const { marketOverlay } = useGraphStore()
    const meshRef = useRef<THREE.Group>(null)
    const [hovered, setHovered] = useState(false)
    const iconUrl = ICON_MAP[node.id]
    const color = CATEGORY_COLORS[node.category] || "#64748B"

    // Market Analysis Logic
    const isHighDemand = node.market_demand >= 80
    const dim = marketOverlay && !isHighDemand && !isSelected
    const highlight = marketOverlay && isHighDemand

    // Smooth position animation + gentle floating
    useFrame((state) => {
        if (meshRef.current) {
            // Unique offset per node for organic feel
            const offset = node.id.length * 0.7
            const floatY = Math.sin(state.clock.elapsedTime * 0.6 + offset) * 1.5
            const floatX = Math.cos(state.clock.elapsedTime * 0.4 + offset) * 0.8

            meshRef.current.position.lerp(
                new THREE.Vector3(
                    (node.x || 0) + floatX,
                    (node.y || 0) + floatY,
                    node.z || 0
                ),
                0.08
            )
            // Pulse effect for high demand nodes
            if (highlight) {
                const s = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.12
                meshRef.current.scale.setScalar(s)
            } else {
                // Subtle breathing effect on all nodes
                const breath = 1 + Math.sin(state.clock.elapsedTime * 1.2 + offset) * 0.03
                meshRef.current.scale.setScalar(breath)
            }
        }
    })

    const baseScale = isSelected ? 1.3 : hovered ? 1.15 : 1
    const finalOpacity = dim ? 0.2 : 1

    return (
        <group ref={meshRef}>
            <Billboard follow lockX={false} lockY={false} lockZ={false}>
                {/* Glow ring behind icon */}
                <mesh scale={[baseScale * 5, baseScale * 5, 1]}>
                    <circleGeometry args={[1, 32]} />
                    <meshBasicMaterial
                        color={highlight ? "#EF4444" : color} // Red glow if high demand
                        transparent
                        opacity={highlight ? 0.6 : isSelected ? 0.35 : hovered ? 0.2 : 0.1}
                    />
                </mesh>

                {/* Icon or Fallback Badge */}
                <group>
                    <Suspense fallback={null}>
                        {iconUrl ? (
                            <IconSprite
                                url={iconUrl}
                                scale={baseScale * 5}
                                onClick={onClick}
                                onPointerOver={() => setHovered(true)}
                                onPointerOut={() => setHovered(false)}
                                opacity={finalOpacity}
                            />
                        ) : (
                            <FallbackBadge
                                label={FALLBACK[node.id] || node.name.substring(0, 2)}
                                color={color}
                                scale={baseScale * 5}
                                onClick={onClick}
                                onPointerOver={() => setHovered(true)}
                                onPointerOut={() => setHovered(false)}
                                opacity={finalOpacity}
                            />
                        )}
                    </Suspense>
                </group>

                {/* Demand Badge (only when Market Analysis is ON) */}
                {marketOverlay && (
                    <Text
                        position={[3.5, 3.5, 0]}
                        fontSize={0.7}
                        color={isHighDemand ? "#EF4444" : "#94A3B8"}
                        anchorX="left"
                        anchorY="bottom"
                        outlineWidth={0.05}
                        outlineColor="#000000"
                    >
                        {isHighDemand ? "🔥 " : ""}{node.market_demand}%
                    </Text>
                )}

                {/* Name Label */}
                <Text
                    position={[0, -5.5 * baseScale, 0]}
                    fontSize={1.4}
                    color="#0F172A"
                    fillOpacity={finalOpacity}
                    anchorX="center"
                    anchorY="top"
                    // font="/fonts/SpaceMono-Bold.ttf" 
                    // Using default font for now to match Geist vibe
                    outlineWidth={0.05}
                    outlineColor="#FFFFFF"
                >
                    {node.name}
                </Text>

                {/* Category tag */}
                <Text
                    position={[0, -7.2 * baseScale, 0]}
                    fontSize={0.9}
                    color={color}
                    fillOpacity={finalOpacity}
                    anchorX="center"
                    anchorY="top"
                    outlineWidth={0.02}
                    outlineColor="#FFFFFF"
                >
                    {node.category.toUpperCase()}
                </Text>
            </Billboard>
        </group>
    )
}

// ─── Icon Sprite (loads SVG as image texture) ───
function IconSprite({
    url,
    scale,
    onClick,
    onPointerOver,
    onPointerOut,
    opacity = 1,
}: {
    url: string
    scale: number
    onClick: () => void
    onPointerOver: () => void
    onPointerOut: () => void
    opacity?: number
}) {
    // Standard R3F loader (cached and cleaned up automatically)
    const texture = useTexture(url)

    return (
        <sprite
            scale={[scale, scale, 1]}
            onClick={onClick}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
        >
            <spriteMaterial map={texture} transparent opacity={opacity} />
        </sprite>
    )
}

// ─── Fallback Badge (canvas-drawn circle with text) ───
function FallbackBadge({
    label,
    color,
    scale,
    onClick,
    onPointerOver,
    onPointerOut,
    opacity = 1,
}: {
    label: string
    color: string
    scale: number
    onClick: () => void
    onPointerOver: () => void
    onPointerOut: () => void
    opacity?: number
}) {
    const texture = useMemo(() => {
        const canvas = document.createElement("canvas")
        canvas.width = 128
        canvas.height = 128
        const ctx = canvas.getContext("2d")!

        // Circle
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(64, 64, 60, 0, Math.PI * 2)
        ctx.fill()

        // White border
        ctx.strokeStyle = "rgba(255,255,255,0.8)"
        ctx.lineWidth = 4
        ctx.stroke()

        // Text
        ctx.font = "bold 48px Arial, sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillStyle = "#FFFFFF"
        ctx.fillText(label, 64, 68)

        const tex = new THREE.CanvasTexture(canvas)
        tex.needsUpdate = true
        return tex
    }, [label, color])

    return (
        <sprite
            scale={[scale, scale, 1]}
            onClick={onClick}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
        >
            <spriteMaterial map={texture} transparent opacity={opacity} />
        </sprite>
    )
}

// ─── Graph Link (line between two nodes) ───
function GraphLink({ link }: { link: SimLink }) {
    const ref = useRef<any>(null)
    const source = link.source as SimNode
    const target = link.target as SimNode

    const points = useMemo(() => {
        if (!source?.x || !target?.x) return [new THREE.Vector3(), new THREE.Vector3()]
        return [
            new THREE.Vector3(source.x, source.y, source.z),
            new THREE.Vector3(target.x, target.y, target.z),
        ]
    }, [source?.x, source?.y, source?.z, target?.x, target?.y, target?.z])

    const midpoint = useMemo(() => {
        return new THREE.Vector3(
            ((source?.x || 0) + (target?.x || 0)) / 2,
            ((source?.y || 0) + (target?.y || 0)) / 2,
            ((source?.z || 0) + (target?.z || 0)) / 2,
        )
    }, [source?.x, source?.y, source?.z, target?.x, target?.y, target?.z])

    const linkLabel = (link as any).label || ""

    return (
        <>
            <Line
                points={points}
                color="#CBD5E1"
                lineWidth={1}
                transparent
                opacity={0.6}
            />
            {linkLabel && (
                <Billboard position={midpoint}>
                    <Text
                        fontSize={0.8}
                        color="#64748B"
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.05}
                        outlineColor="#FAFAFA"
                    >
                        {linkLabel}
                    </Text>
                </Billboard>
            )}
        </>
    )
}

// ─── Scene (runs force simulation + renders nodes/links) ───
function GraphScene() {
    const { graphData, setSelectedNode, selectedNode, searchTerm, filterCategory } = useGraphStore()
    const [simNodes, setSimNodes] = useState<SimNode[]>([])
    const [simLinks, setSimLinks] = useState<SimLink[]>([])
    const simRef = useRef<any>(null)

    // Initialize force simulation
    useEffect(() => {
        if (graphData.nodes.length === 0) return

        const nodes: SimNode[] = graphData.nodes.map((n: any) => ({
            ...n,
            x: (Math.random() - 0.5) * 100,
            y: (Math.random() - 0.5) * 100,
            z: (Math.random() - 0.5) * 100,
        }))

        const links: SimLink[] = graphData.links.map((l: any) => ({
            ...l,
            source: l.source,
            target: l.target,
        }))

        const sim = forceSimulation(nodes, 3)
            .force(
                "link",
                forceLink(links)
                    .id((d: any) => d.id)
                    .distance(25)
                    .strength((l: any) => l.strength * 1.5)
            )
            .force("charge", forceManyBody().strength(-40))
            .force("center", forceCenter())
            .alpha(1)
            .alphaDecay(0.03)

        sim.on("tick", () => {
            setSimNodes([...nodes])
            setSimLinks([...links])
        })

        simRef.current = sim

        return () => {
            sim.stop()
        }
    }, [graphData])

    // Filter nodes
    const visibleNodes = useMemo(() => {
        return simNodes.filter((node) => {
            const matchesSearch =
                !searchTerm || node.name.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesFilter =
                !filterCategory || filterCategory === "all" || node.category === filterCategory
            return matchesSearch && matchesFilter
        })
    }, [simNodes, searchTerm, filterCategory])

    const visibleIds = new Set(visibleNodes.map((n) => n.id))

    const visibleLinks = useMemo(() => {
        return simLinks.filter((l) => {
            const srcId = typeof l.source === "string" ? l.source : l.source.id
            const tgtId = typeof l.target === "string" ? l.target : l.target.id
            return visibleIds.has(srcId) && visibleIds.has(tgtId)
        })
    }, [simLinks, visibleIds])

    return (
        <>
            <ambientLight intensity={1.5} />
            <pointLight position={[50, 50, 50]} intensity={0.5} />

            {visibleLinks.map((link, i) => (
                <GraphLink key={i} link={link} />
            ))}

            {visibleNodes.map((node) => (
                <GraphNode
                    key={node.id}
                    node={node}
                    isSelected={selectedNode?.id === node.id}
                    onClick={() => setSelectedNode(node as any)}
                />
            ))}
        </>
    )
}

// ─── Main Component (exported, wrapped in R3F Canvas) ───
export default function KnowledgeGraph3D() {
    return (
        <div className="w-full h-full" style={{ minHeight: "500px", background: "#F4F7FE" }}>
            <Canvas
                shadows={false}
                camera={{ position: [0, 0, 250], fov: 45 }}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: "high-performance",
                }}
                dpr={[1, 2]} // Support high-DPI screens
                performance={{ min: 0.5 }} // Allow downgrading on slow devices
            >
                <color attach="background" args={['#F4F7FE']} />
                <Suspense fallback={null}>
                    <GraphScene />
                </Suspense>
                <OrbitControls
                    enableDamping
                    dampingFactor={0.05}
                    rotateSpeed={0.5}
                    minDistance={50}
                    maxDistance={600}
                />
            </Canvas>
        </div>
    )
}
