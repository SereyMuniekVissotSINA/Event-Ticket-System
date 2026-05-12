# Sample Data Import Guide

This guide explains how to import the sample data into MongoDB for the Event Ticket System.

## 📁 Sample Data Files

Three CSV files are provided in the `sample-data/` directory:

1. **users.csv** - 5 sample users (2 admins, 3 regular users)
2. **events.csv** - 10 sample events across different categories
3. **bookings.csv** - 10 sample bookings linking users to events

## 🔧 Setup

### Step 1: Install Dependencies
```bash
npm install csv-parse dotenv
```

### Step 2: Ensure MongoDB is Running

**Local MongoDB:**
```bash
mongod
```

**MongoDB Atlas (Cloud):**
- Ensure your `MONGODB_URI` in `.env.local` points to your cluster

### Step 3: Verify Environment Variables
Check that `.env.local` has:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event-ticket-system
```

## 📥 Import Methods

### Method 1: Using Node.js Script (Recommended) ⭐

The `scripts/import-data.js` handles:
- Password hashing with bcryptjs
- Proper data type conversion
- ObjectId generation
- Document relationships

**Run the script:**
```bash
node scripts/import-data.js
```

**Expected Output:**
```
🚀 Starting MongoDB import...

📍 Connecting to MongoDB: mongodb+srv://...

✅ Connected to MongoDB

🧹 Clearing existing data...
✅ Cleared existing collections

📥 Importing users...
   ✓ Created user: john@example.com
   ✓ Created user: jane@example.com
   ✓ Created user: mike@example.com
   ✓ Created user: sarah@example.com
   ✓ Created user: admin@example.com
✅ Successfully imported 5 users

📥 Importing events...
   ✓ Created event: Summer Music Festival
   ✓ Created event: Tech Conference 2026
   ✓ Created event: NBA Championship Game
   ... (7 more events)
✅ Successfully imported 10 events

📥 Importing bookings...
   ✓ Created booking: User 1 -> Event 1
   ... (9 more bookings)
✅ Successfully imported 10 bookings

═══════════════════════════════════
📊 Import Summary
═══════════════════════════════════
Users:    5
Events:   10
Bookings: 10
═══════════════════════════════════

✅ Data import completed successfully!
```

### Method 2: Using MongoDB Tools (Manual)

#### Using mongoimport (for JSON):

First, convert CSV to JSON:
```bash
npm install csv-to-json
npx csv-to-json --input sample-data/events.csv --output sample-data/events.json
```

Then import:
```bash
mongoimport --uri "mongodb+srv://user:pass@cluster.mongodb.net/event-ticket-system" \
  --collection events \
  --file sample-data/events.json \
  --jsonArray
```

#### Using MongoDB Compass (GUI):

1. Open MongoDB Compass
2. Connect to your MongoDB instance
3. Create database: `event-ticket-system`
4. Create collections: `users`, `events`, `bookings`
5. Right-click collection → Import JSON/CSV
6. Select the CSV file

### Method 3: Using mongosh (MongoDB Shell)

```javascript
// Connect to MongoDB
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/event-ticket-system"

// Switch to database
use event-ticket-system

// Load and run the import script
load("scripts/import-data.js")
```

## 📊 Sample Data Overview

### Users
```
ID | Name              | Email                 | Role
1  | John Doe          | john@example.com      | user
2  | Jane Smith        | jane@example.com      | user
3  | Mike Johnson      | mike@example.com      | admin
4  | Sarah Williams    | sarah@example.com     | user
5  | Admin User        | admin@example.com     | admin
```

**Default passwords:** All users have password `password123` (hashed in database)

### Events (Sample)
```
ID | Title                      | Category      | Capacity | Booked | Price
1  | Summer Music Festival      | Music         | 500      | 120    | $49.99
2  | Tech Conference 2026       | Conference    | 1000     | 250    | $99.99
3  | NBA Championship Game      | Sports        | 20000    | 5500   | $150.00
4  | Shakespeare Theater Night  | Theater       | 800      | 200    | $75.50
5  | Digital Art Exhibition     | Exhibition    | 300      | 85     | $25.00
6  | Jazz Concert Series        | Music         | 150      | 45     | $89.99
7  | Startup Pitch Competition  | Conference    | 500      | 180    | $39.99
8  | Marathon 2026              | Sports        | 5000     | 3200   | $45.00
9  | Stand-up Comedy Night      | Theater       | 200      | 120    | $65.00
10 | Photography Masterclass    | Exhibition    | 100      | 60     | $55.00
```

### Bookings
```
ID | User ID | Event ID | Quantity | Date
1  | 1       | 1        | 2        | 2026-05-10
2  | 1       | 3        | 4        | 2026-05-11
3  | 2       | 2        | 1        | 2026-05-09
4  | 2       | 4        | 2        | 2026-05-12
5  | 3       | 5        | 3        | 2026-05-08
6  | 4       | 1        | 1        | 2026-05-10
7  | 4       | 6        | 2        | 2026-05-11
8  | 5       | 2        | 5        | 2026-05-07
9  | 1       | 7        | 3        | 2026-05-12
10 | 2       | 8        | 2        | 2026-05-09
```

## ✅ Verify Import

After importing, verify the data:

```bash
# Using mongosh
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/event-ticket-system"

# Check collections
show collections

# Count documents
db.users.countDocuments()      # Should be 5
db.events.countDocuments()     # Should be 10
db.bookings.countDocuments()   # Should be 10

# View sample data
db.users.findOne()
db.events.findOne()
db.bookings.findOne()
```

## 🔑 Login Credentials

After import, use these credentials to test:

### Regular User
- Email: `john@example.com`
- Password: `password123`

### Admin User
- Email: `admin@example.com`
- Password: `password123`

## 🛠️ Troubleshooting

### "Cannot find module 'csv-parse'"
```bash
npm install csv-parse dotenv
```

### "MongoDB connection failed"
- Check MONGODB_URI in .env.local
- Ensure MongoDB is running
- Verify connection string format

### "Duplicate key error"
- The script clears existing data first
- If you want to keep existing data, comment out the clear section in import-data.js

### "Password hashing failed"
- Ensure bcryptjs is installed: `npm install bcryptjs`

## 📝 Customizing Data

### Edit CSV Files
1. Open `sample-data/users.csv` in a text editor
2. Modify values as needed
3. Save and run import script again

### Add More Users
```csv
6,New User,newuser@example.com,password123,user
```

### Add More Events
```csv
11,New Event,Description,Music,Venue Name,2026-06-20,20:00,500,0,99.99
```

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install csv-parse dotenv

# 2. Ensure .env.local is configured
# (Check MONGODB_URI is set correctly)

# 3. Run import script
node scripts/import-data.js

# 4. Login and test
# Email: john@example.com
# Password: password123

# 5. Navigate to http://localhost:3000
```

## 📚 Additional Resources

- [MongoDB Import Documentation](https://docs.mongodb.com/manual/reference/mongoimport/)
- [CSV to JSON Conversion](https://csvjson.com/)
- [MongoDB Compass](https://www.mongodb.com/products/compass)
- [mongosh Documentation](https://www.mongodb.com/docs/mongodb-shell/)

---

**Questions?** Check the main README.md or UI_DOCUMENTATION.md for more information!
