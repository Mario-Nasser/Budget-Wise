import mongoose, { Types } from 'mongoose';
import Category, { CategoryDocument, CategoryType } from '../models/Category';
import Expense from '../models/Expense';
import Income from '../models/Income';
import Transaction, { TransactionDocument, TransactionFilters } from '../models/Transaction';

type TransactionTypeInput = 'Income' | 'Expense' | 'income' | 'expense' | string;

interface AddTransactionResult {
    savedTransaction: TransactionDocument;
    newBalance: number;
    nearLimit?: boolean;
    categoryName?: string;
}

interface EditTransactionResult {
    updatedTransaction: TransactionDocument | null;
    newBalance: number;
}

interface DeleteTransactionResult {
    deletedTransaction: TransactionDocument;
    newBalance: number;
}

export interface TransactionUpdates {
    amount?: number | string;
    description?: string;
    date?: Date | string;
    source?: string;
    categoryId?: string;
    category?: string;
    paymentMethod?: string;
    note?: string;
}

interface TransactionSummary {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    transactionCount: number;
}

interface GetAllTransactionsResult {
    transactions: TransactionDocument[];
    groupedByDate: Record<string, TransactionDocument[]>;
    summary: TransactionSummary;
}

const normalizeText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const findAvailableCategory = async (
    categoryId: string,
    userId: string,
    type: CategoryType = 'expense'
): Promise<CategoryDocument> => {
    const category = await Category.findOne({
        _id: categoryId,
        type,
        userId
    });

    if (!category) {
        throw new Error('Category not found. Please select a valid category.');
    }

    return category;
};

