import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const bookingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    quantity: { type: Number, required: true, min: 1 },
    bookingDate: { type: Date, default: Date.now },
    qrCode: { type: String, default: '' },
    qrCodeImage: { type: String, default: '' },
    ticketType: { type: String, enum: ['standard', 'vip'], default: 'standard' },
    seatNumber: { type: String, default: null },
    totalPrice: { type: Number, default: 0, min: 0 },
    refundStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
    refundReason: { type: String, default: '' },
    refundRequestDate: { type: Date, default: null },
    refundProcessedDate: { type: Date, default: null },
  },
  { timestamps: true },
)

export type BookingDocument = InferSchemaType<typeof bookingSchema>

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema)

export default Booking