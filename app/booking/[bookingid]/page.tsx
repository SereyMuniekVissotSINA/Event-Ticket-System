'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Booking, Event } from '@/types';
import { FaCalendar, FaMapMarkerAlt, FaStar, FaArrowLeft, FaCheck } from 'react-icons/fa';

interface TicketPageProps {
  params: Promise<{ bookingid: string }>;
}

export default function BookingTicketPage({ params }: TicketPageProps) {
  const router = useRouter();
  const [bookingId, setBookingId] = useState<string>('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getParams = async () => {
      const { bookingid } = await params;
      setBookingId(bookingid);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      try {
        setLoading(true);
        console.log('[BookingPage] Fetching booking:', bookingId);
        const response = await fetch(`/api/booking/${bookingId}`);
        const data = await response.json();
        
        console.log('[BookingPage] Response status:', response.status);
        console.log('[BookingPage] Response data:', data);
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch booking');
        }
        setBooking(data.booking);
        setError('');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load ticket';
        console.error('[BookingPage] Error fetching booking:', errorMsg);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Ticket</h1>
          <p className="text-gray-600 mb-6">{error || 'Ticket not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const event = booking.event as Event;
  const isVip = booking.ticketType === 'vip';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6 transition"
        >
          <FaArrowLeft /> Back
        </button>

        {/* Main Ticket Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Event Image Header */}
          <div className="relative h-48 md:h-64 overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600">
            {event.imageUrl ? (
              <>
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('[BookingPage] Image failed to load:', event.imageUrl);
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                <div className="text-white text-center">
                  <p className="text-6xl mb-2">🎫</p>
                  <p className="text-lg font-semibold">{event.title}</p>
                </div>
              </div>
            )}
            {isVip && (
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg">
                <FaStar /> VIP TICKET
              </div>
            )}
          </div>

          <div className="p-6 md:p-8">
            {/* Event Title & Category */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
                {event.category}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                {event.title}
              </h1>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b-2 border-dashed border-gray-300">
              <div className="flex gap-4">
                <div className="flex-shrink-0 text-2xl text-blue-600">
                  <FaCalendar />
                </div>
                <div>
                  <p className="text-xs uppercase font-semibold text-gray-600 mb-1">Date & Time</p>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-lg font-semibold text-blue-600">{event.time}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 text-2xl text-blue-600">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <p className="text-xs uppercase font-semibold text-gray-600 mb-1">Venue</p>
                  <p className="text-lg font-bold text-gray-900">{event.venue}</p>
                </div>
              </div>
            </div>

            {/* Ticket Details */}
            <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-gradient-to-r from-blue-50 to-gray-50 rounded-xl">
              <div className="text-center">
                <p className="text-xs uppercase font-semibold text-gray-600 mb-2">Type</p>
                <p className="text-2xl font-bold text-gray-900">{isVip ? 'VIP' : 'STD'}</p>
              </div>
              <div className="text-center border-l border-r border-gray-300">
                <p className="text-xs uppercase font-semibold text-gray-600 mb-2">Quantity</p>
                <p className="text-2xl font-bold text-gray-900">{booking.quantity}</p>
              </div>
              <div className="text-center">
                <p className="text-xs uppercase font-semibold text-gray-600 mb-2">Price</p>
                <p className="text-2xl font-bold text-blue-600">${booking.totalPrice?.toFixed(2)}</p>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="text-center mb-8 p-6 bg-gray-50 rounded-xl">
              <p className="text-sm uppercase font-semibold text-gray-600 mb-4">Scan to Verify</p>
              {booking.qrCodeImage && (
                <img
                  src={booking.qrCodeImage}
                  alt="QR Code"
                  className="w-56 h-56 mx-auto bg-white p-4 rounded-lg border-4 border-gray-300 shadow-md"
                />
              )}
              <p className="text-xs text-gray-500 mt-4 font-mono">ID: {booking._id.slice(-12)}</p>
            </div>

            {/* Status Footer */}
            <div className={`p-4 rounded-lg text-center font-bold text-white flex items-center justify-center gap-2 ${
              isVip 
                ? 'bg-gradient-to-r from-purple-600 to-purple-700' 
                : 'bg-gradient-to-r from-blue-600 to-blue-700'
            }`}>
              <FaCheck /> VALID TICKET - READY FOR ENTRY
            </div>

            {/* Booking Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                <div>
                  <p className="text-gray-600 text-xs uppercase mb-1">Booking ID</p>
                  <p className="font-mono font-bold text-gray-900">{booking._id.slice(-8)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs uppercase mb-1">Booked On</p>
                  <p className="font-bold text-gray-900">
                    {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs uppercase mb-1">Status</p>
                  <p className={`font-bold ${booking.refundStatus === 'approved' ? 'text-red-600' : 'text-green-600'}`}>
                    {booking.refundStatus === 'approved' ? 'REFUNDED' : 'VALID'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs uppercase mb-1">Ticket Type</p>
                  <p className="font-bold text-gray-900">{isVip ? 'VIP' : 'STANDARD'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-700 font-semibold mb-2">📋 Important Information</p>
          <p className="text-sm text-gray-600">
            Show this ticket at the venue entrance. Save the QR code - staff will scan it for entry verification. 
            Do not share this ticket with others.
          </p>
        </div>
      </div>
    </div>
  );
}