const TransactionService = {
    addTransaction: async (
        userId: string,
        amount: number | string,
        type: TransactionTypeInput,
        description = '',
        date: Date | string = new Date(),
        source: string | null = null,
        categoryId: string | null = null,
        paymentMethod = 'Cash',
        note = ''
    ): Promise<AddTransactionResult> => {
        if (amount === undefined || amount === null || amount === '') {
            throw new Error('Please enter an amount.');
        }
        const numericAmount = Number(amount);

        if (Number.isNaN(numericAmount) || numericAmount <= 0) {
            throw new Error('Amount must be greater than 0.');
        }
        if (numericAmount > 9999999.99) {
            throw new Error('Amount cannot exceed 9,999,999.99.');
        }

        const transactionType = normalizeText(type).toLowerCase();
        let newTransaction: TransactionDocument;
        let nearLimit = false;
        let categoryName = '';

        if (transactionType === 'income') {
            const cleanSource = normalizeText(source);
            if (!cleanSource) {
                throw new Error('Income source is required.');
            }

            if (categoryId) {
                await findAvailableCategory(categoryId, userId, 'income');
            }

            newTransaction = new Income({
                userId,
                amount: numericAmount,
                date: date || new Date(),
                description: normalizeText(description),
                type: 'Income',
                source: cleanSource,
                category: categoryId
            }) as TransactionDocument;
        } else if (transactionType === 'expense') {
            if (!categoryId) {
                throw new Error('Category is required for an expense.');
            }

            const category = await findAvailableCategory(categoryId, userId, 'expense');
            categoryName = category.name;

            // Check category limit
            if (category.limit > 0) {
                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                startOfMonth.setHours(0, 0, 0, 0);

                const currentSpendingResult = await Transaction.aggregate([
                    {
                        $match: {
                            userId: new mongoose.Types.ObjectId(userId),
                            category: new mongoose.Types.ObjectId(categoryId),
                            type: 'Expense',
                            date: { $gte: startOfMonth }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$amount' }
                        }
                    }
                ]);

                const currentSpending = currentSpendingResult.length > 0 ? currentSpendingResult[0].total : 0;
                const totalAfterTransaction = currentSpending + numericAmount;

                if (totalAfterTransaction > category.limit) {
                    throw new Error(`Transaction failed: This would exceed the ${category.name} category limit of ${category.limit}. Current spending: ${currentSpending}.`);
                }

                // Check if near limit (90%)
                if (totalAfterTransaction >= category.limit * 0.9) {
                    nearLimit = true;
                }
            }

            newTransaction = new Expense({
                userId,
                amount: numericAmount,
                date: date || new Date(),
                description: normalizeText(description),
                type: 'Expense',
                category: categoryId,
                paymentMethod: paymentMethod || 'Cash',
                note: normalizeText(note)
            }) as TransactionDocument;
        } else {
            throw new Error('Transaction type must be Income or Expense.');
        }

        const savedTransaction = await newTransaction.addTransaction();
        const newBalance = await TransactionService.calculateBalance(userId);

        return {
            savedTransaction,
            newBalance,
            nearLimit,
            categoryName
        };
    },

    editTransaction: async (
        transactionId: string,
        userId: string,
        updates: TransactionUpdates
    ): Promise<EditTransactionResult> => {
        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            throw new Error('Transaction not found.');
        }
        if (transaction.userId.toString() !== userId.toString()) {
            throw new Error('You are not authorized to edit this transaction.');
        }

        const allowedUpdates: TransactionUpdates = {};
        const allowedFields: Array<keyof TransactionUpdates> = [
            'amount',
            'description',
            'date',
            'source',
            'categoryId',
            'paymentMethod',
            'note'
        ];

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                allowedUpdates[field] = updates[field] as never;
            }
        }

        if (Object.keys(allowedUpdates).length === 0) {
            throw new Error('No valid transaction fields were provided for update.');
        }

        if (allowedUpdates.description !== undefined) {
            allowedUpdates.description = normalizeText(allowedUpdates.description);
        }

        if (allowedUpdates.note !== undefined) {
            allowedUpdates.note = normalizeText(allowedUpdates.note);
        }

        if (allowedUpdates.source !== undefined) {
            allowedUpdates.source = normalizeText(allowedUpdates.source);
            if (transaction.type !== 'Income') {
                throw new Error('Source can only be updated for income transactions.');
            }
            if (!allowedUpdates.source) {
                throw new Error('Income source is required.');
            }
        }

        if (allowedUpdates.paymentMethod !== undefined && transaction.type !== 'Expense') {
            throw new Error('Payment method can only be updated for expense transactions.');
        }

        if (allowedUpdates.note !== undefined && transaction.type !== 'Expense') {
            throw new Error('Note can only be updated for expense transactions.');
        }

        if (allowedUpdates.amount !== undefined) {
            const numericAmount = Number(allowedUpdates.amount);
            if (Number.isNaN(numericAmount) || numericAmount <= 0) {
                throw new Error('Amount must be greater than 0.');
            }
            if (numericAmount > 9999999.99) {
                throw new Error('Amount cannot exceed 9,999,999.99.');
            }
            allowedUpdates.amount = numericAmount;
        }

        if (allowedUpdates.categoryId) {
            const categoryType = transaction.type.toLowerCase() as CategoryType;
            await findAvailableCategory(allowedUpdates.categoryId, userId, categoryType);
            allowedUpdates.category = allowedUpdates.categoryId;
            delete allowedUpdates.categoryId;
        }

        const updatedTransaction = await Transaction.findByIdAndUpdate(
            transactionId,
            { $set: allowedUpdates },
            { new: true, runValidators: true }
        ).populate('category', 'name type');

        const newBalance = await TransactionService.calculateBalance(userId);

        return { updatedTransaction, newBalance };
    },

    deleteTransaction: async (transactionId: string, userId: string): Promise<DeleteTransactionResult> => {
        const transaction = await Transaction.findById(transactionId);

        if (!transaction) {
            throw new Error('Transaction not found.');
        }

        if (transaction.userId.toString() !== userId.toString()) {
            throw new Error('You are not authorized to delete this transaction.');
        }

        await Transaction.findByIdAndDelete(transactionId);
        const newBalance = await TransactionService.calculateBalance(userId);

        return {
            deletedTransaction: transaction,
            newBalance
        };
    },

    getAllTransactions: async (
        userId: string,
        filters: TransactionFilters = {}
    ): Promise<GetAllTransactionsResult> => {
        const transactions = await Transaction.fetchTransactions(userId, filters);

        let totalIncome = 0;
        let totalExpenses = 0;

        for (const transaction of transactions) {
            if (transaction.type === 'Income') {
                totalIncome += transaction.amount;
            } else if (transaction.type === 'Expense') {
                totalExpenses += transaction.amount;
            }
        }

        const balance = totalIncome - totalExpenses;
        const groupedByDate = TransactionService._groupTransactionsByDate(transactions);

        return {
            transactions,
            groupedByDate,
            summary: {
                totalIncome: Number(totalIncome.toFixed(2)),
                totalExpenses: Number(totalExpenses.toFixed(2)),
                balance: Number(balance.toFixed(2)),
                transactionCount: transactions.length
            }
        };
    },

    getTransactionById: async (transactionId: string, userId: string): Promise<TransactionDocument> => {
        const transaction = await Transaction.findById(transactionId).populate('category', 'name type');

        if (!transaction) {
            throw new Error('Transaction not found.');
        }
        if (transaction.userId.toString() !== userId.toString()) {
            throw new Error('You are not authorized to view this transaction.');
        }

        return transaction;
    },

    calculateBalance: async (userId: string): Promise<number> => {
        const result: Array<{ _id: 'Income' | 'Expense'; totalAmount: number }> = await Transaction.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: '$type',
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        let totalIncome = 0;
        let totalExpenses = 0;

        for (const group of result) {
            if (group._id === 'Income') {
                totalIncome = group.totalAmount;
            } else if (group._id === 'Expense') {
                totalExpenses = group.totalAmount;
            }
        }

        return Number((totalIncome - totalExpenses).toFixed(2));
    },

    createCategory: async (userId: string, name: string, type: string, limit = 0): Promise<CategoryDocument> => {
        const cleanName = normalizeText(name);
        const cleanType = normalizeText(type).toLowerCase() as CategoryType;

        if (!cleanName) {
            throw new Error('Category name is required.');
        }

        if (!['income', 'expense'].includes(cleanType)) {
            throw new Error('Category type must be income or expense.');
        }

        const existingCategory = await Category.findOne({
            name: cleanName,
            type: cleanType,
            userId
        });

        if (existingCategory) {
            throw new Error('Category already exists.');
        }

        const category = new Category({
            userId,
            name: cleanName,
            type: cleanType,
            limit: Number(limit) || 0
        });

        return await category.createCategory();
    },

    deleteCategory: async (categoryId: string, userId: string): Promise<CategoryDocument> => {
        const category = await Category.findById(categoryId);

        if (!category) {
            throw new Error('Category not found.');
        }
        if (!category.userId || category.userId.toString() !== userId.toString()) {
            throw new Error('You are not authorized to delete this category.');
        }

        const usedByExpense = await Expense.exists({ category: categoryId });
        if (usedByExpense) {
            throw new Error('Cannot delete a category that is used by an expense.');
        }

        await category.deleteCategory();
        return category;
    },

    getAllCategories: async (userId: string): Promise<CategoryDocument[]> => {
        return await Category.find({ userId }).sort({ name: 1 });
    },

    _groupTransactionsByDate: (transactions: TransactionDocument[]): Record<string, TransactionDocument[]> => {
        const groups: Record<string, TransactionDocument[]> = {};
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        for (const transaction of transactions) {
            const transDate = new Date(transaction.date);
            let dateLabel: string;

            if (transDate.toDateString() === today.toDateString()) {
                dateLabel = 'Today';
            } else if (transDate.toDateString() === yesterday.toDateString()) {
                dateLabel = 'Yesterday';
            } else {
                dateLabel = transDate.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
            }

            if (!groups[dateLabel]) {
                groups[dateLabel] = [];
            }
            groups[dateLabel].push(transaction);
        }

        return groups;
    }
};

export default TransactionService;
