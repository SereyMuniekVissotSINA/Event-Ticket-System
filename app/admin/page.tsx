'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/lib/api';
import { Event, Booking } from '@/types';
import { FaMapMarkerAlt, FaCalendar, FaStar } from 'react-icons/fa';

export default function AdminPage() {
  const router = useRouter();
  const { user, token, loading: authLoading, isAdmin } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'refunds'>('events');
  const [refundRequests, setRefundRequests] = useState<Booking[]>([]);
  const [refundLoading, setRefundLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [deleteEventBookings, setDeleteEventBookings] = useState(0);
  const [deletingEvent, setDeletingEvent] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    venue: '',
    date: '',
    time: '',
    seatCapacity: '',
    vipSeatCapacity: '',
    price: '',
    vipPrice: '',
    imageUrl: '',
  });

  useEffect(() => {
    if (!authLoading) {
      if (!token || !isAdmin()) {
        router.push('/');
      } else {
        fetchEvents();
        if (activeTab === 'refunds') {
          fetchRefundRequests();
        }
      }
    }
  }, [authLoading, token, isAdmin, router, activeTab]);

  const fetchRefundRequests = async () => {
    if (!token) return;
    try {
      setRefundLoading(true);
      const data = await api.getRefundRequests(token);
      console.log('Refund requests fetched:', data);
      setRefundRequests(data || []);
      setError('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load refund requests';
      console.error('Error fetching refund requests:', errorMsg);
      setError(errorMsg);
      setRefundRequests([]);
    } finally {
      setRefundLoading(false);
    }
  };

  const fetchEvents = async () => {
    if (!token) return;
    try {
      setLoading(true);
      console.log('[Fetch Events] Loading events...');
      const data = await api.getEvents();
      console.log('[Fetch Events] Loaded', data?.length || 0, 'events');
      setEvents(data || []);
      setError('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load events';
      console.error('[Fetch Events] Error:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRefund = async (bookingId: string) => {
    if (!token) return;
    try {
      await api.approveRefund(token, bookingId);
      await fetchRefundRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve refund');
    }
  };

  const handleRejectRefund = async (bookingId: string) => {
    if (!token) return;
    try {
      await api.rejectRefund(token, bookingId);
      await fetchRefundRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject refund');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setFormLoading(true);
      setError('');

      // Validate form data
      if (!formData.title || !formData.description || !formData.category || !formData.venue || !formData.date || !formData.time || !formData.seatCapacity || !formData.price) {
        setError('Please fill in all required fields');
        setFormLoading(false);
        return;
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        venue: formData.venue,
        date: formData.date,
        time: formData.time,
        seatCapacity: parseInt(formData.seatCapacity),
        vipSeatCapacity: formData.vipSeatCapacity ? parseInt(formData.vipSeatCapacity) : 0,
        price: parseFloat(formData.price),
        vipPrice: formData.vipPrice ? parseFloat(formData.vipPrice) : 0,
        imageUrl: formData.imageUrl || '',
      };

      console.log('[Event Submit] Saving event:', editingEvent ? `Updating ${editingEvent._id}` : 'Creating new');

      if (editingEvent) {
        await api.updateEvent(token, editingEvent._id, eventData);
        console.log('[Event Submit] Event updated successfully');
      } else {
        await api.createEvent(token, eventData);
        console.log('[Event Submit] Event created successfully');
      }

      // Clear form
      setFormData({
        title: '',
        description: '',
        category: '',
        venue: '',
        date: '',
        time: '',
        seatCapacity: '',
        vipSeatCapacity: '',
        price: '',
        vipPrice: '',
        imageUrl: '',
      });
      setShowForm(false);
      setEditingEvent(null);
      setError('');

      // Refresh events list
      await fetchEvents();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save event';
      console.error('[Event Submit] Error:', errorMsg);
      setError(errorMsg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      venue: event.venue,
      date: event.date,
      time: event.time,
      seatCapacity: event.seatCapacity.toString(),
      vipSeatCapacity: (event.vipSeatCapacity || 0).toString(),
      price: event.price.toString(),
      vipPrice: (event.vipPrice || 0).toString(),
      imageUrl: event.imageUrl || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!token) return;
    
    console.log('[Event Delete] Attempting to delete event:', eventId);
    try {
      setFormLoading(true);
      await api.deleteEvent(token, eventId);
      console.log('[Event Delete] Event deleted successfully');
      setError('');
      await fetchEvents();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete event';
      console.error('[Event Delete] Error:', errorMsg);
      
      // Check if it's a booking conflict error (409) - check for "booking" and "cannot be deleted"
      if ((errorMsg.includes('booking') || errorMsg.includes('bookings')) && errorMsg.includes('cannot be deleted')) {
        console.log('[Event Delete] Event has bookings, showing confirmation modal');
        // Extract booking count from error message
        const bookingMatch = errorMsg.match(/(\d+)\s+booking/);
        const bookingCount = bookingMatch ? parseInt(bookingMatch[1]) : 1;
        console.log('[Event Delete] Extracted booking count:', bookingCount);
        setDeleteEventId(eventId);
        setDeleteEventBookings(bookingCount);
        setShowDeleteModal(true);
        setError('');
      } else {
        console.log('[Event Delete] Not a booking conflict, setting error');
        setError(errorMsg);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDeleteWithBookings = async () => {
    if (!token || !deleteEventId) return;

    try {
      setDeletingEvent(true);
      console.log('[Event Delete] Force deleting event with bookings:', deleteEventId);
      await api.deleteEvent(token, deleteEventId, true); // Pass force=true
      console.log('[Event Delete] Event and bookings deleted successfully');
      // show success feedback briefly
      setShowDeleteModal(false);
      setDeleteEventId(null);
      setDeleteEventBookings(0);
      setError('');
      // Optionally show a small UI toast — simple inline approach: refresh after short delay
      setTimeout(() => fetchEvents(), 300);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete event';
      console.error('[Event Delete] Force delete error:', errorMsg);
      setError(errorMsg);
    } finally {
      setDeletingEvent(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      venue: '',
      date: '',
      time: '',
      seatCapacity: '',
      vipSeatCapacity: '',
      price: '',
      vipPrice: '',
      imageUrl: '',
    });
    setError('');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!token || !isAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your events</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            My Dashboard
          </button>
        </div>
      </div>

      {/* Modal Overlay for Event Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl my-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select a category</option>
                    <option value="Music">Music</option>
                    <option value="Sports">Sports</option>
                    <option value="Conference">Conference</option>
                    <option value="Theater">Theater</option>
                    <option value="Exhibition">Exhibition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue *
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Venue name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Standard Seat Capacity *
                  </label>
                  <input
                    type="number"
                    name="seatCapacity"
                    value={formData.seatCapacity}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VIP Seat Capacity
                  </label>
                  <input
                    type="number"
                    name="vipSeatCapacity"
                    value={formData.vipSeatCapacity}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Standard Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VIP Price
                  </label>
                  <input
                    type="number"
                    name="vipPrice"
                    value={formData.vipPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Event description"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={formLoading}
                  className={`flex-1 font-bold py-2 px-4 rounded-lg transition ${
                    formLoading
                      ? 'bg-blue-400 text-white cursor-not-allowed opacity-75'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {formLoading ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={formLoading}
                  className={`flex-1 font-bold py-2 px-4 rounded-lg transition ${
                    formLoading
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'events'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Events Management
          </button>
          <button
            onClick={() => {
              setActiveTab('refunds');
              fetchRefundRequests();
            }}
            className={`px-6 py-3 font-medium transition relative ${
              activeTab === 'refunds'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Refund Requests
            {refundRequests.length > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {refundRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <>
            {/* Create Event Button */}
            {!showForm && (
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingEvent(null);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg mb-8 transition inline-flex items-center gap-2"
              >
                ➕ Create New Event
              </button>
            )}

          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-600">Loading events...</div>
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 mb-4">No events created yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const standardAvailable = event.seatCapacity - event.bookedSeats;
                const vipAvailable = (event.vipSeatCapacity || 0) - (event.bookedVipSeats || 0);
                const isSoldOut = standardAvailable === 0 && (vipAvailable === 0 || (event.vipSeatCapacity || 0) === 0);

                return (
                  <div
                    key={event._id}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col"
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
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                          <span className="text-white text-4xl">{event.category.charAt(0)}</span>
                        </div>
                      )}
                      {isSoldOut && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">SOLD OUT</span>
                        </div>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="mb-3">
                        <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                          {event.category}
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {event.title}
                      </h3>

                      <p className="text-sm text-gray-600 mb-1"><FaMapMarkerAlt className="inline text-red-500 mr-2" />{event.venue}</p>
                      <p className="text-sm text-gray-600 mb-3">
                        <FaCalendar className="inline text-blue-500 mr-2" /> {new Date(event.date).toLocaleDateString()} @ {event.time}
                      </p>

                      {/* Pricing */}
                      <div className="mb-3 pb-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          ${event.price.toFixed(2)} per ticket
                        </p>
                        {event.vipPrice! > 0 && (
                          <p className="text-sm text-purple-600 font-semibold">
                            <FaStar className="inline text-purple-500 mr-2" /> VIP: ${event.vipPrice!.toFixed(2)}
                          </p>
                        )}
                      </div>

                      {/* Capacity Stats */}
                      <div className="space-y-2 mb-4 flex-1">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600 font-medium">Standard</span>
                            <span className="text-gray-900 font-bold">
                              {event.bookedSeats}/{event.seatCapacity}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{
                                width: `${(event.bookedSeats / event.seatCapacity) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {event.vipSeatCapacity! > 0 && (
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600 font-medium">VIP</span>
                              <span className="text-gray-900 font-bold">
                                {event.bookedVipSeats}/{event.vipSeatCapacity}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-purple-600 h-1.5 rounded-full"
                                style={{
                                  width: `${((event.bookedVipSeats || 0) / (event.vipSeatCapacity || 1)) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(event)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-lg transition text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
        )}

        {/* Refunds Tab */}
        {activeTab === 'refunds' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Refund Requests</h2>

            {refundLoading ? (
              <div className="text-center text-gray-600 py-8">Loading refund requests...</div>
            ) : refundRequests.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600">No pending refund requests</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {refundRequests.map((booking) => (
                  <div
                    key={booking._id}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-gray-600 text-sm font-medium mb-1">User</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {typeof booking.user === 'string' ? booking.user : (booking.user as any)?.name || 'Unknown'}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600 text-sm font-medium mb-1">Event</p>
                        <p className="text-lg font-semibold text-gray-900">{booking.event.title}</p>
                      </div>

                      <div>
                        <p className="text-gray-600 text-sm font-medium mb-1">Amount</p>
                        <p className="text-lg font-bold text-green-600">${booking.totalPrice?.toFixed(2)}</p>
                      </div>

                      <div>
                        <p className="text-gray-600 text-sm font-medium mb-1">Request Date</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {booking.refundRequestDate
                            ? new Date(booking.refundRequestDate).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {booking.refundReason && (
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Reason:</p>
                        <p className="text-sm text-gray-600">{booking.refundReason}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApproveRefund(booking._id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectRefund(booking._id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteEventId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🗑️</span>
              <h3 className="text-2xl font-bold text-gray-900">Delete Event?</h3>
            </div>
            
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-semibold mb-2">⚠️ Active Bookings Detected</p>
              <p className="text-yellow-700 text-sm">
                This event has <span className="font-bold text-lg text-yellow-900">{deleteEventBookings}</span> active booking(s) that will be affected.
              </p>
            </div>

            <div className="mb-6 space-y-3">
              <p className="text-gray-700 font-medium">What will happen:</p>
              <ul className="text-sm text-gray-600 space-y-2 ml-4 bg-gray-50 p-3 rounded-lg">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>All <span className="font-medium">{deleteEventBookings}</span> customers will be <span className="font-medium">automatically refunded</span></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Refund notifications will be <span className="font-medium">sent to all customers</span></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>The event will be permanently <span className="font-medium">deleted</span></span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteEventId(null);
                  setDeleteEventBookings(0);
                }}
                disabled={deletingEvent}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  deletingEvent
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
                }`}
              >
                Keep Event
              </button>
              <button
                onClick={handleConfirmDeleteWithBookings}
                disabled={deletingEvent}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                  deletingEvent
                    ? 'bg-red-400 text-white cursor-not-allowed opacity-75'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {deletingEvent ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span>🗑️</span>
                    Delete & Refund All
                  </>
                )}
              </button>
            </div>

            {deletingEvent && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  Processing refunds for {deleteEventBookings} customer{deleteEventBookings !== 1 ? 's' : ''}...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
