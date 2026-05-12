import { Event, Booking, ApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...requestInit } = options;
  const url = `${API_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(requestInit.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...requestInit,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || `API error: ${response.status}`);
  }

  return data;
}

// Auth endpoints
export async function register(
  name: string,
  email: string,
  password: string
): Promise<{ token: string; user: any }> {
  return apiCall('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function login(
  email: string,
  password: string
): Promise<{ token: string; user: any }> {
  return apiCall('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// Event endpoints
export async function getEvents(
  filters?: {
    category?: string;
    date?: string;
  }
): Promise<Event[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.date) params.append('date', filters.date);

  const queryString = params.toString();
  const response = await apiCall<{ events: Event[] }>(`/api/events${queryString ? '?' + queryString : ''}`);
  return response.events || [];
}

export async function getEventById(id: string): Promise<Event> {
  const response = await apiCall<{ event: Event }>(`/api/events/${id}`);
  return response.event;
}

export async function createEvent(
  token: string,
  eventData: Omit<Event, '_id' | 'bookedSeats' | 'createdAt'>
): Promise<Event> {
  const response = await apiCall<{ event: Event; message: string }>('/api/events', {
    method: 'POST',
    token,
    body: JSON.stringify(eventData),
  });
  return response.event;
}

export async function updateEvent(
  token: string,
  id: string,
  eventData: Partial<Omit<Event, '_id' | 'createdAt'>>
): Promise<Event> {
  const response = await apiCall<{ event: Event; message: string }>(`/api/events/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(eventData),
  });
  return response.event;
}

export async function deleteEvent(token: string, id: string, force: boolean = false): Promise<void> {
  const url = force ? `/api/events/${id}?force=true` : `/api/events/${id}`;
  return apiCall(url, {
    method: 'DELETE',
    token,
  });
}

// Booking endpoints
export async function getBookings(token: string): Promise<Booking[]> {
  const response = await apiCall<{ bookings: Booking[] }>('/api/bookings', {
    token,
  });
  return response.bookings || [];
}

export async function getBookingById(token: string, id: string): Promise<Booking> {
  const response = await apiCall<{ booking: Booking }>(`/api/bookings/${id}`, {
    token,
  });
  return response.booking;
}

export async function createBooking(
  token: string,
  eventId: string,
  quantity: number,
  ticketType?: 'standard' | 'vip'
): Promise<Booking> {
  const response = await apiCall<{ booking: Booking; qrCodeImage: string }>('/api/bookings', {
    method: 'POST',
    token,
    body: JSON.stringify({ eventId, quantity, ticketType }),
  });
  return response.booking;
}

export async function validateQR(qrCode: string): Promise<Booking> {
  const response = await apiCall<{ booking: Booking; valid: boolean }>(`/api/bookings/validate/${qrCode}`);
  return response.booking;
}

export async function requestRefund(
  token: string,
  bookingId: string,
  reason?: string
): Promise<Booking> {
  const response = await apiCall<{ booking: Booking; message: string }>(`/api/bookings/${bookingId}/refund`, {
    method: 'PUT',
    token,
    body: JSON.stringify({ reason: reason || '' }),
  });
  return response.booking;
}

export async function getAllBookingsForAdmin(token: string): Promise<Booking[]> {
  const response = await apiCall<{ bookings: Booking[] }>('/api/bookings/admin/all', {
    token,
  });
  return response.bookings || [];
}

export async function approveRefund(
  token: string,
  bookingId: string
): Promise<Booking> {
  const response = await apiCall<{ booking: Booking; message: string }>(`/api/bookings/${bookingId}/refund-action`, {
    method: 'PUT',
    token,
    body: JSON.stringify({ action: 'approve' }),
  });
  return response.booking;
}

export async function rejectRefund(
  token: string,
  bookingId: string
): Promise<Booking> {
  const response = await apiCall<{ booking: Booking; message: string }>(`/api/bookings/${bookingId}/refund-action`, {
    method: 'PUT',
    token,
    body: JSON.stringify({ action: 'reject' }),
  });
  return response.booking;
}

export async function getRefundRequests(token: string): Promise<Booking[]> {
  const response = await apiCall<{ bookings: Booking[] }>('/api/bookings/refund-requests', {
    token,
  });
  return response.bookings || [];
}

// Notification endpoints
export async function getNotifications(
  token: string,
  limit: number = 50,
  skip: number = 0,
  unreadOnly: boolean = false
): Promise<any> {
  const query = new URLSearchParams();
  query.append('limit', limit.toString());
  query.append('skip', skip.toString());
  if (unreadOnly) {
    query.append('unread', 'true');
  }

  const response = await apiCall<any>(`/api/notifications?${query.toString()}`, {
    token,
  });
  return response;
}

export async function markNotificationAsRead(token: string, notificationId: string): Promise<any> {
  const response = await apiCall<any>(`/api/notifications/${notificationId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ read: true }),
  });
  return response.notification;
}

export async function deleteNotification(token: string, notificationId: string): Promise<void> {
  return apiCall(`/api/notifications/${notificationId}`, {
    method: 'DELETE',
    token,
  });
}

