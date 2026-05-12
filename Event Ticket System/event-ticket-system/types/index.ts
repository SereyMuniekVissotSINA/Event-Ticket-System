export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  date: string;
  time: string;
  seatCapacity: number;
  vipSeatCapacity?: number;
  bookedSeats: number;
  bookedVipSeats?: number;
  price: number;
  vipPrice?: number;
  imageUrl?: string;
  createdAt: string;
}

export interface Booking {
  _id: string;
  user: string;
  event: Event;
  quantity: number;
  bookingDate: string;
  qrCode?: string;
  qrCodeImage?: string;
  ticketType?: 'standard' | 'vip';
  seatNumber?: string;
  totalPrice?: number;
  refundStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  refundReason?: string;
  refundRequestDate?: string;
  refundProcessedDate?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  errors?: string[];
  message?: string;
}
