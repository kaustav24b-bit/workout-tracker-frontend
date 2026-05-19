import axios from 'axios'

// Base URL switches automatically between local dev and production
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081',
})

export default instance