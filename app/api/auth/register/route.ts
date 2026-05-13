import { NextResponse } from 'next/server'

import { connectToDatabase } from '@/lib/db'
import { signAuthToken } from '@/lib/jwt'
import User from '@/models/User'
import { handleMongooseError, jsonError } from '@/middleware/error'
import { validateRegisterInput } from '@/lib/validation'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const validation = validateRegisterInput(body)

    if (validation.errors.length > 0 || !validation.value) {
      return jsonError(400, 'Validation failed', validation.errors)
    }

    await connectToDatabase()

    const existingUser = await User.findOne({ email: validation.value.email })

    if (existingUser) {
      return jsonError(409, 'Email already exists')
    }

    const user = await User.create({
      name: validation.value.name,
      email: validation.value.email,
      password: validation.value.password,
      role: 'user',
    })

    const token = signAuthToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    })

    return NextResponse.json(
      {
        message: 'User registered successfully',
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
      { status: 201 },
    )
  } catch (error) {
    const mongooseResponse = handleMongooseError(error)

    if (mongooseResponse) {
      return mongooseResponse
    }

    return jsonError(500, 'Unable to register user')
  }
}