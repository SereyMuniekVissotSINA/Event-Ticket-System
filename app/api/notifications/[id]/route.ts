import { NextResponse } from 'next/server'
import mongoose from 'mongoose'

import { connectToDatabase } from '@/lib/db'
import Notification from '@/models/Notification'
import { authenticateRequest } from '@/middleware/auth'
import { handleMongooseError, jsonError } from '@/middleware/error'

type RouteContext = { params: Promise<{ id: string }> }

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

    if (!mongoose.isValidObjectId(id)) {
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

    console.log(`[Notifications] Notification ${id} marked as ${notification.read ? 'read' : 'unread'}`);

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

// Delete notification
export async function DELETE(request: Request, context: RouteContext) {
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
      return jsonError(400, 'Invalid notification id')
    }

    await connectToDatabase()

    const notification = await Notification.findById(id)

    if (!notification) {
      return jsonError(404, 'Notification not found')
    }

    // Verify ownership
    if (notification.user.toString() !== auth.user.userId) {
      return jsonError(403, 'Not authorized')
    }

    await Notification.findByIdAndDelete(id)

    console.log(`[Notifications] Notification ${id} deleted`);

    return NextResponse.json({ message: 'Notification deleted' })
  } catch (error) {
    console.error('[Notifications] Error deleting notification:', error);
    const mongooseResponse = handleMongooseError(error)

    if (mongooseResponse) {
      return mongooseResponse
    }

    return jsonError(500, 'Unable to delete notification')
  }
}
