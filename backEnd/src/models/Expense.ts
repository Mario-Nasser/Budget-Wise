import { Schema, Types } from 'mongoose';
import Transaction, { ITransaction } from './Transaction';

export type PaymentMethod = 'Cash' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'E-Wallet' | 'Other';

export interface IExpense extends ITransaction {
    category: Types.ObjectId;
    paymentMethod: PaymentMethod;
    note: string;
}

const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'E-Wallet', 'Other'];

const expenseSchema = new Schema<IExpense>({
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required for an expense']
    },
    paymentMethod: {
        type: String,
        enum: {
            values: [...PAYMENT_METHODS, ''],
            message: `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`
        },
        default: 'Cash'
    },
    note: {
        type: String,
        trim: true,
        maxlength: [500, 'Note cannot exceed 500 characters'],
        default: ''
    }
});

const Expense = Transaction.discriminator<IExpense>('Expense', expenseSchema);
export default Expense;
