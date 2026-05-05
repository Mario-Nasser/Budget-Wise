require('dotenv').config({ path: './db.env' }); // bengahez el environment
const express = require('express'); // express dah el framework lel JS 3alashan el api yeb2a a7san
const connectDB = require('./config/db');

const TransactionRoutes = require('./routes/transactionRoutes');
const app =express();

app.use(express.json()); //Middleware to parse JSON request bodies
app.use('/api/transactions', TransactionRoutes); // Mount routes

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`); // beyt2kd el server sha5al fe server 3000
    });
};

if (require.main === module) {
    startServer();
}


module.exports = app;
