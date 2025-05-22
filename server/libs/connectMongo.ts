import mongoose, { Mongoose } from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("❌ Missing MongoDB connection string in environment variables.");
}

interface Cached {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// @ts-ignore
const globalWithMongoose = global as typeof globalThis & {
  mongooseCache?: Cached;
};

if (!globalWithMongoose.mongooseCache) {
  globalWithMongoose.mongooseCache = { conn: null, promise: null };
}

const connectMongo = async (): Promise<Mongoose> => {
  const cache = globalWithMongoose.mongooseCache!;

  if (cache.conn) {
    console.log("✅ Using existing MongoDB connection");
    return cache.conn;
  }

  if (!cache.promise) {
    console.log("🔄 Connecting to MongoDB…");
    cache.promise = mongoose
      .connect(MONGODB_URI, {
        // These options are defaults as of Mongoose 6.x,
        // but you can add more here (e.g. useNewUrlParser, etc.)
        bufferCommands: false,
      })
      .then((mongooseInstance) => {
        console.log("✅ MongoDB Connected:", mongooseInstance.connection.name);
        return mongooseInstance;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
};

export default connectMongo;
