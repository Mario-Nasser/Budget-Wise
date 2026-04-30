const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swagger'); // Ensure this path matches your swagger file location

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// DB
connectDB();

const path = require('path');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// routes
const goalRoutes = require('./routes/financialGoalRoutes');
app.use('/goals', goalRoutes);

// serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'frontEnd')));

// server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});