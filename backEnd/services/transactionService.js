// here so Mongoose registers their discriminators before any queries run
const Transaction = require('../models/Transaction');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Category = require('../models/Category');

/**
 * @module TransactionService
 * @description Service layer for all transaction-related business logic.
 * This module implements the TransactionService component from the
 * architecture diagram ("Processes income and expense entries and updates balances").
 *
 * DESIGN DECISION: All business rules, validation, and calculations live HERE.
 * The Controller only handles HTTP communication.
 * This separation makes the logic testable and maintainable.
 *
 * SOLID Principles Applied:
 * S - Single Responsibility: This service ONLY handles transaction logic
 * O - Open/Closed: New transaction types can be added without changing this service
 * D - Dependency Inversion: Controller depends on this abstraction, not Mongoose directly
 */

const TransactionService = {  //bey create we y3ml save new income aw expense transaction
    addTransaction: async (
        userId,
        amount,
        type,
        description = '',
        date = new Date(),
        source = null,
        categoryId = null,
        paymentMethod = 'Cash',
        note = ''
    ) => {
        // Validate amount maps to validateAmount()
        if (amount === undefined || amount === null || amount === '') {
            throw new Error('Please enter an amount.');
        }
        const numericAmount = Number(amount);

        if (isNaN(numericAmount) || numericAmount <= 0) {
            throw new Error('Amount must be greater than 0.');
        }
        if (numericAmount > 9999999.99) {
            throw new Error('Amount cannot exceed 9,999,999.99.');
        }

        // Build transaction based on type law income aw expense
        let newTransaction;

        if (type === 'Income') {
            // Income validation: source is required
            if (!source || source.trim() === '') {
                throw new Error('Income source is required.');
            }
            // Create Income document (extends Transaction via discriminator)
            newTransaction = new Income({
                userId,
                amount: numericAmount,
                date: date || new Date(),
                description: description.trim(),
                type: 'Income',
                source: source.trim()
            });

        } else if (type === 'Expense') {
            // Expense validation: category is required
            if (!categoryId) {
                throw new Error('Category is required for an expense.');
            }

            // Verify the category exists in the database
            const category = await Category.findById(categoryId);
            if (!category) {
                throw new Error('Category not found. Please select a valid category.');
            }
            // Create Expense document
            newTransaction = new Expense({
                userId,
                amount: numericAmount,
                date: date || new Date(),
                description: description.trim(),
                type: 'Expense',
                category: categoryId,
                paymentMethod: paymentMethod || 'Cash',
                note: note.trim()
            });

        } else {
            throw new Error('Transaction type must be Income or Expense.');
        }

        // Save to database
        const savedTransaction = await newTransaction.addTransaction();

        // Calculate new balance
        const newBalance = await TransactionService.calculateBalance(userId);

        return {
            savedTransaction,
            newBalance
        };
    }, 
    /**
     * @method editTransaction
     * @description updates the Edit part of the Edit/Delete Transaction sequence diagram.
     *
     * Security: verifies that the transaction belongs to the requesting user.
     * This prevents User A from editing User B's transactions.
     */

    editTransaction: async (transactionId, userId, updates) => { // Find the transaction first
        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            throw new Error('Transaction not found.');
        }
        // Security check: does this transaction belong to this user?
        if (transaction.userId.toString() !== userId.toString()) { // toString 3alashan mongoDB opjectid mesh string
            throw new Error('You are not authorized to edit this transaction.');
        }
        // Validate new amount if provided
        if (updates.amount !== undefined) {
            const numericAmount = Number(updates.amount);
            if (isNaN(numericAmount) || numericAmount <= 0) {
                throw new Error('Amount must be greater than 0.');
            }
            updates.amount = numericAmount; // ensure it's a number
        }

        // If updating category on an expense, verify the new category exists
        if (updates.categoryId) {
            const category = await Category.findById(updates.categoryId);
            if (!category) {
                throw new Error('Category not found.');
            }
            updates.category = updates.categoryId;
            delete updates.categoryId; // remove the alias
        }

        // Apply updates using findByIdAndUpdate
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            transactionId,
            { $set: updates },
            { new: true, runValidators: true } // beyrag3 el updated document mesh el adema
        ).populate('category', 'name type');

        // Recalculate balance after edit
        const newBalance = await TransactionService.calculateBalance(userId);

        return { updatedTransaction, newBalance };
    },

    /**
     * @method deleteTransaction
     * @description Permanently removes a transaction from the database.
     *
     * Security: verifies ownership before deletion.
     */
    deleteTransaction: async (transactionId, userId) => {
        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            throw new Error('Transaction not found.');
        }

        if (transaction.userId.toString() !== userId.toString()) {
            throw new Error('You are not authorized to delete this transaction.');
        }
        // Delete from database
        await Transaction.findByIdAndDelete(transactionId);
        // Recalculate balance after deletion
        const newBalance = await TransactionService.calculateBalance(userId);
        return {
            deletedTransaction: transaction,
            newBalance
        };
    },

    getAllTransactions: async (userId, filters = {}) => {
        const transactions = await Transaction.fetchTransactions(userId, filters);

        // Calculate summary statistics
        let totalIncome = 0;
        let totalExpenses = 0;

        for (const t of transactions) {
            if (t.type === 'Income') {
                totalIncome += t.amount;
            } else if (t.type === 'Expense') {
                totalExpenses += t.amount;
            }
        }
        const balance = totalIncome - totalExpenses;
        // Group transactions by date (Today, Yesterday, Date string)
        const groupedByDate = TransactionService._groupTransactionsByDate(transactions);

        return {
            transactions,        // Raw array for filtering
            groupedByDate,       // Grouped for display
            summary: {
                totalIncome: parseFloat(totalIncome.toFixed(2)),
                totalExpenses: parseFloat(totalExpenses.toFixed(2)),
                balance: parseFloat(balance.toFixed(2)),
                transactionCount: transactions.length
            }
        };
    },

    /**
     * @method getTransactionById
     * @description Fetches a single transaction by its ID.
     * Used when viewing details of one transaction.
     */
    getTransactionById: async (transactionId, userId) => {
        const transaction = await Transaction.findById(transactionId)
            .populate('category', 'name type');
        if (!transaction) {
            throw new Error('Transaction not found.');
        }
        if (transaction.userId.toString() !== userId.toString()) {
            throw new Error('You are not authorized to view this transaction.');
        }

        return transaction;
    },

    /**
     * @method calculateBalance
     * @description Calculates the current total balance for a user.
     * @param {string} userId - The user's MongoDB _id
     * @returns {Promise<number>} The current balance (can be negative)
     */

    calculateBalance: async (userId) => {
        // MongoDB aggregation: group all transactions we beygam3hom
        const result = await Transaction.aggregate([
            // Only look at this user's transactions
            { $match: { userId: new (require('mongoose').Types.ObjectId)(userId) } },

            // Group by type and sum amounts
            {
                $group: {
                    _id: '$type',
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);
        // Parse the aggregation results
        let totalIncome = 0;
        let totalExpenses = 0;

        for (const group of result) {
            if (group._id === 'Income') {
                totalIncome = group.totalAmount;
            } else if (group._id === 'Expense') {
                totalExpenses = group.totalAmount;
            }
        }
        // Round to 2 decimal places to avoid floating point issues
        return parseFloat((totalIncome - totalExpenses).toFixed(2));
    },

    /**
     * @method createCategory
     * @description Creates a new custom category for the user.
     */
    createCategory: async (userId, name, type) => {
        if (!name || name.trim() === '') {
            throw new Error('Category name is required.');
        }

        if (!type || !['income', 'expense'].includes(type.toLowerCase())) {
            throw new Error('Category type must be income or expense.');
        }

        const category = new Category({
            userId,
            name: name.trim(),
            type: type.toLowerCase(),
            isDefault: false   // User-created categories are NOT defaults
        });

        return await category.createCategory();
    },

    /**
     * @method deleteCategory
     * @description Deletes a user's custom category.
     * Default system categories cannot be deleted.
     */

    deleteCategory: async (categoryId, userId) => {
        const category = await Category.findById(categoryId);

        if (!category) {
            throw new Error('Category not found.');
        }
        if (category.isDefault) {
            throw new Error('Cannot delete a default system category.');
        }
        if (category.userId.toString() !== userId.toString()) {
            throw new Error('You are not authorized to delete this category.');
        }
        await category.deleteCategory();
        return category;
    },

    /**
     * @method getAllCategories
     * @description Gets all categories available to a user:
     * both system defaults AND their personal custom ones.
     */

    getAllCategories: async (userId) => {
        // Get default categories (userId = null) AND user's personal categories
        const categories = await Category.find({
            $or: [
                { isDefault: true },         // System defaults
                { userId: userId }           // User's custom ones
            ]
        }).sort({ name: 1 }); // Alphabetical order

        return categories;
    },

    /**
     * @method _groupTransactionsByDate
     * @description Groups transactions by date label for display.
     * @param {Transaction[]} transactions - Array of transaction documents
     * @returns {Object} Transactions grouped by date label
     */
    _groupTransactionsByDate: (transactions) => {
        const groups = {};
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        for (const transaction of transactions) {
            const transDate = new Date(transaction.date);

            // Determine the date label
            let dateLabel;

            if (transDate.toDateString() === today.toDateString()) {
                dateLabel = 'Today';
            } else if (transDate.toDateString() === yesterday.toDateString()) {
                dateLabel = 'Yesterday';
            } else {
                // Format as readable date string
                dateLabel = transDate.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }); // masaln zy "15 January 2025"
            }
            // Add to group
            if (!groups[dateLabel]) {
                groups[dateLabel] = [];
            }
            groups[dateLabel].push(transaction);
        }
        return groups;
    }
};

module.exports = TransactionService;

