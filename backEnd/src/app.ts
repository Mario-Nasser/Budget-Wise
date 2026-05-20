import dotenv from 'dotenv';
import path from 'path';
// Look for .env at the project root level
dotenv.config({ path: path.join(process.cwd(), '.env') });
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
import budgetRoutes from './routes/budgetRoutes';

export const app: Application = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(morgan(':method :url :status :response-time ms'));

// DB
connectDB();

// Leapcell Health Checks (handles both common spellings seen in your platform logs)
app.get(['/kaithhealthcheck', '/kaithheathcheck'], (req, res) => {
  res.status(200).send('OK');
});

// swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// routes
app.use('/goals', goalRoutes);
app.use('/reports', reportRoutes);
app.use('/transactions', transactionRoutes);
app.use('/budgets', budgetRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'frontEnd', 'login.html'));
});
app.use('/auth', authRoutes);

// static files - serve from root frontEnd directory safely
app.use(express.static(path.join(process.cwd(), 'frontEnd')));

// server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
