const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

/**
 * @module transactionRoutes
 * @description Defines all HTTP endpoints for the Transactions feature.
 *Routes receive requests and forward them to the correct controller method.
 * Base URL: /api/transactions
 *
 * Endpoints:
 *   POST   /api/transactions                    → createTransaction
 *   GET    /api/transactions                    → getAllTransactions
 *   GET    /api/transactions/:id                → getTransaction
 *   PUT    /api/transactions/:id                → updateTransaction
 *   DELETE /api/transactions/:id                → deleteTransaction
 *   POST   /api/transactions/categories         → createCategory
 *   GET    /api/transactions/categories         → getAllCategories
 *   DELETE /api/transactions/categories/:id     → deleteCategory
*/

const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/categories', transactionController.createCategory); // beycreate new custom category

router.get('/categories', transactionController.getAllCategories); // beygam3 kol el categories el fadya lel user

router.delete('/categories/:id', transactionController.deleteCategory); // delete el custom category

// ─── TRANSACTION ROUTES ────────────────────────────────────────────────────

router.post('/', transactionController.createTransaction); // create income aw expense transaction

router.get('/', transactionController.getAllTransactions); // beygam3 kol el transaction lel logged-in users

router.get('/:id', transactionController.getTransaction); // beygeeb el transaction 3n taree2 el ID

router.put('/:id', transactionController.updateTransaction); // bey update el transaction 3n taree2 el ID

router.delete('/:id', transactionController.deleteTransaction); // bey delete el transaction 3n taree2 el ID

module.exports = router;