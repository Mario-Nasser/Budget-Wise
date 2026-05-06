import express, { Application } from 'express';
import cors from 'cors';
import connectDB from './config/db';
import swaggerUi from 'swagger-ui-express';
import swaggerDocs from './swagger';
import path from 'path';
import goalRoutes from './routes/financialGoalRoutes';
import morgan from 'morgan';

const app: Application = express();

// middleware
app.use(cors());
app.use(express.json());

app.use(morgan(':method :url :status :response-time ms'));


// DB
connectDB();

// swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// routes
app.use('/goals', goalRoutes);

// static files - serve from root frontEnd directory
app.use(express.static(path.join(__dirname, '../../frontEnd')));

// server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});