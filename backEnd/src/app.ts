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

// CORS — allow localhost dev + Netlify production
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://budgetwise-fcai.netlify.app',
    '6a0d10b7af7de0756046f4bc--cozy-banoffee-0b3650.netlify.app',
  ],
  credentials: true,
}));

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
  res.json({ message: 'BudgetWise API is running ✅' });
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`MONGO_URI loaded: ${process.env.MONGO_URI ? 'YES ✅' : 'NO ❌'}`);
});
