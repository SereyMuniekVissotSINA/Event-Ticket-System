import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

import { connectToDatabase } from '@/lib/db'
import Booking from '@/models/Booking'
import Event from '@/models/Event'
import User from '@/models/User'
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

    // Check if user is admin
    await connectToDatabase()
    const user = await User.findById(auth.user.userId)
    if (!user || user.role !== 'admin') {
      return jsonError(403, 'Only admins can approve/reject refunds')
    }

    const { id } = await context.params

    if (!mongoose.isValidObjectId(id)) {
      return jsonError(400, 'Invalid booking id')
    }

    const body = await request.json().catch(() => ({}))
    const action = body.action // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return jsonError(400, 'Invalid action. Use "approve" or "reject"')
    }

    await connectToDatabase()

    const booking = await Booking.findById(id).populate('event')

    if (!booking) {
      return jsonError(404, 'Booking not found')
    }

    if (booking.refundStatus !== 'pending') {
      return jsonError(400, 'Only pending refund requests can be processed')
    }

    console.log(`[Refund Action] Admin ${auth.user.userId} ${action}ing refund for booking ${id}`);

    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    booking.refundStatus = newStatus
    booking.refundProcessedDate = new Date()

    await booking.save()

    console.log(`[Refund Action] Refund status updated to ${newStatus} for booking ${id}`);

    // If approved, add seats back to event
    if (action === 'approve') {
      const event = await Event.findById(booking.event._id)
      if (event) {
        const isVip = booking.ticketType === 'vip'
        if (isVip) {
          event.bookedVipSeats = Math.max(0, (event.bookedVipSeats || 0) - booking.quantity)
        } else {
          event.bookedSeats = Math.max(0, event.bookedSeats - booking.quantity)
        }
        await event.save()
        console.log(`[Refund Action] Released ${booking.quantity} ${isVip ? 'VIP' : 'standard'} seats for event ${booking.event._id}`);
      }
    }

    return NextResponse.json({
      message: `Refund ${newStatus} successfully`,
      booking,
    })
  } catch (error) {
    console.error(`[Refund Action] Error:`, error);
    const mongooseResponse = handleMongooseError(error)

    if (mongooseResponse) {
      return mongooseResponse
    }

    return jsonError(500, 'Unable to process refund action')
  }
}
