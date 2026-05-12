import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    {
      message: 'Event Ticket API is running',
      routes: [
        '/api/auth/register',
        '/api/auth/login',
        '/api/events',
        '/api/events/:id',
        '/api/bookings',
        '/api/bookings/:id',
        '/api/bookings/validate/:qr',
      ],
    },
    { status: 200 },
  )
}