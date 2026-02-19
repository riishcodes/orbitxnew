import axios from 'axios'
import { MOCK_GRAPH, MOCK_USER, MOCK_GAPS, MOCK_ROADMAP, MOCK_RECRUITER } from './mock-data'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 60000,
})

// Attach auth token to every request
api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Auto-fallback to demo data on any API failure - REMOVED for production
api.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error)
    }
)

export const authGithub = async (code: string) => {
    const res = await api.post('/auth/github', { code })
    return res.data
}

export const syncGithubGraph = async (token: string) => {
    const res = await api.post('/graph/sync/github', { token })
    return res.data
}

export default api
