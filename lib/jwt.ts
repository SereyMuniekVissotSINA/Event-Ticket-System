import jwt from 'jsonwebtoken'

export type AuthTokenPayload = {
  userId: string
  email: string
  role: 'user' | 'admin'
  name: string
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET is not configured')
  }

  return secret
}

export function signAuthToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' })
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as AuthTokenPayload
}