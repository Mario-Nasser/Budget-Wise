const mongoose = require("mongoose");
const Category = require("../models/Category");

/**
 * @description Connects to MongoDB database using the URI from environment variables.
 * Called once when the server starts.
 * @returns {Promise<void>}
 */

const connectDB = async() => {
    try{
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is missing from db.env');
        }

        const connection = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000
        });
        console.log(`Mongoose connected: ${connection.connection.host}`);
        await Category.seedDefaultCategories();
    }catch(error){
        console.error(`Database connection error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
