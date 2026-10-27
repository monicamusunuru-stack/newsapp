import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import process from 'node:process'
import authRoutes from './routes/auth.js'

const { MONGODB_URI, JWT_SECRET } = process.env
if (!MONGODB_URI || !JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('Set MONGODB_URI and a JWT_SECRET of at least 32 characters in .env.')
}

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())
app.use('/api/auth', authRoutes)
app.use((error, _request, response, next) => {
  if (response.headersSent) return next(error)
  console.error(error)
  return response.status(500).json({ message: 'An unexpected server error occurred.' })
})
const port = Number(process.env.PORT) || 5000
await mongoose.connect(MONGODB_URI)
app.listen(port, () => {
  console.log(`API server listening on port ${port}`)
})
