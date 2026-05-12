import { NextResponse } from 'next/server'

import { connectToDatabase } from '@/lib/db'
import Booking from '@/models/Booking'
import User from '@/models/User'
import { authenticateRequest } from '@/middleware/auth'
import { handleMongooseError, jsonError } from '@/middleware/error'

export async function GET(request: Request) {
  try {
    const auth = authenticateRequest(request)

    if (auth.response) {
      return auth.response
    }

    if (!auth.user) {
      return jsonError(401, 'Authentication required')
    }

    await connectToDatabase()

    console.log(`[Refund Requests] Admin ${auth.user.userId} fetching refund requests`);

    // Check if user is admin
    const user = await User.findById(auth.user.userId)
    console.log(`[Refund Requests] User found:`, user?.name, 'Role:', user?.role);
    
    if (!user || user.role !== 'admin') {
      console.log(`[Refund Requests] Access denied: User is not admin`);
      return jsonError(403, 'Only admins can access this resource')
    }

    // Get all bookings with pending refund requests, sorted by request date
    const bookings = await Booking.find({ refundStatus: 'pending' })
      .populate('event')
      .populate('user', 'name email')
      .sort({ refundRequestDate: -1 })

    console.log(`[Refund Requests] Found ${bookings.length} pending refund requests`);
    if (bookings.length > 0) {
      console.log('[Refund Requests] First booking:', JSON.stringify(bookings[0], null, 2));
    }

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error(`[Refund Requests] Error:`, error);
    const mongooseResponse = handleMongooseError(error)

    if (mongooseResponse) {
      return mongooseResponse
    }

    return jsonError(500, 'Unable to fetch refund requests')
  }
}
