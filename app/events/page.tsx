'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/lib/api';
import { Event } from '@/types';
import { FaMapMarkerAlt, FaCalendar, FaClock, FaChair, FaStar } from 'react-icons/fa';

export default function EventsPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const categories = ['Music', 'Sports', 'Conference', 'Theater', 'Exhibition'];

  useEffect(() => {
    fetchEvents();
  }, [category, date]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getEvents({
        category: category || undefined,
        date: date || undefined,
      });
      setEvents(data || []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Upcoming Events</h1>
          <p className="text-gray-600">
            Discover and book tickets for amazing events
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">Loading events...</div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No events found</p>
            <button
              onClick={() => {
                setCategory('');
                setDate('');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const availableSeats = event.seatCapacity - event.bookedSeats;
              const availableVipSeats = (event.vipSeatCapacity || 0) - (event.bookedVipSeats || 0);
              const isSoldOut = availableSeats === 0;

              return (
                <div
                  key={event._id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                >
                  {/* Event Image */}
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600">
                        <span className="text-white text-4xl font-bold">{event.category.charAt(0)}</span>
                      </div>
                    )}
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">SOLD OUT</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p className="flex items-center gap-2"><FaMapMarkerAlt className="text-red-500" /> {event.venue}</p>
                      <p className="flex items-center gap-2"><FaCalendar className="text-blue-500" /> {new Date(event.date).toLocaleDateString()}</p>
                      <p className="flex items-center gap-2"><FaClock className="text-green-500" /> {event.time}</p>
                      <p className="flex items-center gap-2"><FaChair className="text-purple-500" />
                        {isSoldOut
                          ? 'Sold Out'
                          : `${availableSeats} seats available`}
                      </p>
                      {event.vipSeatCapacity! > 0 && (
                        <p className="flex items-center gap-2"><FaStar className="text-yellow-500" />
                          VIP: {availableVipSeats > 0 ? `${availableVipSeats} available` : 'Sold Out'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Standard</p>
                          <p className="text-xl font-bold text-blue-600">${event.price}</p>
                        </div>
                        {event.vipPrice! > 0 && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500">VIP</p>
                            <p className="text-xl font-bold text-purple-600">${event.vipPrice}</p>
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/events/${event._id}`}
                        className={`block text-center px-4 py-2 rounded-lg font-medium transition ${
                          isSoldOut
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isSoldOut ? 'Sold Out' : 'Details'}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
