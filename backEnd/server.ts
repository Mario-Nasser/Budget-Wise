import dotenv from 'dotenv';
import express from 'express';
import connectDB from './config/db';
import transactionRoutes from './routes/transactionRoutes';

dotenv.config({ path: './db.env' });

const app = express();

app.use(express.json());
app.use('/api/transactions', transactionRoutes);

const PORT = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

if (require.main === module) {
    void startServer();
}

export default app;
