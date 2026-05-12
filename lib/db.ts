import mongoose from 'mongoose'

type CachedConnection = {
  promise: Promise<typeof mongoose> | null
  connection: typeof mongoose | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: CachedConnection | undefined
}

const cachedConnection = global.mongooseCache ?? { promise: null, connection: null }

if (!global.mongooseCache) {
  global.mongooseCache = cachedConnection
}

export async function connectToDatabase() {
  if (cachedConnection.connection) {
    return cachedConnection.connection
  }

  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured')
  }

  if (!cachedConnection.promise) {
    cachedConnection.promise = mongoose.connect(mongoUri)
  }

  cachedConnection.connection = await cachedConnection.promise
  return cachedConnection.connection
}