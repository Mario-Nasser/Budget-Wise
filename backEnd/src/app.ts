import dotenv from 'dotenv';
import path from 'path';

const envPaths = [
  path.join(__dirname, '.env'),
  path.join(__dirname, '..', '.env'),
  path.join(process.cwd(), 'backEnd', 'src', '.env'),
  path.join(process.cwd(), '.env'),
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
import aiRoutes from './routes/aiRoutes';

export const app: Application = express();

// ✅ ONE cors config only
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:3000',
      'https://budgetwise-fcai.netlify.app',
      'https://budget-wisefcai.vercel.app',
    ];
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

// ✅ Preflight BEFORE everything else
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use(morgan(':method :url :status :response-time ms'));

connectDB();

app.get(['/kaithhealthcheck', '/kaithheathcheck'], (req, res) => {
  res.status(200).send('OK');
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/goals', goalRoutes);
app.use('/reports', reportRoutes);
app.use('/transactions', transactionRoutes);
app.use('/budgets', budgetRoutes);
app.use('/auth', authRoutes);
app.use('/ai', aiRoutes);

app.get('/', (req, res) => {
  res.send('BudgetWise API Backend running successfully on Vercel.');
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));
}

export default app;
