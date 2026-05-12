'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { FaTicketAlt, FaCheckCircle, FaLock, FaBolt, FaBullseye } from 'react-icons/fa';

export default function HomePage() {
  const { user, token } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Discover & Book Amazing Events
            </h1>
            <p className="text-xl text-gray-600">
              Browse upcoming events, book tickets securely, and manage your reservations all in one place.
            </p>
            <div className="flex gap-4">
              {!token ? (
                <>
                  <Link
                    href="/events"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition text-lg"
                  >
                    Browse Events
                  </Link>
                  <Link
                    href="/auth/register"
                    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-lg transition text-lg"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/events"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition text-lg"
                  >
                    Browse Events
                  </Link>
                  <Link
                    href="/dashboard"
                    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-lg transition text-lg"
                  >
                    My Bookings
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8 md:p-12">
            <div className="space-y-4">
              <div className="text-5xl text-blue-600"><FaTicketAlt /></div>
              <h2 className="text-2xl font-bold text-gray-900">TicketHub</h2>
              <p className="text-gray-600 mb-4">Your Ultimate Event Ticketing Platform</p>

              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-2xl text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Easy Booking</p>
                    <p className="text-sm text-gray-600">
                      Select quantity and checkout in seconds
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-2xl text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">QR Code Tickets</p>
                    <p className="text-sm text-gray-600">
                      Digital QR codes for contactless entry
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-2xl text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Secure Payment</p>
                    <p className="text-sm text-gray-600">
                      JWT-protected and encrypted transactions
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FaCheckCircle className="text-2xl text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Real-time Availability</p>
                    <p className="text-sm text-gray-600">
                      Live seat availability updates
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
            Why Choose TicketHub?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <div className="text-4xl mb-4 text-gray-700"><FaLock /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Secure</h3>
              <p className="text-gray-600">
                Your data is protected with JWT authentication and encrypted connections
              </p>
            </div>

            <div className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <div className="text-4xl mb-4 text-gray-700"><FaBolt /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fast</h3>
              <p className="text-gray-600">
                Lightning-fast booking system with real-time seat availability
              </p>
            </div>

            <div className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
              <div className="text-4xl mb-4 text-gray-700"><FaBullseye /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Reliable</h3>
              <p className="text-gray-600">
                Built on MongoDB and Next.js for enterprise-grade reliability
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            {token ? `Welcome back, ${user?.name}!` : 'Ready to book your first event?'}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {token
              ? 'Browse our latest events and find something amazing to attend'
              : 'Join thousands of satisfied customers booking events with TicketHub'}
          </p>
          <Link
            href="/events"
            className="inline-block bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition text-lg"
          >
            Explore Events Now
          </Link>
        </div>
      </section>
    </div>
  );
}