'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/lib/api';
import { Booking } from '@/types';
import Image from 'next/image';
import { FaFile, FaStar, FaHandScissors, FaCheckCircle, FaPrint } from 'react-icons/fa';

export default function PrintTicketPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { token } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { bookingId } = use(params);

  useEffect(() => {
    fetchBooking();
  }, [bookingId, token]);

  const fetchBooking = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await api.getBookingById(token, bookingId);
      setBooking(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading ticket...</div>
      </div>
    );
  }

  if (!booking || !booking.event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Ticket not found'}</p>
        </div>
      </div>
    );
  }

  const event = booking.event;
  const eventDate = new Date(event.date);
  const isVip = booking.ticketType === 'vip';

  return (
    <div className="min-h-screen bg-gray-200 py-8 px-4 print:bg-white print:p-0 print:m-0 print:min-h-0">
      <div className="max-w-sm mx-auto print:max-w-full print:mx-0">
        {/* Print Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center print:hidden">
          <p className="text-blue-800 font-semibold"><FaFile className="inline text-blue-600 mr-2" />Print this page to get your ticket</p>
          <p className="text-blue-600 text-sm">Press Ctrl+P (or Cmd+P) to print</p>
        </div>

        {/* Actual Ticket - Professional Event Ticket Design */}
        <div className="bg-white rounded-none shadow-2xl overflow-hidden print:shadow-none print:m-0 print:p-0 print:rounded-none" style={{ width: '450px', margin: '0 auto' }}>
          {/* Header with gradient */}
          <div
            className={`p-6 text-white relative overflow-hidden ${
              isVip ? 'bg-gradient-to-br from-purple-700 to-indigo-600' : 'bg-gradient-to-br from-blue-700 to-cyan-600'
            }`}
            style={{
              backgroundImage: isVip
                ? 'linear-gradient(to bottom right, rgb(126, 34, 206), rgb(79, 70, 229))'
                : 'linear-gradient(to bottom right, rgb(29, 78, 216), rgb(6, 182, 212))',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
              colorAdjust: 'exact'
            }}
          >
            {/* Decorative corner elements */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="0" r="50" fill="white" />
              </svg>
            </div>

            <div className="relative z-10">
              {/* Event Title */}
              <h1 className="text-3xl font-black mb-1">{event.title}</h1>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm font-bold opacity-90">{event.category.toUpperCase()}</p>
                {isVip && (
                  <div className="bg-yellow-400 text-purple-700 px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1">
                    <FaStar className="text-xs" /> VIP
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-white opacity-30 my-3"></div>

              {/* Event Details Grid */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div>
                  <p className="opacity-75 mb-1">DATE</p>
                  <p className="font-bold text-sm">{eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="opacity-75 mb-1">TIME</p>
                  <p className="font-bold text-sm">{event.time}</p>
                </div>
                <div>
                  <p className="opacity-75 mb-1">VENUE</p>
                  <p className="font-bold text-xs truncate">{event.venue}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Perforation Line with scissors icon */}
          <div className="relative h-6 flex items-center justify-center bg-gray-50">
            <div className="w-full border-t-2 border-dashed border-gray-300 absolute"></div>
            <div className="relative z-10 bg-gray-50 px-3 text-gray-400 text-sm"><FaHandScissors /></div>
          </div>

          {/* Main Ticket Content */}
          <div className="p-6 bg-white">
            {/* Top Info Row */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Left - Booking and Seat Info */}
              <div>
                <p className="text-gray-500 text-xs font-bold mb-1">BOOKING ID</p>
                <p className="text-xl font-black text-gray-900 font-mono mb-4">{booking._id.substring(0, 12)}</p>

                <p className="text-gray-500 text-xs font-bold mb-1">QUANTITY</p>
                <p className="text-2xl font-black text-gray-900">{booking.quantity} {booking.quantity === 1 ? 'Ticket' : 'Tickets'}</p>
              </div>

              {/* Right - Price */}
              <div className="text-right">
                <p className="text-gray-500 text-xs font-bold mb-1">TOTAL PRICE</p>
                <p className="text-4xl font-black text-green-600 mb-4">
                  ${booking.totalPrice?.toFixed(2) || (booking.quantity * event.price).toFixed(2)}
                </p>
                <div className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-700 font-semibold inline-block">
                  {isVip ? 'VIP ACCESS' : 'GENERAL'}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>

            {/* QR Code Section - Centered and prominent */}
            <div className="text-center mb-4">
              <p className="text-gray-600 text-xs font-bold mb-2 uppercase tracking-widest">Scan for Entry</p>
              <div className="flex justify-center">
                <div className="bg-white p-3 border-2 border-gray-200 rounded-lg">
                  {booking.qrCodeImage ? (
                    <img
                      src={booking.qrCodeImage}
                      alt="QR Code"
                      width={150}
                      height={150}
                      className="print:w-32 print:h-32 w-40 h-40"
                    />
                  ) : (
                    <div className="w-40 h-40 print:w-32 print:h-32 flex items-center justify-center bg-gray-100 rounded">
                      <span className="text-gray-400 text-xs">QR Code unavailable</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom info line */}
            <div className="text-center text-xs text-gray-600 font-mono mb-3">
              {booking.qrCode?.substring(0, 16) || booking._id}
            </div>

            {/* Entry Instructions */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
              <p className="text-xs font-bold text-gray-700 mb-1"><FaCheckCircle className="inline text-green-600 mr-1" /> ENTRY INSTRUCTIONS</p>
              <p className="text-xs text-gray-600">Present this ticket at the entrance. Scan QR code or show booking ID.</p>
            </div>

            {/* Footer */}
            <div className="text-center mt-4 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 font-semibold">Thank you for your purchase!</p>
              <p className="text-xs text-gray-400 mt-1">Enjoy the event</p>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <div className="mt-6 text-center print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition shadow-lg flex items-center justify-center gap-2 mx-auto"
          >
            <FaPrint /> Print Ticket
          </button>
          <p className="text-gray-600 text-sm mt-4">Cut along the line above and bring to the event</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @page {
          size: 5in 7in;
          margin: 0.25in;
        }

        @media print {
          * {
            margin: 0;
            padding: 0;
          }

          html, body {
            margin: 0;
            padding: 0;
            background: white;
            width: 100%;
            height: 100%;
          }

          body {
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding: 0;
          }

          nav {
            display: none !important;
          }

          button {
            display: none !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          main {
            width: 100%;
            margin: 0;
            padding: 0;
          }

          /* Main container */
          main > div {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 0;
          }

          /* Instructions box - hide in print */
          main > div > div:first-child {
            display: none;
          }

          /* Ticket card */
          .bg-white.rounded-none {
            width: 450px;
            max-width: 100%;
            margin: 0 auto;
            box-shadow: none;
            border: 1px solid #e5e7eb;
            page-break-inside: avoid;
            background: white;
          }

          /* All text elements */
          p, div, span {
            color: black;
            background: transparent;
          }

          /* Header gradient */
          div[class*="from-purple"], div[class*="from-blue"] {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }

          /* Images and QR codes */
          img {
            max-width: 100%;
            height: auto;
            page-break-inside: avoid;
          }

          /* Remove extra bottom elements */
          main > div > div:last-child {
            display: none;
          }

          /* Prevent page breaks inside ticket */
          .bg-white {
            page-break-inside: avoid;
          }

          /* Text colors for print */
          .text-white {
            color: white !important;
          }

          .text-gray-900 {
            color: #111827 !important;
          }

          .text-gray-600 {
            color: #4b5563 !important;
          }

          .text-green-600 {
            color: #16a34a !important;
          }

          /* Background colors */
          .bg-gradient-to-br {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }

          .from-purple-700 {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }

          .from-blue-700 {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }

          .bg-yellow-400 {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }

          /* Sizing for print QR */
          .print\\:w-32 {
            width: 128px !important;
          }

          .print\\:h-32 {
            height: 128px !important;
          }
        }
      `}</style>
    </div>
  );
}
