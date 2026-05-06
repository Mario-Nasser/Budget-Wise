import mongoose from 'mongoose';
import Category from '../models/Category';

const connectDB = async (): Promise<void> => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is missing from db.env');
        }

        const connection = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000
        });

        console.log(`Mongoose connected: ${connection.connection.host}`);
        await Category.seedDefaultCategories();
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown database error';
        console.error(`Database connection error: ${message}`);
        process.exit(1);
    }
};

export default connectDB;
