# Event Ticket System

A comprehensive full-stack event management and ticketing platform built with Next.js 16, React 19, MongoDB, and Tailwind CSS. Features include event browsing, VIP seating, booking management, QR code verification, and admin controls.

## Quick Start

### Prerequisites
- Node.js 16+
- MongoDB Atlas account
- npm or yarn

### Installation

1. **Clone and install:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   ```
   Update `.env.local` with your credentials:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   APP_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Features

- **Event Management** - Create, edit, delete events with rich details
- **VIP Seating** - Dual ticket types with separate pricing and capacity
- **User Bookings** - Browse events, select tickets, and book with validation
- **QR Verification** - Generate and validate QR codes for check-in
- **Refund System** - Request, approve, reject refunds with auto-processing
- **Admin Panel** - Comprehensive management interface for events and refunds
- **Responsive Design** - Mobile-first design optimized for all devices
- **Authentication** - JWT-based auth with role-based access control

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Backend:** Next.js API Routes, Node.js
- **Database:** MongoDB 9.6.1 with Mongoose ORM
- **Authentication:** JWT with Bearer tokens
- **UI Components:** react-icons, custom components

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Events
- `GET /api/events` - List events (with filters: category, date)
- `GET /api/events/:id` - Get single event details
- `POST /api/events` - Create event (admin only)
- `PUT /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only, with cascade refunds)

### Bookings
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create booking (standard or VIP)
- `GET /api/bookings/validate/:qrCode` - Validate ticket QR code
- `PUT /api/bookings/:id/refund` - Request refund
- `PUT /api/bookings/:id/refund-action` - Approve/reject refund (admin)

### Notifications
- `GET /api/notifications` - Get user notifications

## Project Structure

```
event-ticket-system/
├── app/
│   ├── (auth)/ - Authentication pages
│   ├── events/ - Event browsing and details
│   ├── dashboard/ - User dashboard
│   ├── admin/ - Admin panel
│   ├── api/ - API routes
│   └── layout.tsx - Root layout
├── components/ - Reusable React components
├── models/ - MongoDB schemas (Event, Booking, User, etc)
├── lib/
│   ├── db.ts - Database connection
│   ├── api.ts - Frontend API client
│   ├── validation.ts - Input validation
│   └── utils.ts - Utility functions
├── middleware/ - Auth and error handling
├── types/ - TypeScript definitions
└── public/ - Static assets
```

## Development Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `APP_URL` | Application base URL |
| `NEXT_PUBLIC_API_URL` | Frontend API URL |

## Key Features Explained

### VIP Seating
- Events can offer standard and VIP tickets with separate pricing
- Independent capacity tracking for each ticket type
- VIP info displayed across all event pages

### Booking & Checkout
- Users select ticket type (Standard or VIP) during booking
- Real-time availability calculation
- QR code generated for check-in

### Refund Workflow
- Users request refunds with optional reason
- Admins approve/reject refunds
- Auto-refund when events deleted

### Admin Controls
- Manage all events with modal forms
- View and process refund requests
- Delete events with cascade refund processing
- Real-time inventory tracking

## Deployment

Deploy to Render, Vercel, or Firebase:

1. Push code to GitHub
2. Connect repository to deployment platform
3. Set environment variables in deployment dashboard
4. Deploy automatically on push

## Known Limitations & Future Enhancements

- Payment processing not implemented (use Stripe/PayPal)
- Email notifications placeholder (integrate SendGrid)
- Admin roles basic (implement granular permissions)
- Consider adding: wishlist, reviews, analytics, coupons

## Troubleshooting

**VIP data not saving?**
- Ensure `validateEventInput()` includes VIP fields
- Check MongoDB schema has vipSeatCapacity and vipPrice

**Events not loading?**
- Verify MONGODB_URI in .env.local
- Check browser console for fetch errors

**QR code not displaying?**
- Ensure booking API response includes qrCodeImage
- Check dashboard component rendering logic

## Support & Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [MongoDB Docs](https://docs.mongodb.com)
- [Tailwind CSS](https://tailwindcss.com)
