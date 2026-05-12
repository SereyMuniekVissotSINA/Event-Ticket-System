#!/usr/bin/env node

/**
 * MongoDB Import Script for Event Ticket System
 * 
 * This script imports CSV data into MongoDB collections with proper:
 * - Data types (ObjectIds, Dates, Numbers)
 * - Password hashing for users
 * - Relationships between documents
 * 
 * Usage: node scripts/import-data.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcryptjs from 'bcryptjs';
import mongoose from 'mongoose';
import csv from 'csv-parse/sync';
import dotenv from 'dotenv';
import QRCode from 'qrcode';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import models
import User from '../models/User.ts';
import Event from '../models/Event.ts';
import Booking from '../models/Booking.ts';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-ticket-system';

async function hashPassword(password) {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
}

function getAppUrl() {
  return process.env.APP_URL || 'http://localhost:3000';
}

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return csv.parse(content, {
    columns: true,
    skip_empty_lines: true,
  });
}

async function importUsers() {
  console.log('📥 Importing users...');
  try {
    const csvPath = path.join(__dirname, '../sample-data/users.csv');
    const records = parseCSV(csvPath);

    for (const record of records) {
      // Don't hash here - let the User model pre-save hook handle it
      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        name: record.name,
        email: record.email,
        password: record.password, // Plain password - will be hashed by pre-save hook
        role: record.role || 'user',
      });

      await user.save();
      console.log(`   ✓ Created user: ${record.email}`);
    }

    console.log(`✅ Successfully imported ${records.length} users\n`);
    return records.length;
  } catch (error) {
    console.error('❌ Error importing users:', error.message);
    throw error;
  }
}

async function importEvents() {
  console.log('📥 Importing events...');
  try {
    const csvPath = path.join(__dirname, '../sample-data/events.csv');
    const records = parseCSV(csvPath);

    for (const record of records) {
      const event = new Event({
        _id: new mongoose.Types.ObjectId(),
        title: record.title,
        description: record.description,
        category: record.category,
        venue: record.venue,
        date: record.date,
        time: record.time,
        seatCapacity: parseInt(record.seatCapacity),
        bookedSeats: parseInt(record.bookedSeats || 0),
        vipSeatCapacity: parseInt(record.vipSeatCapacity || 0),
        bookedVipSeats: parseInt(record.bookedVipSeats || 0),
        price: parseFloat(record.price),
        vipPrice: parseFloat(record.vipPrice || 0),
        imageUrl: record.imageUrl || '',
      });

      await event.save();
      console.log(`   ✓ Created event: ${record.title}`);
    }

    console.log(`✅ Successfully imported ${records.length} events\n`);
    return records.length;
  } catch (error) {
    console.error('❌ Error importing events:', error.message);
    throw error;
  }
}

async function importBookings() {
  console.log('📥 Importing bookings...');
  try {
    const csvPath = path.join(__dirname, '../sample-data/bookings.csv');
    const records = parseCSV(csvPath);

    // Get users and events for reference
    const users = await User.find();
    const events = await Event.find();

    const userMap = {};
    const eventMap = {};

    users.forEach((user, index) => {
      userMap[index + 1] = user._id;
    });

    events.forEach((event, index) => {
      eventMap[index + 1] = event._id;
    });

    for (const record of records) {
      const userId = userMap[parseInt(record.userId)];
      const eventId = eventMap[parseInt(record.eventId)];

      if (!userId) {
        console.warn(`   ⚠ User ID ${record.userId} not found, skipping booking`);
        continue;
      }

      if (!eventId) {
        console.warn(`   ⚠ Event ID ${record.eventId} not found, skipping booking`);
        continue;
      }

      // Get event to calculate price
      const event = events.find(e => e._id.toString() === eventId.toString());
      const isVip = record.ticketType === 'vip';
      const price = isVip ? event.vipPrice : event.price;
      const quantity = parseInt(record.quantity);
      const totalPrice = price * quantity;

      const booking = new Booking({
        _id: new mongoose.Types.ObjectId(),
        user: userId,
        event: eventId,
        quantity: quantity,
        bookingDate: new Date(record.bookingDate),
        ticketType: record.ticketType || 'standard',
        seatNumber: record.seatNumber || null,
        totalPrice: totalPrice,
      });

      await booking.save();
      
      // Generate QR code
      const qrCodeUrl = `${getAppUrl()}/api/bookings/validate/${booking._id}`;
      const qrCodeImage = await QRCode.toDataURL(qrCodeUrl);
      
      booking.qrCode = booking._id.toString();
      booking.qrCodeImage = qrCodeImage;
      await booking.save();
      
      console.log(`   ✓ Created booking: User ${record.userId} -> Event ${record.eventId}`);
    }

    console.log(`✅ Successfully imported ${records.length} bookings\n`);
    return records.length;
  } catch (error) {
    console.error('❌ Error importing bookings:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting MongoDB import...\n');
    console.log(`📍 Connecting to MongoDB: ${MONGODB_URI}\n`);

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Event.deleteMany({});
    await Booking.deleteMany({});
    console.log('✅ Cleared existing collections\n');

    // Import data
    const userCount = await importUsers();
    const eventCount = await importEvents();
    const bookingCount = await importBookings();

    // Print summary
    console.log('═══════════════════════════════════');
    console.log('📊 Import Summary');
    console.log('═══════════════════════════════════');
    console.log(`Users:    ${userCount}`);
    console.log(`Events:   ${eventCount}`);
    console.log(`Bookings: ${bookingCount}`);
    console.log('═══════════════════════════════════\n');

    console.log('✅ Data import completed successfully!');
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

main();
