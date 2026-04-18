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

// Retry logic with exponential backoff for network errors
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // ms

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config
        if (!config) return Promise.reject(error)

        // Initialize retry count
        config.__retryCount = config.__retryCount || 0

        // Only retry on network errors or 5xx server errors
        const isNetworkError = !error.response
        const isServerError = error.response?.status >= 500

        if ((isNetworkError || isServerError) && config.__retryCount < MAX_RETRIES) {
            config.__retryCount += 1
            const delay = RETRY_DELAY * Math.pow(2, config.__retryCount - 1)
            console.log(`API retry ${config.__retryCount}/${MAX_RETRIES} after ${delay}ms...`)
            await new Promise((resolve) => setTimeout(resolve, delay))
            return api(config)
        }

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

export const analyzeRepo = async (url: string, engine: string = 'orbitx') => {
    const res = await api.post('/graph/analyze-repo', { url, engine })
    return res.data
}

export default api
