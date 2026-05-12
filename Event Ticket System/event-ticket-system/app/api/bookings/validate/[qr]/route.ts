import { NextResponse } from 'next/server'

import { connectToDatabase } from '@/lib/db'
import Booking from '@/models/Booking'
import { handleMongooseError, jsonError } from '@/middleware/error'

export async function GET(_request: Request, context: { params: Promise<{ qr: string }> }) {
  try {
    const { qr } = await context.params

    await connectToDatabase()

    const booking = await Booking.findOne({ qrCode: qr }).populate('event').populate('user', 'name email')

    if (!booking) {
      return jsonError(404, 'Invalid QR code')
    }

    return NextResponse.json({
      valid: true,
      booking,
    })
  } catch (error) {
    const mongooseResponse = handleMongooseError(error)

    if (mongooseResponse) {
      return mongooseResponse
    }

    return jsonError(500, 'Unable to validate booking')
  }
}