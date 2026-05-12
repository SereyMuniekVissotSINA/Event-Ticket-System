import { NextResponse } from 'next/server'

import { connectToDatabase } from '@/lib/db'
import { signAuthToken } from '@/lib/jwt'
import User from '@/models/User'
import { handleMongooseError, jsonError } from '@/middleware/error'
import { validateLoginInput } from '@/lib/validation'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const validation = validateLoginInput(body)

    if (validation.errors.length > 0 || !validation.value) {
      return jsonError(400, 'Validation failed', validation.errors)
    }

    await connectToDatabase()

    const user = await User.findOne({ email: validation.value.email }).select('+password')

    if (!user) {
      return jsonError(401, 'Invalid email or password')
    }

    const isPasswordValid = await user.comparePassword(validation.value.password)

    if (!isPasswordValid) {
      return jsonError(401, 'Invalid email or password')
    }

    const token = signAuthToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    })

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    const mongooseResponse = handleMongooseError(error)

    if (mongooseResponse) {
      return mongooseResponse
    }

    return jsonError(500, 'Unable to log in user')
  }
}