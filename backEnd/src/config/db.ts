// import mongoose from 'mongoose';

// const connectDB = async (): Promise<void> => {
//   try {
//     await mongoose.connect('mongodb://127.0.0.1:27017/financeDB');
//     console.log('MongoDB Connected');
//   } catch (err) {
//     console.error(err);
//     process.exit(1);
//   }
// };

// export default connectDB;
import mongoose from 'mongoose';
import Category from '../models/Category';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async (): Promise<void> => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/financeDB';

        const connection = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
        });

        console.log(`MongoDB Connected: ${connection.connection.host}`);

        // Optional: seed default data
        if (Category?.seedDefaultCategories) {
            await Category.seedDefaultCategories();
        }

    } catch (error) {
        console.error(
            error instanceof Error ? error.message : 'Unknown database error'
        );
        process.exit(1);
    }
};

export default connectDB;