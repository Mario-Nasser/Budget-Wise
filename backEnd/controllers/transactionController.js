// dah el controller del MVC
const transactionService = require('../services/transactionService');

/**
 * @module TransactionController
 * @description Handles HTTP requests and responses for transactions and categories.
 * 
 * RESPONSIBILITY: This controller ONLY:
 *   1. Reads data from req (request)
 *   2. Calls the appropriate TransactionService method
 *   3. Sends the response via res
 *
 * NO business logic, NO calculations, NO database queries live here.
 */

const transactionController = {

    /**
     * @method createTransaction
     * @description POST /api/transactions
     * Handles adding a new Income or Expense transaction.
     */

    createTransaction: async (req, res) => {
        try {
            // Extract all fields from request body
            const {
                type,
                amount,
                description,
                date,
                source,           // For Income only
                categoryId,       // For Expense only
                paymentMethod,    // For Expense only
                note              // For Expense only
            } = req.body;

            // Get the user's ID from the auth middleware
            // req.user is set by authMiddleware after verifying JWT token
            const userID = req.user.id;

            // Delegate ALL logic to the service
            const { savedTransaction, newBalance } = await transactionService.addTransaction(
                userId,
                amount,
                type,
                description,
                date,
                source,
                categoryId,
                paymentMethod,
                note
            );
            // Send success response
            // 201 = Created (standard HTTP status for new resource creation)
            res.status(201).json({
                message: 'Transaction added successfully.',
                data: {
                    transactionId: savedTransaction._id,
                    type: savedTransaction.type,
                    amount: savedTransaction.amount,
                    date: savedTransaction.date,
                    description: savedTransaction.description,
                    newBalance: newBalance
                }
            });

        } catch (error) {
            // 400 = Bad Request (client sent invalid data)
            res.status(400).json({
                message: error.message
            });
        }
    },

    /**
     * @method getAllTransactions
     * @description GET /api/transactions
     * Returns all transactions for the logged-in user with optional filters.
     */

    getAllTransactions: async (req, res) => {
        try {
            const userId = req.user.id;
            // req.query contains URL parameters
            const filters = {
                type: req.query.type,
                categoryId: req.query.categoryId,
                startDate: req.query.startDate,
                endDate: req.query.endDate
            };

            const result = await transactionService.getAllTransactions(userId, filters);
            // Check if no transactions found
            if (result.transactions.length === 0) {
                return res.status(200).json({
                    message: 'No transactions found for this filter.',
                    data: result
                });
            }
            res.status(200).json({
                message: 'Transactions retrieved successfully.',
                data: result
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    /**
     * @method getTransaction
     * @description GET /api/transactions/:id
     * Returns a single transaction by its ID.
     */
    getTransaction: async (req, res) => {
        try {
            const userId = req.user.id;
            const transactionId = req.params.id;

            const transaction = await transactionService.getTransactionById(
                transactionId,
                userId
            );
            res.status(200).json({
                message: 'Transaction retrieved successfully.',
                data: transaction
            });
        } catch (error) {
            // Determine appropriate status code
            const statusCode = error.message.includes('not found') ? 404
                : error.message.includes('authorized') ? 403
                : 400;
            res.status(statusCode).json({ message: error.message });
        }
    },

    /**
     * @method updateTransaction
     * @description PUT /api/transactions/:id
     * Updates an existing transaction.
     * Maps to editTransaction() in the class diagram and Edit/Delete sequence.
     *
     * Request body (send only the fields you want to change):
     * {
     *   "amount": 60,
     *   "description": "Updated description"
     * }
     *
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    updateTransaction: async (req, res) => {
        try {
            const userId = req.user.id;
            const transactionId = req.params.id;
            const updates = req.body;

            const { updatedTransaction, newBalance } = await transactionService.editTransaction(
                transactionId,
                userId,
                updates
            );

            res.status(200).json({
                message: 'Transaction updated successfully.',
                data: {
                    transaction: updatedTransaction,
                    newBalance: newBalance
                }
            });

        } catch (error) {
            const statusCode = error.message.includes('not found') ? 404
                : error.message.includes('authorized') ? 403
                : 400;

            res.status(statusCode).json({ message: error.message });
        }
    },

    /**
     * @method deleteTransaction
     * @description DELETE /api/transactions/:id
     * Permanently deletes a transaction.
     */

    deleteTransaction: async (req, res) => {
        try {
            const userId = req.user.id;
            const transactionId = req.params.id;
            const { deletedTransaction, newBalance } = await transactionService.deleteTransaction(
                transactionId,
                userId
            );
            res.status(200).json({
                message: 'Transaction deleted successfully.',
                data: {
                    transactionId: deletedTransaction._id,
                    newBalance: newBalance
                }
            });
        } catch (error) {
            const statusCode = error.message.includes('not found') ? 404
                : error.message.includes('authorized') ? 403
                : 400;

            res.status(statusCode).json({ message: error.message });
        }
    },

    /**
     * @method createCategory
     * @description POST /api/transactions/categories
     * Creates a new custom category for the user.
     */

    createCategory: async (req, res) => {
        try {
            const userId = req.user.id;
            const { name, type } = req.body;

            const category = await transactionService.createCategory(userId, name, type);

            res.status(201).json({
                message: 'Category created successfully.',
                data: category
            });

        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },
    /**
     * @method getAllCategories
     * @description GET /api/transactions/categories
     * Returns all categories available to the user (defaults + custom).
     */
    getAllCategories: async (req, res) => {
        try {
            const userId = req.user.id;
            const categories = await transactionService.getAllCategories(userId);
            res.status(200).json({
                message: 'Categories retrieved successfully.',
                data: categories
            });

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    /**
     * @method deleteCategory
     * @description DELETE /api/transactions/categories/:id
     * Deletes a custom category. Cannot delete system defaults.
     */

    deleteCategory: async (req, res) => {
        try {
            const userId = req.user.id;
            const categoryId = req.params.id;
            await transactionService.deleteCategory(categoryId, userId);
            res.status(200).json({
                message: 'Category deleted successfully.'
            });

        } catch (error) {
            const statusCode = error.message.includes('not found') ? 404
                : error.message.includes('authorized') ? 403
                : 400;

            res.status(statusCode).json({ message: error.message });
        }
    }
};
module.exports = transactionController;