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
import aiRoutes from './routes/aiRoutes';

export const app: Application = express();

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:3000',
      'https://budgetwise-fcai.netlify.app',
      'https://budget-wisefcai.vercel.app',
    ];
    // Allow any Vercel preview deploy for your project
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || origin.endsWith('.vercel.app') || [
      'http://localhost:3000',
      'https://budgetwise-fcai.netlify.app',
      'https://budget-wisefcai.vercel.app',
    ].includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions)); // ← same config, not a blank cors()

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
app.use('/ai', aiRoutes);

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
