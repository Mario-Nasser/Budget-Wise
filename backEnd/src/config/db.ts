import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/financeDB';
    await mongoose.connect(uri);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

export default connectDB;