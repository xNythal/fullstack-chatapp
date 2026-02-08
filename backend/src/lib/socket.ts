import { Server } from 'socket.io'
import http from 'http'
import express from 'express'

export function getReceiverSocketID(userID: string) {
  return userSocketMap[userID]
}

const userSocketMap: Record<string, string> = {}

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5174',
      'http://localhost:5173',
      'http://192.168.1.50:5173',
    ],
  },
})

io.on('connection', (socket) => {
  console.log('a user connected', socket.id)
  const userID = socket.handshake.query.userID
  if (typeof userID !== 'string') return
  userSocketMap[userID] = socket.id

  io.emit('getOnlineUsers', Object.keys(userSocketMap))

  socket.on('disconnect', () => {
    delete userSocketMap[userID]
    io.emit('getOnlineUsers', Object.keys(userSocketMap))
  })
})

export { io, app, server }
