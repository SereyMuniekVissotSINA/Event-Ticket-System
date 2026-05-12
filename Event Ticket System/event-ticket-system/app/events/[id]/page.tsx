'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/lib/api';
import { Event } from '@/types';
import { FaMapMarkerAlt, FaCalendar, FaClock, FaStar } from 'react-icons/fa';

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user, token } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [ticketType, setTicketType] = useState<'standard' | 'vip'>('standard');
  const [booking, setBooking] = useState(false);
  const { id } = use(params);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const data = await api.getEventById(id);
      setEvent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user || !token) {
      router.push('/auth/login');
      return;
    }

    try {
      setBooking(true);
      const bookingResponse = await api.createBooking(token, id, quantity, ticketType);
      router.push(`/bookings/${bookingResponse._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading event details...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Event not found</p>
          <button
            onClick={() => router.push('/events')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const availableSeats = event.seatCapacity - event.bookedSeats;
  const availableVipSeats = (event.vipSeatCapacity || 0) - (event.bookedVipSeats || 0);
  const selectedAvailableSeats = ticketType === 'vip' ? availableVipSeats : availableSeats;
  const isSoldOut = selectedAvailableSeats === 0;
  const selectedPrice = ticketType === 'vip' ? event.vipPrice || 0 : event.price;
  const bookedPercentage = ticketType === 'vip' 
    ? Math.round(((event.bookedVipSeats || 0) / (event.vipSeatCapacity || 1)) * 100)
    : Math.round((event.bookedSeats / event.seatCapacity) * 100);
  const progressBarWidth = `${bookedPercentage}%`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/events')}
          className="text-blue-600 hover:text-blue-700 font-medium mb-6"
        >
          ← Back to Events
        </button>

        {/* Event Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-64 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-5xl font-bold">{event.category}</div>
            </div>
          </div>

          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {event.title}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-gray-600 mb-6 text-lg">
                  {event.description}
                </p>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-2xl text-red-500 mr-4" />
                    <div>
                      <p className="text-gray-600">Venue</p>
                      <p className="text-gray-900 font-semibold">{event.venue}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <FaCalendar className="text-2xl text-blue-500 mr-4" />
                    <div>
                      <p className="text-gray-600">Date</p>
                      <p className="text-gray-900 font-semibold">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <FaClock className="text-2xl text-green-500 mr-4" />
                    <div>
                      <p className="text-gray-600">Time</p>
                      <p className="text-gray-900 font-semibold">{event.time}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <div className="mb-6">
                  <p className="text-gray-600 text-sm mb-2">Ticket Type</p>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer" style={{ borderColor: ticketType === 'standard' ? '#3b82f6' : '#e5e7eb' }}>
                      <input
                        type="radio"
                        name="ticketType"
                        value="standard"
                        checked={ticketType === 'standard'}
                        onChange={() => setTicketType('standard')}
                        className="mr-3"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">Standard Ticket</p>
                        <p className="text-sm text-gray-600">${event.price.toFixed(2)}</p>
                      </div>
                    </label>
                    {event.vipSeatCapacity! > 0 && (
                      <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer" style={{ borderColor: ticketType === 'vip' ? '#3b82f6' : '#e5e7eb' }}>
                        <input
                          type="radio"
                          name="ticketType"
                          value="vip"
                          checked={ticketType === 'vip'}
                          onChange={() => setTicketType('vip')}
                          className="mr-3"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <FaStar className="text-purple-500" />
                            <p className="font-semibold text-gray-900">VIP Ticket</p>
                          </div>
                          <p className="text-sm text-gray-600">${event.vipPrice!.toFixed(2)}</p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600 text-sm mb-2">Price per Ticket</p>
                  <p className="text-4xl font-bold text-blue-600 mb-4">
                    ${selectedPrice.toFixed(2)}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600 text-sm mb-2">Available {ticketType === 'vip' ? 'VIP ' : ''}Seats</p>
                  <div className="relative pt-2">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-gray-900">
                        {selectedAvailableSeats} / {ticketType === 'vip' ? event.vipSeatCapacity : event.seatCapacity}
                      </span>
                      <span className="text-gray-600">
                        {bookedPercentage}% booked
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <div
                        className={ticketType === 'vip' ? 'bg-purple-600 h-2 rounded-full' : 'bg-blue-600 h-2 rounded-full'}
                        style={{
                          width: progressBarWidth,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {!isSoldOut && (
                  <div className="mb-6">
                    <label className="block text-gray-600 text-sm font-medium mb-2">
                      Number of Tickets
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedAvailableSeats}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.min(Math.max(1, parseInt(e.target.value) || 1), selectedAvailableSeats))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {!isSoldOut && (
                  <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Total Price:</span>
                      <span className="text-3xl font-bold text-blue-600">
                        ${(selectedPrice * quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleBooking}
                  disabled={isSoldOut || booking}
                  className={`w-full py-3 rounded-lg font-bold transition ${
                    isSoldOut
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {booking ? 'Processing...' : isSoldOut ? 'Sold Out' : 'Book Now'}
                </button>

                {!user && (
                  <p className="mt-4 text-center text-gray-600 text-sm">
                    Please{' '}
                    <button
                      onClick={() => router.push('/auth/login')}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      login
                    </button>{' '}
                    to book tickets
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
