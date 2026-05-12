import mongoose, { Schema } from 'mongoose'

interface INotification {
  _id?: string;
  user: string; // User ID
  title: string;
  message: string;
  type: 'event_cancelled' | 'refund_approved' | 'booking_confirmed' | 'event_reminder';
  relatedBooking?: string; // Booking ID if applicable
  relatedEvent?: string; // Event ID if applicable
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: String,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['event_cancelled', 'refund_approved', 'booking_confirmed', 'event_reminder'],
      default: 'booking_confirmed',
    },
    relatedBooking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    relatedEvent: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ read: 1 });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
