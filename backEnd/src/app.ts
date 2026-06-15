import dotenv from 'dotenv';
import path from 'path';

// Try multiple paths so it works both locally and on Leapcell
const envPaths = [
  path.join(__dirname, '.env'),           // backEnd/src/.env  (local)
  path.join(__dirname, '..', '.env'),     // backEnd/.env
  path.join(process.cwd(), 'backEnd', 'src', '.env'), // from root
  path.join(process.cwd(), '.env'),       // root .env
];
for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    console.log(`Loaded .env from: ${envPath}`);
    break;
  }
}

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

// 1. FIXED CORS CONFIGURATION
const allowedOrigins = [
  'http://localhost:3000',
  'https://budgetwise-fcai.netlify.app',
  'https://6a0d10b7af7de0756046f4bc--cozy-banoffee-0b3650.netlify.app', // Added https:// prefix
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// 2. CRITICAL FOR VERCEL: Explicitly intercept and approve all preflight OPTIONS requests
app.options('*', cors());

app.use(express.json());
app.use(cookieParser());
app.use(morgan(':method :url :status :response-time ms'));

// DB
connectDB();

// Leapcell Health Checks
app.get(['/kaithhealthcheck', '/kaithheathcheck'], (req, res) => {
  res.status(200).send('OK');
});

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/goals', goalRoutes);
app.use('/reports', reportRoutes);
app.use('/transactions', transactionRoutes);
app.use('/budgets', budgetRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('BudgetWise API Backend running successfully on Vercel.');
});

// Server
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

// The critical fix Vercel needs:
export default app;

// Safely ensure the function is directly exposed if compiled to CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = app;
}
