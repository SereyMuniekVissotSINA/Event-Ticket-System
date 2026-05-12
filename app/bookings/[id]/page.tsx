'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/lib/api';
import { Booking } from '@/types';
import { FaCheckCircle, FaTicketAlt } from 'react-icons/fa';

export default function BookingConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { token } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = use(params);

  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchBooking();
  }, [id, token]);

  const fetchBooking = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await api.getBookingById(token, id);
      setBooking(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading booking details...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Booking not found</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <FaCheckCircle className="text-4xl text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Your tickets have been successfully booked
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Booking Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {booking.event.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-gray-600 text-sm mb-1">Category</p>
                <p className="text-lg font-semibold text-gray-900">
                  {booking.event.category}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Venue</p>
                <p className="text-lg font-semibold text-gray-900">
                  {booking.event.venue}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Date & Time</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(booking.event.date).toLocaleDateString()} at{' '}
                  {booking.event.time}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Tickets</p>
                <p className="text-lg font-semibold text-gray-900">
                  {booking.quantity} Ticket{booking.quantity > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="border-t border-b border-gray-200 py-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Price per ticket:</span>
                <span className="font-semibold">${booking.event.price}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-semibold">× {booking.quantity}</span>
              </div>
              <div className="flex justify-between items-center mt-4 text-lg">
                <span className="font-bold">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${booking.event.price * booking.quantity}
                </span>
              </div>
            </div>

            <div>
              <p className="text-gray-600 text-sm mb-2">Booking ID</p>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded text-gray-900">
                {booking._id}
              </p>
            </div>
          </div>
        </div>

        {/* QR Code */}
        {booking.qrCodeImage && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your QR Code</h3>
            <div className="flex justify-center">
              <img
                src={booking.qrCodeImage}
                alt="Booking QR Code"
                className="w-64 h-64"
              />
            </div>
            <p className="text-center text-gray-600 text-sm mt-4">
              Show this QR code at the venue for entry validation
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push(`/tickets/print/${id}`)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <FaTicketAlt /> Print Ticket
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
