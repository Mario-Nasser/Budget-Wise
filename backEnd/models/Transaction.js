const mongoose = require('mongoose');

/**
 * @module Transaction
 * @description Base model for all financial transactions in the BudgetWise system.
 * It uses Mongoose's discriminator pattern to implement inheritance:
 *   - Income extends Transaction (adds: source)
 *   - Expense extends Transaction (adds: category, paymentMethod)
 */

const transactionSchema = new mongoose.Schema(
    {
        /**
         * Links this transaction to the user who created it.
         * Implements: User 1 --* Transaction (from class diagram relationships)
         */
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "UserId is required"]
        },
        /**
         * The monetary value of the transaction.
         * From SRS Data Dictionary US#3: Decimal(10,2), must be > 0, max 9999999.99
         */
        amount: {
            type: Number,
            required: [true, 'Please enter an amount.'],
            min: [0.01, "amount must me greater than 0"],
            max: [9999999.99, 'Amount cannot exceed 9999999.99']
        },
        /**
         * When the transaction occurred.
         * From SRS: Defaults to current date/time, can be changed.
         */
        date: {
            type: Date,
            default: Date.now
        },
        /**
         * User's description of the transaction.
         * From SRS: Optional, text < 200 characters.
         */
        description: {
            type: String,
            trim: true, //beysheel el spaces el zeyada
            maxlength: [200, 'Description cannot exceed 200 characters'],
            default: ''
        },
        /**
         * Discriminator key — Mongoose uses this to know if this document
         * is a base Transaction, an Income, or an Expense.
         * Values: 'Income' or 'Expense'
         */
        type: {
            type: String,
            required: true,
            enum: {
                values: ['Income', 'Expense'],
                message: 'Transaction type must be Income or Expense'
            }
        }
    },
    {
         /**
         * timestamps: true automatically adds:
         *   - createdAt: when document was inserted
         *   - updatedAt: when document was last changed
         */
        timestamps: true,
        discriminatorKey: 'type' // 'type' bet2ool le mongoose to use 'type' field as a key for inhertiance
    }
);

//---------------------------------------------------------------------------------------------------------------------------

/**
 * @method validateAmount
 * @description Checks if a given amount is valid (positive number).
 * Maps to validateAmount() shown in US#3 sequence diagram.
 * Called before saving to ensure data integrity.
 * @param {number} amount - The amount to validate
 * @returns {boolean} true if valid, false otherwise
 */
transactionSchema.methods.validateAmount =function (amount){
    return typeof amount == 'number' && amount > 0 && amount <= 9999999.99;
};

/**
 * @method addTransaction
 * @description Saves this transaction to the database.
 * Maps to addTransaction() in the class diagram.
 * @returns {Promise<Transaction>} The saved transaction document
 * @throws {Error} If validation fails or database error occurs
 */
transactionSchema.methods.addTransaction = async function () {
    return await this.save();
};

/**
 * @method editTransaction
 * @description Updates this transaction's fields with new values.
 * @param {Object} updates - Object containing fields to update
 */
transactionSchema.methods.editTransaction = async function (updates) {
    // Apply each update field to this document
    Object.assign(this, updates);
    return await this.save();
};

/**
 * @method fetchTransactions
 * @description Retrieves all transactions for a user, with optional filters. fel user stories
 * @param {string} userId - The ID of the user
 * @param {Object} filters - Optional filter criteria
 * @param {string} [filters.type] - 'Income' or 'Expense'
 * @param {string} [filters.categoryId] - Category ID to filter by
 * @param {Date} [filters.startDate] - Start of date range
 * @param {Date} [filters.endDate] - End of date range
 * @returns {Promise<Transaction[]>} Array of matching transactions
*/

transactionSchema.statics.fetchTransactions = async function (userId, filters={}){
    const query = {userId};

    if(filters.type){ // Apply optional type filter (Income or Expense)
        query.type = filters.type;
    }
    if(filters.categoryId){ // Apply optional category filter (only applies to Expenses)
        query.category = filters.categoryId;
    }

    if(filters.startDate || filters.endDate){
        query.date ={};
        if(filters.startDate){
            query.date.$gte = new Date(filters.startDate);
        }
        if(filters.endDate){
            query.date.$lte = new Date(filters.endDate);
        }
    }
    const transactions = await this.find(query) // beystana el quere 
    .populate('category', 'name type') // replace categoryId be category doc
    .sort({ date: -1 }); // bey7ot agdad transaction first

    return transactions;
};

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports =  Transaction;
