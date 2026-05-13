'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FaTicketAlt } from 'react-icons/fa';

export default function Navbar() {
  const router = useRouter();
  const { user, token, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <FaTicketAlt className="text-blue-600" />
          TicketHub
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6 flex-1 ml-12">
          <Link
            href="/events"
            className="text-gray-600 hover:text-gray-900 font-medium transition"
          >
            Browse Events
          </Link>

          {user && (
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 font-medium transition"
            >
              My Bookings
            </Link>
          )}

          {user && isAdmin() && (
            <Link
              href="/admin"
              className="text-gray-600 hover:text-gray-900 font-medium transition"
            >
              Admin Panel
            </Link>
          )}
        </div>

        {/* Auth Links */}
        <div className="flex items-center gap-4">
          {!token ? (
            <>
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                Register
              </Link>
            </>
          ) : user ? (
            <>
              <div className="text-sm">
                <p className="text-gray-900 font-medium">{user.name}</p>
                <p className="text-gray-600">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                Logout
              </button>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}