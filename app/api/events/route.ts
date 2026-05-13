import { NextResponse } from 'next/server'

import { connectToDatabase } from '@/lib/db'
import Event from '@/models/Event'
import { authenticateRequest, requireAdmin } from '@/middleware/auth'
import { handleMongooseError, jsonError } from '@/middleware/error'
import { validateDateFilter, validateEventInput } from '@/lib/validation'

export async function GET(request: Request) {
  try {
    await connectToDatabase()

    const url = new URL(request.url)
    const category = url.searchParams.get('category')?.trim()
    const dateFilter = validateDateFilter(url.searchParams.get('date'))
    const query: Record<string, unknown> = {}

    if (category) {
      query.category = { $regex: category, $options: 'i' }
    }

    if (dateFilter) {
      const start = new Date(dateFilter)
      start.setHours(0, 0, 0, 0)
      const end = new Date(dateFilter)
      end.setHours(23, 59, 59, 999)
      query.date = { $gte: start, $lte: end }
    }

    const events = await Event.find(query).sort({ date: 1, createdAt: -1 })

    return NextResponse.json({ events })
  } catch (error) {
    const mongooseResponse = handleMongooseError(error)

    if (mongooseResponse) {
      return mongooseResponse
    }

    return jsonError(500, 'Unable to fetch events')
  }
}

export async function POST(request: Request) {
  try {
    const auth = authenticateRequest(request)

    if (auth.response) {
      return auth.response
    }

    if (!auth.user) {
      return jsonError(401, 'Authentication required')
    }

    const forbiddenResponse = requireAdmin(auth.user)

    if (forbiddenResponse) {
      return forbiddenResponse
    }

    const body = await request.json().catch(() => null)
    const validation = validateEventInput(body)

    if (validation.errors.length > 0 || !validation.value) {
      return jsonError(400, 'Validation failed', validation.errors)
    }

    await connectToDatabase()

    const event = await Event.create(validation.value)

    return NextResponse.json({ message: 'Event created successfully', event }, { status: 201 })
  } catch (error) {
    const mongooseResponse = handleMongooseError(error)

    if (mongooseResponse) {
      return mongooseResponse
    }

    return jsonError(500, 'Unable to create event')
  }
}