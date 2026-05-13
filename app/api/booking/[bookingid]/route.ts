import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Booking from '@/models/Booking';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingid: string }> }
) {
  try {
    await connectToDatabase();
    const { bookingid } = await params;
    
    console.log('[BookingAPI] Fetching booking with ID:', bookingid);

    if (!bookingid) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(bookingid).populate('event');
    
    console.log('[BookingAPI] Booking found:', !!booking);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('[BookingAPI] Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
