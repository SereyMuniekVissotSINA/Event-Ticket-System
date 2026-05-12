import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

import { connectToDatabase } from '@/lib/db'
import Notification from '@/models/Notification'
import { authenticateRequest } from '@/middleware/auth'
import { handleMongooseError, jsonError } from '@/middleware/error'

type RouteContext = { params: Promise<{ id?: string }> }

// GET all notifications for the authenticated user
export async function GET(request: Request, context: RouteContext) {
  try {
    const auth = authenticateRequest(request)

    if (auth.response) {
      return auth.response
    }

    if (!auth.user) {
      return jsonError(401, 'Authentication required')
    }

    await connectToDatabase()

    const userId = auth.user.userId

    // Get query parameters
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const skip = parseInt(url.searchParams.get('skip') || '0')
    const unreadOnly = url.searchParams.get('unread') === 'true'

    // Build query
    const query: any = { user: userId }
    if (unreadOnly) {
      query.read = false
    }

    // Fetch notifications with pagination
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('relatedEvent', 'title')
      .populate('relatedBooking', 'totalPrice ticketType')

    const total = await Notification.countDocuments(query)
    const unreadCount = await Notification.countDocuments({ user: userId, read: false })

    console.log(`[Notifications] User ${userId} fetched ${notifications.length} notifications (${unreadCount} unread)`);

    return NextResponse.json({
      notifications,
      total,
      unreadCount,
      limit,
      skip,
    })
  } catch (error) {
    console.error('[Notifications] Error fetching notifications:', error);
    const mongooseResponse = handleMongooseError(error)

    if (mongooseResponse) {
      return mongooseResponse
    }

    return jsonError(500, 'Unable to fetch notifications')
  }
}

// Mark notification as read
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = authenticateRequest(request)

    if (auth.response) {
      return auth.response
    }

    if (!auth.user) {
      return jsonError(401, 'Authentication required')
    }

    const { id } = await context.params

    if (!id || !mongoose.isValidObjectId(id)) {
      return jsonError(400, 'Invalid notification id')
    }

    const body = await request.json().catch(() => null)

    await connectToDatabase()

    const notification = await Notification.findById(id)

    if (!notification) {
      return jsonError(404, 'Notification not found')
    }

    // Verify ownership
    if (notification.user.toString() !== auth.user.userId) {
      return jsonError(403, 'Not authorized')
    }

    // Update notification
    notification.read = body?.read !== undefined ? body.read : true
    await notification.save()

    console.log(`[Notifications] Notification ${id} marked as read`);

    return NextResponse.json({ notification })
  } catch (error) {
    console.error('[Notifications] Error updating notification:', error);
    const mongooseResponse = handleMongooseError(error)

    if (mongooseResponse) {
      return mongooseResponse
    }

    return jsonError(500, 'Unable to update notification')
  }
}
