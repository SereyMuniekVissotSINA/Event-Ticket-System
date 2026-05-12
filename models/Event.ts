import mongoose, { Schema, type InferSchemaType } from 'mongoose'

const eventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    category: { type: String, trim: true, default: '' },
    venue: { type: String, trim: true, default: '' },
    date: { type: Date, required: true },
    time: { type: String, trim: true, default: '' },
    seatCapacity: { type: Number, required: true, min: 1 },
    vipSeatCapacity: { type: Number, default: 0, min: 0 },
    bookedSeats: { type: Number, default: 0, min: 0 },
    bookedVipSeats: { type: Number, default: 0, min: 0 },
    price: { type: Number, required: true, min: 0 },
    vipPrice: { type: Number, default: 0, min: 0 },
    imageUrl: { type: String, default: null },
  },
  { timestamps: true },
)

export type EventDocument = InferSchemaType<typeof eventSchema>

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema)

export default Event