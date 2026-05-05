const mongoose = require('mongoose');
const Transaction = require('./Transaction');

/**
 * @module Expense
 * @description Represents money spent by the user.
 * EXTENDS Transaction via Mongoose discriminator (implements class diagram inheritance).
 * Adds 'category' and 'paymentMethod' to the base Transaction.
 * When saved, stored in the 'transactions' collection with type='Expense'.
 */

const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'E-Wallet', 'Other'];
const expenseSchema = new mongoose.Schema({ // bey inherte men el transaction 

    category:{ // References Category model we mayenf3sh yeb2a empty
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required for an expense']
    },
    paymentMethod:{ // tare2t el daf3
        type: String,
        enum: {
            values: [...PAYMENT_METHODS, ''],
            message: `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`
        },
        default: 'Cash'
    },
    note: { // beyzawed note Optional
        type: String,
        trim: true,
        maxlength: [500, 'Note cannot exceed 500 characters'],
        default: ''
    }
});

const Expense = Transaction.discriminator('Expense', expenseSchema);
module.exports = Expense;
