import { create } from 'zustand'
import axiosInstance from '../lib/axios'
import toast from 'react-hot-toast'
import axios from 'axios'
import { type Socket, io } from 'socket.io-client'
const BASE_URL =
  import.meta.env.MODE === 'development' ? 'http://192.168.1.50:5174' : '/'

interface AuthState {
  authUser: any | null
  isCheckingAuth: boolean
  isSigningUp: boolean
  isLoggingIn: boolean
  isUpdatingProfile: boolean
  checkAuth: () => Promise<any>
  signup: (data: {
    fullName: string
    email: string
    password: string
  }) => Promise<any>
  logout: () => Promise<any>
  login: (data: { email: string; password: string }) => Promise<any>
  updateProfile: (base64Image: string | ArrayBuffer | null) => Promise<any>
  connectSocket: () => Promise<any>
  disconnectSocket: () => Promise<any>
  socket: Socket | null
  onlineUsers: string[]
}

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  socket: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  onlineUsers: [],
  async checkAuth() {
    try {
      const res = await axiosInstance('/auth/check')
      set({ authUser: res.data })
      get().connectSocket()
    } catch (error) {
      if (!axios.isAxiosError(error))
        return toast.error('Something went wrong!')
      set({ authUser: null })
    } finally {
      set({ isCheckingAuth: false })
    }
  },
  async signup(data) {
    set({ isSigningUp: true })
    try {
      const res = await axiosInstance.post('/auth/signup', data)
      set({ authUser: res.data })
      toast.success('Account created successfully!')
      get().connectSocket()
    } catch (error) {
      if (!axios.isAxiosError(error))
        return toast.error('Something went wrong!')
      toast.error(error.response?.data.message)
    } finally {
      set({ isSigningUp: false })
    }
  },
  async logout() {
    try {
      await axiosInstance.post('/auth/logout')
      set({ authUser: null })
      toast.success('Logged out successfully!')
      get().disconnectSocket()
    } catch (error) {
      if (!axios.isAxiosError(error))
        return toast.error('Something went wrong!')
      toast.error(error.response?.data.message)
    }
  },
  async login(data) {
    set({ isLoggingIn: true })
    try {
      const res = await axiosInstance.post('/auth/login', data)
      set({ authUser: res.data })
      toast.success('Logged in successfully!')
      get().connectSocket()
    } catch (error) {
      if (!axios.isAxiosError(error))
        return toast.error('Something went wrong!')
      toast.error(error.response?.data.message)
    } finally {
      set({ isLoggingIn: false })
    }
  },
  async updateProfile(base64Image) {
    set({ isUpdatingProfile: true })
    try {
      const res = await axiosInstance.patch('/auth/update-profile', {
        profilePic: base64Image,
      })
      set({ authUser: res.data })
      toast.success('Profile updated successfully')
    } catch (error) {
      if (!axios.isAxiosError(error))
        return toast.error('Something went wrong!')
      toast.error(error.response?.data.message)
    } finally {
      set({ isUpdatingProfile: false })
    }
  },
  async connectSocket() {
    const { authUser, socket: oldSocket } = get()
    if (!authUser || oldSocket?.connected) return
    const socket = io(BASE_URL, { query: { userID: authUser._id } })
    socket.connect()
    set({ socket })
    socket.on('getOnlineUsers', (userIDs) => {
      set({ onlineUsers: userIDs })
    })
  },
  async disconnectSocket() {
    const { socket } = get()
    if (socket?.connected) socket.disconnect()
  },
}))
