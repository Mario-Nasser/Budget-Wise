import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import connectDB from './config/db';
import transactionRoutes from './routes/transactionRoutes';
import goalRoutes from './routes/financialGoalRoutes';
import authRoutes from './routes/authRoutes';
import swaggerDocs from './swagger';

dotenv.config({ path: './db.env' });

const app = express();

// middleware
app.use(cors() as any);
app.use(morgan(':method :url :status :response-time ms') as any);
app.use(express.json());

// Swagger
app.use('/api-docs', swaggerUi.serve as any, swaggerUi.setup(swaggerDocs) as any);

// API routes
app.use('/api/transactions', transactionRoutes);
app.use('/goals', goalRoutes);
app.use('/auth', authRoutes);

// static files
app.use(express.static(path.join(__dirname, '..', 'frontEnd')));

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
