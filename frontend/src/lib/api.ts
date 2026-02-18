import axios from 'axios'
import { MOCK_GRAPH, MOCK_USER, MOCK_GAPS, MOCK_ROADMAP, MOCK_RECRUITER } from './mock-data'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
})

// Attach auth token to every request
api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Auto-fallback to demo data on any API failure
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.warn('API unavailable — using demo data')
        const url = error.config?.url || ''
        if (url.includes('/graph')) return Promise.resolve({ data: MOCK_GRAPH })
        if (url.includes('/readiness')) return Promise.resolve({ data: { career_readiness: 58, gaps: MOCK_GAPS } })
        if (url.includes('/roadmap')) return Promise.resolve({ data: MOCK_ROADMAP })
        if (url.includes('/recruiter')) return Promise.resolve({ data: MOCK_RECRUITER })
        if (url.includes('/whatif')) return Promise.resolve({ data: { score_delta: 8, new_score: 66, original_score: 58 } })
        if (url.includes('/github')) return Promise.resolve({ data: { user: MOCK_USER } })
        return Promise.reject(error)
    }
)

export default api
