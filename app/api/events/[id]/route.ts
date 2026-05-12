import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

import { connectToDatabase } from '@/lib/db'
import Booking from '@/models/Booking'
import Event from '@/models/Event'
import Notification from '@/models/Notification'
import { authenticateRequest, requireAdmin } from '@/middleware/auth'
import { handleMongooseError, jsonError } from '@/middleware/error'
import { validateEventInput } from '@/lib/validation'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params

    if (!mongoose.isValidObjectId(id)) {
      return jsonError(400, 'Invalid event id')
    }

    await connectToDatabase()

    const event = await Event.findById(id)

    if (!event) {
      return jsonError(404, 'Event not found')
    }

    return NextResponse.json({ event })
  } catch (error) {
    const mongooseResponse = handleMongooseError(error)

    if (mongooseResponse) {
      return mongooseResponse
    }

    return jsonError(500, 'Unable to fetch event')
  }
}

export async function PUT(request: Request, context: RouteContext) {
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

    const { id } = await context.params

    if (!mongoose.isValidObjectId(id)) {
      return jsonError(400, 'Invalid event id')
    }

    const body = await request.json().catch(() => null)
    const validation = validateEventInput(body, true)

    if (validation.errors.length > 0 || !validation.value) {
      return jsonError(400, 'Validation failed', validation.errors)
    }

    await connectToDatabase()

    const event = await Event.findById(id)

    if (!event) {
      return jsonError(404, 'Event not found')
    }

    if (validation.value.seatCapacity !== undefined && Number(validation.value.seatCapacity) < event.bookedSeats) {
      return jsonError(400, 'seatCapacity cannot be lower than bookedSeats')
    }

    Object.assign(event, validation.value)
    await event.save()

    return NextResponse.json({ message: 'Event updated successfully', event })
  } catch (error) {
    const mongooseResponse = handleMongooseError(error)

    if (mongooseResponse) {
      return mongooseResponse
    }

    return jsonError(500, 'Unable to update event')
  }
}

export async function DELETE(request: Request, context: RouteContext) {
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

    const { id } = await context.params

    if (!mongoose.isValidObjectId(id)) {
      return jsonError(400, 'Invalid event id')
    }

    // Check if force delete is requested
    const url = new URL(request.url)
    const force = url.searchParams.get('force') === 'true'

    await connectToDatabase()

    const event = await Event.findById(id)

    if (!event) {
      return jsonError(404, 'Event not found')
    }

    const bookingCount = await Booking.countDocuments({ event: id })

    if (bookingCount > 0 && !force) {
      console.log(`[Event Delete] Event ${id} has ${bookingCount} bookings, blocking deletion`);
      return jsonError(409, `Event has ${bookingCount} booking(s) and cannot be deleted. Use force delete to remove event and all associated bookings.`)
    }

    if (force && bookingCount > 0) {
      console.log(`[Event Delete] Force deleting event ${id} with ${bookingCount} booking(s) - Processing refunds and notifications`);
      
      // Find all bookings for this event
      const bookings = await Booking.find({ event: id }).populate('user');
      
      // Process automatic refunds and create notifications
      const notificationBatch = [];
      
      for (const booking of bookings) {
        try {
          // Auto-approve the refund
          const now = new Date();
          booking.refundStatus = 'approved';
          booking.refundReason = 'Event Cancelled by Organizer';
          booking.refundRequestDate = booking.refundRequestDate || now;
          booking.refundProcessedDate = now;
          await booking.save();
          
          // Create notification for the user
          const userId = typeof booking.user === 'string' ? booking.user : booking.user._id;
          
          const notification = {
            user: userId,
            title: 'Event Cancelled - Full Refund Processed',
            message: `The event "${event.title}" has been cancelled. Your full refund of $${booking.totalPrice?.toFixed(2) || '0.00'} has been automatically processed.`,
            type: 'event_cancelled' as const,
            relatedBooking: booking._id,
            relatedEvent: event._id,
            read: false,
          };
          
          notificationBatch.push(notification);
          console.log(`[Event Delete] Auto-refund processed for booking ${booking._id}, user ${userId}`);
        } catch (bookingError) {
          console.error(`[Event Delete] Error processing refund for booking ${booking._id}:`, bookingError);
        }
      }
      
      // Create all notifications
      if (notificationBatch.length > 0) {
        try {
          await Notification.insertMany(notificationBatch);
          console.log(`[Event Delete] Created ${notificationBatch.length} notifications`);
        } catch (notificationError) {
          console.error(`[Event Delete] Error creating notifications:`, notificationError);
        }
      }
      
      // Delete all bookings for this event
      const deleteResult = await Booking.deleteMany({ event: id })
      console.log(`[Event Delete] Deleted ${deleteResult.deletedCount} booking(s)`);
    }

    await Event.findByIdAndDelete(id)
    console.log(`[Event Delete] Event ${id} deleted successfully`);

    return NextResponse.json({ 
      message: 'Event deleted successfully',
      bookingsProcessed: bookingCount,
    })
  } catch (error) {
    console.error(`[Event Delete] Error:`, error);
    const mongooseResponse = handleMongooseError(error)

    if (mongooseResponse) {
      return mongooseResponse
    }

    return jsonError(500, 'Unable to delete event')
  }
}