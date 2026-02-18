import { create } from 'zustand'

interface GraphNode {
    id: string
    name: string
    category: string
    maturity: number
    market_demand: number
    val: number
    source: string
}

interface GraphLink {
    source: string
    target: string
    type: string
    strength: number
}

interface GraphState {
    graphData: { nodes: GraphNode[]; links: GraphLink[] }
    selectedNode: GraphNode | null
    searchTerm: string
    filterCategory: string
    marketOverlay: boolean
    recruiterMode: boolean
    showInsights: boolean
    setGraphData: (data: { nodes: GraphNode[]; links: GraphLink[] }) => void
    setSelectedNode: (node: GraphNode | null) => void
    setSearchTerm: (term: string) => void
    setFilterCategory: (cat: string) => void
    toggleMarketOverlay: () => void
    toggleRecruiterMode: () => void
    toggleInsights: () => void
}

export const useGraphStore = create<GraphState>((set) => ({
    graphData: { nodes: [], links: [] },
    selectedNode: null,
    searchTerm: '',
    filterCategory: 'all',
    marketOverlay: false,
    recruiterMode: false,
    showInsights: true,
    setGraphData: (data) => set({ graphData: data }),
    setSelectedNode: (node) => set({ selectedNode: node }),
    setSearchTerm: (term) => set({ searchTerm: term }),
    setFilterCategory: (cat) => set({ filterCategory: cat }),
    toggleMarketOverlay: () => set((s) => ({ marketOverlay: !s.marketOverlay })),
    toggleRecruiterMode: () => set((s) => ({ recruiterMode: !s.recruiterMode })),
    toggleInsights: () => set((s) => ({ showInsights: !s.showInsights })),
}))
