import { Request, Response } from "express";
import transactionService, {
  TransactionUpdates,
} from "../services/transactionService";
import { TransactionFilters, TransactionType } from "../models/Transaction";

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : "Unexpected error occurred.";
};

const getErrorStatus = (message: string): number => {
  if (message.includes("not found")) {
    return 404;
  }
  if (message.includes("authorized")) {
    return 403;
  }
  return 400;
};

const getQueryString = (value: unknown): string | undefined => {
  return typeof value === "string" ? value : undefined;
};

const getParamString = (value: string | string[] | undefined): string => {
  return Array.isArray(value) ? value[0] : value || "";
};

const transactionController = {
  createTransaction: async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        type,
        amount,
        description,
        date,
        source,
        categoryId,
        paymentMethod,
        note,
      } = req.body;

      const userId = (req as any).user.id;

      const { savedTransaction, newBalance, nearLimit, categoryName } =
        await transactionService.addTransaction(
          userId,
          amount,
          type,
          description,
          date,
          source,
          categoryId,
          paymentMethod,
          note,
        );

      res.status(201).json({
        message: "Transaction added successfully.",
        data: {
          transactionId: savedTransaction._id,
          type: savedTransaction.type,
          amount: savedTransaction.amount,
          date: savedTransaction.date,
          description: savedTransaction.description,
          newBalance,
        },
        warning: nearLimit ? `Warning: You have reached 90% of your limit for the ${categoryName} category!` : null,
      });
    } catch (error) {
      res.status(400).json({
        message: getErrorMessage(error),
      });
    }
  },

  getAllTransactions: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const type = getQueryString(req.query.type);

      const filters: TransactionFilters = {
        type:
          type === "Income" || type === "Expense"
            ? (type as TransactionType)
            : undefined,
        categoryId: getQueryString(req.query.categoryId),
        startDate: getQueryString(req.query.startDate),
        endDate: getQueryString(req.query.endDate),
      };

      const result = await transactionService.getAllTransactions(
        userId,
        filters,
      );

      if (result.transactions.length === 0) {
        res.status(200).json({
          message: "No transactions found for this filter.",
          data: result,
        });
        return;
      }

      res.status(200).json({
        message: "Transactions retrieved successfully.",
        data: result,
      });
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  },

  getTransaction: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const transactionId = getParamString(req.params.id);

      const transaction = await transactionService.getTransactionById(
        transactionId,
        userId,
      );

      res.status(200).json({
        message: "Transaction retrieved successfully.",
        data: transaction,
      });
    } catch (error) {
      const message = getErrorMessage(error);
      res.status(getErrorStatus(message)).json({ message });
    }
  },

  updateTransaction: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const transactionId = getParamString(req.params.id);
      const updates = req.body as TransactionUpdates;

      const { updatedTransaction, newBalance } =
        await transactionService.editTransaction(
          transactionId,
          userId,
          updates,
        );

      res.status(200).json({
        message: "Transaction updated successfully.",
        data: {
          transaction: updatedTransaction,
          newBalance,
        },
      });
    } catch (error) {
      const message = getErrorMessage(error);
      res.status(getErrorStatus(message)).json({ message });
    }
  },

  deleteTransaction: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const transactionId = getParamString(req.params.id);
      const { deletedTransaction, newBalance } =
        await transactionService.deleteTransaction(transactionId, userId);

      res.status(200).json({
        message: "Transaction deleted successfully.",
        data: {
          transactionId: deletedTransaction._id,
          newBalance,
        },
      });
    } catch (error) {
      const message = getErrorMessage(error);
      res.status(getErrorStatus(message)).json({ message });
    }
  },

  createCategory: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const { name, type, limit } = req.body;

      const category = await transactionService.createCategory(
        userId,
        name,
        type,
        limit
      );

      res.status(201).json({
        message: "Category created successfully.",
        data: category,
      });
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  },

  getAllCategories: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const categories = await transactionService.getAllCategories(userId);

      res.status(200).json({
        message: "Categories retrieved successfully.",
        data: categories,
      });
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  },

  deleteCategory: async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const categoryId = getParamString(req.params.id);

      await transactionService.deleteCategory(categoryId, userId);

      res.status(200).json({
        message: "Category deleted successfully.",
      });
    } catch (error) {
      const message = getErrorMessage(error);
      res.status(getErrorStatus(message)).json({ message });
    }
  },
};

export default transactionController;
