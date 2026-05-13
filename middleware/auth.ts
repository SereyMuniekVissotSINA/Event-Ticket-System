import { NextResponse } from 'next/server'

import { verifyAuthToken, type AuthTokenPayload } from '@/lib/jwt'
import { jsonError } from './error'

function getBearerToken(request: Request) {
  const authorizationHeader = request.headers.get('authorization') ?? ''

  if (authorizationHeader.toLowerCase().startsWith('bearer ')) {
    return authorizationHeader.slice(7).trim()
  }

  return request.headers.get('x-auth-token')?.trim() ?? null
}

export function authenticateRequest(request: Request): { user: AuthTokenPayload | null; response: NextResponse | null } {
  const token = getBearerToken(request)

  if (!token) {
    return { user: null, response: jsonError(401, 'Authentication required') }
  }

  try {
    return { user: verifyAuthToken(token), response: null }
  } catch {
    return { user: null, response: jsonError(401, 'Invalid or expired token') }
  }
}

export function requireAdmin(user: AuthTokenPayload) {
  if (user.role !== 'admin') {
    return jsonError(403, 'Admin access required')
  }

  return null
}