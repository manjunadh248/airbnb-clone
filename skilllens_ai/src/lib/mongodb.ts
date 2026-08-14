// ==============================
// MongoDB Connection Singleton
// Reuses connection in dev (hot-reload safe)
// Falls back to demo mode if MongoDB is unavailable
// ==============================

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

/** Whether MongoDB is available */
export let isMongoConnected = false;

/** Global cache to prevent multiple connections during hot-reloads */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  failed: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null, failed: false };
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase() {
  // If already failed or no URI, skip
  if (cached.failed || !MONGODB_URI) {
    isMongoConnected = false;
    return null;
  }

  if (cached.conn) {
    isMongoConnected = true;
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
  }

  try {
    cached.conn = await cached.promise;
    isMongoConnected = true;
  } catch (e) {
    cached.promise = null;
    cached.failed = true;
    isMongoConnected = false;
    console.warn('⚠️  MongoDB connection failed — running in demo mode. Error:', (e as Error).message);
    return null;
  }

  return cached.conn;
}

export default connectToDatabase;
