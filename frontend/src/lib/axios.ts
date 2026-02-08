import axios from 'axios'

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === 'development'
      ? 'http://192.168.1.50:5174/api'
      : '/api',
  withCredentials: true,
})

export default axiosInstance
