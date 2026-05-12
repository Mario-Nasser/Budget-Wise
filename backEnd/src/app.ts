import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '.env') });
import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './swagger';
import goalRoutes from './routes/financialGoalRoutes';
import reportRoutes from './routes/reportRoutes';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';

export const app: Application = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(morgan(':method :url :status :response-time ms'));

// DB
connectDB();

// swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// routes

app.use('/goals', goalRoutes);
app.use('/reports', reportRoutes);
app.use('/transactions', transactionRoutes);
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontEnd/login.html'));
});
app.use('/auth', authRoutes);

// static files - serve from root frontEnd directory
app.use(express.static(path.join(__dirname, '../../frontEnd')));

// server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});