import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

import { connectToDatabase } from '@/lib/db'
import Booking from '@/models/Booking'
import { authenticateRequest } from '@/middleware/auth'
import { handleMongooseError, jsonError } from '@/middleware/error'

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(request: Request, context: RouteContext) {
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

    const body = await request.json().catch(() => ({}))
    const reason = body.reason || ''

    await connectToDatabase()

    console.log(`[Refund Request] User ${auth.user.userId} requesting refund for booking ${id}`);

    const booking = await Booking.findOne({ _id: id, user: auth.user.userId })

    if (!booking) {
      console.log(`[Refund Request] Booking not found for user ${auth.user.userId} and booking ${id}`);
      return jsonError(404, 'Booking not found')
    }

    console.log(`[Refund Request] Current refund status: ${booking.refundStatus}`);

    if (booking.refundStatus && booking.refundStatus !== 'none') {
      console.log(`[Refund Request] Refund already exists with status: ${booking.refundStatus}`);
      return jsonError(400, 'This booking already has a refund request pending or processed')
    }

    booking.refundStatus = 'pending'
    booking.refundReason = reason
    booking.refundRequestDate = new Date()

    await booking.save()
    console.log(`[Refund Request] Refund status updated to pending for booking ${id}`);
    console.log(`[Refund Request] Booking after save:`, JSON.stringify(booking, null, 2));

    return NextResponse.json({
      message: 'Refund request submitted successfully',
      booking,
    })
  } catch (error) {
    console.error(`[Refund Request] Error:`, error);
    const mongooseResponse = handleMongooseError(error)

    if (mongooseResponse) {
      return mongooseResponse
    }

    return jsonError(500, 'Unable to process refund request')
  }
}
