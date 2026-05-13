'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api';
import { Booking, Event } from '@/types';
import { FaCalendar, FaMapMarkerAlt, FaStar, FaArrowLeft, FaCheck } from 'react-icons/fa';

interface TicketPageProps {
  params: Promise<{ id: string }>;
}

export default function TicketPage({ params }: TicketPageProps) {
  const router = useRouter();
  const [bookingId, setBookingId] = useState<string>('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getParams = async () => {
      const { id } = await params;
      setBookingId(id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      try {
        setLoading(true);
        const response = await api.apiCall<{ booking: Booking }>(`/api/bookings/${bookingId}`);
        setBooking(response.booking);
        setError('');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load ticket';
        console.error('Error fetching booking:', errorMsg);
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
  const ticketPrice = isVip ? event.vipPrice : event.price;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6 transition"
        >
          <FaArrowLeft /> Back
        </button>

        {/* Ticket Card */}
        <div
          className={`rounded-xl shadow-2xl overflow-hidden ${
            isVip
              ? 'bg-gradient-to-br from-purple-900 to-purple-700'
              : 'bg-gradient-to-br from-blue-900 to-blue-700'
          }`}
        >
          {/* Header */}
          <div className="bg-white bg-opacity-10 p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                <p className="text-sm opacity-90">{event.category}</p>
              </div>
              {isVip && (
                <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full font-bold text-sm flex items-center gap-2">
                  <FaStar /> VIP
                </div>
              )}
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-white bg-opacity-5 p-6 text-white space-y-4 border-b border-white border-opacity-10">
            <div className="flex items-center gap-3">
              <FaCalendar className="text-lg" />
              <div>
                <p className="text-xs opacity-75">Date & Time</p>
                <p className="font-semibold">
                  {new Date(event.date).toLocaleDateString()} @ {event.time}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-lg" />
              <div>
                <p className="text-xs opacity-75">Venue</p>
                <p className="font-semibold">{event.venue}</p>
              </div>
            </div>
          </div>

          {/* Ticket Information */}
          <div className="bg-white bg-opacity-5 p-6 text-white border-b border-white border-opacity-10">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs opacity-75 mb-1">Ticket Type</p>
                <p className="font-bold text-lg">
                  {isVip ? 'VIP' : 'Standard'}
                </p>
              </div>
              <div>
                <p className="text-xs opacity-75 mb-1">Quantity</p>
                <p className="font-bold text-lg">{booking.quantity}</p>
              </div>
            </div>

            <div className="bg-white bg-opacity-10 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <p className="text-sm opacity-75">Total Price</p>
                <p className="text-2xl font-bold">${booking.totalPrice?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white p-6 text-center">
            <p className="text-xs text-gray-600 mb-3 font-semibold">Booking ID</p>
            {booking.qrCodeImage && (
              <img
                src={booking.qrCodeImage}
                alt="QR Code"
                className="w-48 h-48 mx-auto mb-3 bg-white p-2 rounded-lg border-2 border-gray-200"
              />
            )}
            <p className="font-mono text-sm text-gray-700 break-all">{booking._id}</p>
          </div>

          {/* Status */}
          <div className="bg-gradient-to-r from-green-400 to-green-500 p-4 text-white text-center font-bold flex items-center justify-center gap-2">
            <FaCheck /> Valid Ticket
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-4 text-center">
          <p className="text-sm text-gray-600">
            Show this ticket at the venue for entry. Keep this QR code safe and don't share it with others.
          </p>
        </div>

        {/* Booking Details */}
        <div className="mt-4 bg-white rounded-lg shadow-lg p-4">
          <h3 className="font-bold text-gray-900 mb-3">Booking Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Booking ID:</span>
              <span className="font-mono text-gray-900">{booking._id.slice(-8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Booked On:</span>
              <span className="text-gray-900">
                {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="text-green-600 font-semibold">
                {booking.refundStatus === 'approved' ? 'Refunded' : 'Valid'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
