'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/lib/api';
import { Booking } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refundingId, setRefundingId] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  // Separate bookings into active and completed (approved refunds)
  const activeBookings = bookings.filter(b => !b.refundStatus || b.refundStatus === 'none' || b.refundStatus === 'pending' || b.refundStatus === 'rejected');
  const completedBookings = bookings.filter(b => b.refundStatus === 'approved');

  useEffect(() => {
    if (!authLoading) {
      if (!token) {
        router.push('/auth/login');
      } else {
        fetchBookings();
      }
    }
  }, [authLoading, token, router]);

  const fetchBookings = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await api.getBookings(token);
      setBookings(data || []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefundRequest = async () => {
    if (!token || !refundingId) return;
    try {
      await api.requestRefund(token, refundingId, refundReason);
      setShowRefundModal(false);
      setRefundReason('');
      await fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit refund request');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {user?.name}!
            </p>
          </div>
          <button
            onClick={() => router.push('/events')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Browse Events
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Bookings</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 mb-4">No bookings yet</p>
              <button
                onClick={() => router.push('/events')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Explore Events
              </button>
            </div>
          ) : (
            <>
              {/* Active Bookings Section */}
              {activeBookings.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Active Bookings</h3>
                  <div className="grid grid-cols-1 gap-6">
                    {activeBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                >
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                          {booking.event.title}
                        </h3>
                        <div className="space-y-2 text-gray-600">
                          <p>
                            <span className="font-semibold">Category:</span>{' '}
                            {booking.event.category}
                          </p>
                          <p>
                            <span className="font-semibold">Venue:</span>{' '}
                            {booking.event.venue}
                          </p>
                          <p>
                            <span className="font-semibold">Date:</span>{' '}
                            {new Date(booking.event.date).toLocaleDateString()}
                          </p>
                          <p>
                            <span className="font-semibold">Time:</span>{' '}
                            {booking.event.time}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                        <div className="mb-4">
                          <p className="text-gray-600 text-sm mb-1">Tickets</p>
                          <p className="text-3xl font-bold text-blue-600">
                            {booking.quantity}
                          </p>
                        </div>

                        <div className="mb-4">
                          <p className="text-gray-600 text-sm mb-1">Total Price</p>
                          <p className="text-2xl font-bold text-gray-900">
                            ${booking.event.price * booking.quantity}
                          </p>
                        </div>

                        <div className="text-sm text-gray-600">
                          <p>
                            Booked on{' '}
                            {new Date(booking.bookingDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* QR Code Preview */}
                    {booking.qrCodeImage && (
                      <div className="border-t border-gray-200 pt-6">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <p className="text-gray-600 text-sm mb-2">QR Code</p>
                            <p className="text-sm text-gray-500">
                              Booking ID: {booking._id}
                            </p>
                          </div>
                          <img
                            src={booking.qrCodeImage}
                            alt="Booking QR Code"
                            className="w-24 h-24"
                          />
                        </div>
                      </div>
                    )}

                    {/* Refund Status */}
                    {booking.refundStatus && booking.refundStatus !== 'none' && (
                      <div className="mt-4 mb-4">
                        <div className={`p-3 rounded-lg ${
                          booking.refundStatus === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
                          booking.refundStatus === 'approved' ? 'bg-green-50 border border-green-200' :
                          'bg-red-50 border border-red-200'
                        }`}>
                          <p className={`text-sm font-semibold ${
                            booking.refundStatus === 'pending' ? 'text-yellow-800' :
                            booking.refundStatus === 'approved' ? 'text-green-800' :
                            'text-red-800'
                          }`}>
                            Refund Status: <span className="capitalize">{booking.refundStatus}</span>
                          </p>
                          {booking.refundReason && (
                            <p className="text-xs text-gray-600 mt-1">Reason: {booking.refundReason}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="border-t border-gray-200 mt-6 pt-6 flex gap-3">
                      <button
                        onClick={() => router.push(`/bookings/${booking._id}`)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition"
                      >
                        Print
                      </button>
                      {!booking.refundStatus || booking.refundStatus === 'none' ? (
                        <button
                          onClick={() => {
                            setRefundingId(booking._id);
                            setShowRefundModal(true);
                          }}
                          className="px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 font-medium rounded-lg transition"
                        >
                          Request Refund
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-4 py-2 border border-gray-300 text-gray-500 bg-gray-100 font-medium rounded-lg cursor-not-allowed"
                        >
                          Refund Requested
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
                  </div>
                </div>
              )}

              {/* Completed/Refunded Bookings Section */}
              {completedBookings.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Refunded Bookings</h3>
                    <button
                      onClick={() => setShowCompleted(!showCompleted)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {showCompleted ? 'Hide' : 'Show'} ({completedBookings.length})
                    </button>
                  </div>
                  {showCompleted && (
                    <div className="grid grid-cols-1 gap-6">
                      {completedBookings.map((booking) => (
                        <div
                          key={booking._id}
                          className="bg-green-50 rounded-lg shadow border border-green-200 overflow-hidden opacity-75"
                        >
                          <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                  {booking.event.title}
                                </h3>
                                <div className="space-y-2 text-gray-600">
                                  <p>
                                    <span className="font-semibold">Category:</span>{' '}
                                    {booking.event.category}
                                  </p>
                                  <p>
                                    <span className="font-semibold">Venue:</span>{' '}
                                    {booking.event.venue}
                                  </p>
                                  <p>
                                    <span className="font-semibold">Date:</span>{' '}
                                    {new Date(booking.event.date).toLocaleDateString()}
                                  </p>
                                  <p>
                                    <span className="font-semibold">Time:</span>{' '}
                                    {booking.event.time}
                                  </p>
                                </div>
                              </div>

                              <div className="bg-green-100 rounded-lg p-4">
                                <div className="mb-4">
                                  <p className="text-gray-600 text-sm mb-1">Refund Status</p>
                                  <p className="text-lg font-bold text-green-700">REFUND APPROVED</p>
                                </div>
                                {booking.refundProcessedDate && (
                                  <div className="text-sm text-gray-600">
                                    <p>
                                      Processed on{' '}
                                      {new Date(booking.refundProcessedDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="border-t border-green-200 pt-4 flex gap-3">
                              <button
                                onClick={() => router.push(`/bookings/${booking._id}`)}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Request Refund</h3>
            <div className="mb-4">
              <label className="block text-gray-600 text-sm font-medium mb-2">
                Reason for refund (optional)
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Please explain why you want to request a refund..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRefundModal(false);
                  setRefundReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRefundRequest}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
