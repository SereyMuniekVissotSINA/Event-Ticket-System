import { NextResponse } from 'next/server'
import QRCode from 'qrcode'

import { connectToDatabase } from '@/lib/db'
import Booking from '@/models/Booking'
import Event from '@/models/Event'
import { authenticateRequest } from '@/middleware/auth'
import { handleMongooseError, jsonError } from '@/middleware/error'
import { validateBookingInput } from '@/lib/validation'

function getAppUrl(request: Request) {
  return process.env.APP_URL ?? new URL(request.url).origin
}

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

    const bookings = await Booking.find({ user: auth.user.userId })
      .populate('event')
      .sort({ bookingDate: -1 })

    return NextResponse.json({ bookings })
  } catch (error) {
    const mongooseResponse = handleMongooseError(error)

    if (mongooseResponse) {
      return mongooseResponse
    }

    return jsonError(500, 'Unable to fetch bookings')
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

    const body = await request.json().catch(() => null)
    const validation = validateBookingInput(body)

    if (validation.errors.length > 0 || !validation.value) {
      return jsonError(400, 'Validation failed', validation.errors)
    }

    await connectToDatabase()

    const event = await Event.findById(validation.value.eventId)

    if (!event) {
      return jsonError(404, 'Event not found')
    }

    const isVip = validation.value.ticketType === 'vip'
    const capacity = isVip ? event.vipSeatCapacity || 0 : event.seatCapacity
    const booked = isVip ? event.bookedVipSeats || 0 : event.bookedSeats
    const remainingSeats = capacity - booked
    const price = isVip ? event.vipPrice || 0 : event.price

    if (validation.value.quantity > remainingSeats) {
      return jsonError(400, `Only ${remainingSeats} ${isVip ? 'VIP' : 'standard'} seats available`)
    }

    const totalPrice = price * validation.value.quantity

    const booking = await Booking.create({
      user: auth.user.userId,
      event: event._id,
      quantity: validation.value.quantity,
      ticketType: validation.value.ticketType || 'standard',
      seatNumber: validation.value.seatNumber || null,
      totalPrice,
    })

    if (isVip) {
      event.bookedVipSeats = (event.bookedVipSeats || 0) + validation.value.quantity
    } else {
      event.bookedSeats += validation.value.quantity
    }
    await event.save()

    booking.qrCode = booking._id.toString()
    
    const qrCodeUrl = `${getAppUrl(request)}/tickets/${booking._id}`
    const qrCodeImage = await QRCode.toDataURL(qrCodeUrl)
    
    booking.qrCodeImage = qrCodeImage
    await booking.save()

    return NextResponse.json(
      {
        message: 'Booking created successfully',
        booking,
        qrCodeUrl,
        qrCodeImage,
      },
      { status: 201 },
    )
  } catch (error) {
    const mongooseResponse = handleMongooseError(error)

    if (mongooseResponse) {
      return mongooseResponse
    }

    return jsonError(500, 'Unable to create booking')
  }
}