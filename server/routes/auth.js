import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Buffer } from 'node:buffer'
import process from 'node:process'
import User from '../models/User.js'
import requireAuth from '../middleware/requireAuth.js'

const router = Router()
const profileTypes = new Set(['reader', 'student', 'professional', 'other'])
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/auth',
}
const sessionCookieOptions = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    profileType: user.profileType,
  }
}

function issueSession(user, response) {
  const token = jwt.sign(
    { sub: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '7d', algorithm: 'HS256' },
  )
  response.cookie('newsAuth', token, sessionCookieOptions)
}

router.post('/register', async (request, response, next) => {
  try {
    const { username, email, password, phone, profileType } = request.body ?? {}
    if (
      typeof username !== 'string'
      || username.trim().length < 2
      || username.trim().length > 30
      || typeof email !== 'string'
      || email.trim().length > 254
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      || typeof password !== 'string'
      || password.length < 8
      || Buffer.byteLength(password, 'utf8') > 72
      || typeof phone !== 'string'
      || !phone.trim()
      || phone.trim().length > 30
      || !profileTypes.has(profileType)
    ) {
      return response.status(400).json({ message: 'Please provide valid account details. Passwords must be at least 8 characters.' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const existingUser = await User.findOne({ email: normalizedEmail }).lean()
    if (existingUser) {
      return response.status(409).json({ message: 'An account with that email already exists.' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      passwordHash,
      phone: phone.trim(),
      profileType,
    })

    issueSession(user, response)
    return response.status(201).json({ user: publicUser(user) })
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({ message: 'An account with that email already exists.' })
    }
    return next(error)
  }
})

router.post('/login', async (request, response, next) => {
  try {
    const { email, password } = request.body ?? {}
    if (
      typeof email !== 'string'
      || typeof password !== 'string'
      || Buffer.byteLength(password, 'utf8') > 72
    ) {
      return response.status(400).json({ message: 'Enter your email and password.' })
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash')
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return response.status(401).json({ message: 'Email or password is incorrect.' })
    }

    issueSession(user, response)
    return response.json({ user: publicUser(user) })
  } catch (error) {
    return next(error)
  }
})

router.get('/me', requireAuth, async (request, response, next) => {
  try {
    const user = await User.findById(request.auth.sub)
    if (!user) {
      response.clearCookie('newsAuth', cookieOptions)
      return response.status(401).json({ message: 'Your account could not be found. Please sign in again.' })
    }
    return response.json({ user: publicUser(user) })
  } catch (error) {
    return next(error)
  }
})

router.post('/logout', (_request, response) => {
  response.clearCookie('newsAuth', cookieOptions)
  return response.status(204).end()
})

export default router
