import jwt from 'jsonwebtoken'
import process from 'node:process'

export default function requireAuth(request, response, next) {
  const token = request.cookies.newsAuth
  if (!token) {
    return response.status(401).json({ message: 'Please sign in to continue.' })
  }

  try {
    request.auth = jwt.verify(token, process.env.JWT_SECRET)
    return next()
  } catch {
    response.clearCookie('newsAuth', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth',
    })
    return response.status(401).json({ message: 'Your session has expired. Please sign in again.' })
  }
}
