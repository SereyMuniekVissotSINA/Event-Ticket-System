import { NextResponse } from 'next/server'

export function jsonError(status: number, error: string, details?: unknown) {
  const payload: Record<string, unknown> = { error }

  if (details !== undefined) {
    payload.details = details
  }

  return NextResponse.json(payload, { status })
}

export function notFoundResponse(request: Request) {
  const accept = request.headers.get('accept') ?? ''

  if (accept.includes('text/html')) {
    return new Response(
      `<!doctype html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>404 Not Found</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:Arial,Helvetica,sans-serif;background:#f7f3ec;color:#10221f}main{max-width:560px;padding:32px;text-align:center}h1{font-size:2.4rem;margin:0 0 12px}p{line-height:1.6;color:#475569}</style></head><body><main><h1>404 Not Found</h1><p>The resource you requested does not exist.</p></main></body></html>`,
      { status: 404, headers: { 'content-type': 'text/html; charset=utf-8' } },
    )
  }

  return NextResponse.json({ error: '404 Not Found' }, { status: 404 })
}

export function handleMongooseError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return null
  }

  const typedError = error as { name?: string; code?: number; errors?: Record<string, { message: string }>; message?: string }

  if (typedError.code === 11000) {
    return jsonError(409, 'Duplicate record')
  }

  if (typedError.name === 'ValidationError' && typedError.errors) {
    return jsonError(400, 'Validation failed', Object.values(typedError.errors).map((item) => item.message))
  }

  return null
}

export function apiMethodNotAllowed() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}