import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  let uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/dheeksha_trade';

  // Strip accidental angle brackets from Atlas connection strings if present
  if (uri.includes('<') && uri.includes('>')) {
    uri = uri.replace(/<([^>]+)>/g, '$1');
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB:`, error);
    console.log('[Database] Note: Ensure MongoDB URI credentials and network access are valid in server/.env');
  }
};
