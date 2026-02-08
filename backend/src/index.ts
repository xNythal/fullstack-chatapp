import 'dotenv/config'
import express from 'express'
import authRoutes from './routes/auth.route'
import messageRoutes from './routes/message.route'
import { connectDB } from './lib/db'
import cookieParser from 'cookie-parser'
import { app, server } from './lib/socket'
import cors from 'cors'
import path from 'path'

const PORT = process.env.PORT
const __dirname = path.resolve()

app.use(express.json({ limit: '5mb' }))
app.use(cookieParser())
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://192.168.1.50:5173',
    ],
    credentials: true,
  }),
)

app.use('/api/auth', authRoutes)
app.use('/api/messages', messageRoutes)

if (process.env.NODE_ENV) {
  app.use(express.static(path.join(__dirname, '../frontend/dist')))
  app.get('/*splat', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
  })
}

server.listen({ host: '0.0.0.0', port: PORT }, () => {
  console.log(`app is running on port: ${PORT}`)
  connectDB()
})
