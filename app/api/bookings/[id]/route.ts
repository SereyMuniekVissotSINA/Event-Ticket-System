import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

import { connectToDatabase } from '@/lib/db'
import Booking from '@/models/Booking'
import { authenticateRequest } from '@/middleware/auth'
import { handleMongooseError, jsonError } from '@/middleware/error'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: RouteContext) {
  try {
    const auth = authenticateRequest(request)

    if (auth.response) {
      return auth.response
    }

    if (!auth.user) {
      return jsonError(401, 'Authentication required')
    }

    const { id } = await context.params

    if (!mongoose.isValidObjectId(id)) {
      return jsonError(400, 'Invalid booking id')
    }

    await connectToDatabase()

    const booking = await Booking.findOne({ _id: id, user: auth.user.userId }).populate('event')

    if (!booking) {
      return jsonError(404, 'Booking not found')
    }

    return NextResponse.json({ booking })
  } catch (error) {
    const mongooseResponse = handleMongooseError(error)

    if (mongooseResponse) {
      return mongooseResponse
    }

    return jsonError(500, 'Unable to fetch booking')
  }
}