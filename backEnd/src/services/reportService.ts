import mongoose, { Types } from "mongoose";
import Category, { CategoryDocument, CategoryType } from "../models/Category";
import Expense from "../models/Expense";
import Income from "../models/Income";
import Transaction, {
  TransactionDocument,
  TransactionFilters,
} from "../models/Transaction";

class ReportService {
  static async getReport(filters: TransactionFilters, groupBy: "day" | "week" | "month" = "week") {
    const [totalIncome, totalExpenses, expenseByCategory, spendingPattern] = await Promise.all([
      this.totalIncome(filters),
      this.totalExpenses(filters),
      this.expenseByCategory(filters),
      this.spendingPattern(filters, groupBy),

    ]);
    return {
        totalIncome,
        totalExpenses,
        categoryBreakdown: expenseByCategory.map((c) => {
          const total = totalExpenses || 1; // avoid division by zero
          return {
            categoryName: c.categoryName,
            amount: c.totalAmount,
            percentage: (c.totalAmount / total) * 100,
          };
        }),
        categoryChart: {
        labels: expenseByCategory.map((c) => c.categoryName),
        values: expenseByCategory.map((c) => c.totalAmount),
        },
        spendingPattern,
    };

  }
  // pattens
  static async spendingPattern(
    filters: TransactionFilters = {},
    groupBy: "day" | "week" | "month" = "week",
  ) {
    const dateFilter =
      filters.startDate || filters.endDate
        ? {
            date: {
              ...(filters.startDate && { $gte: new Date(filters.startDate) }),
              ...(filters.endDate && { $lte: new Date(filters.endDate) }),
            },
          }
        : {};

    let groupStage: any = {};

    if (groupBy === "day") {
      groupStage = {
        year: { $year: "$date" },
        month: { $month: "$date" },
        day: { $dayOfMonth: "$date" },
      };
    }

    if (groupBy === "week") {
      groupStage = {
        year: { $year: "$date" },
        week: { $isoWeek: "$date" },
      };
    }

    if (groupBy === "month") {
      groupStage = {
        year: { $year: "$date" },
        month: { $month: "$date" },
      };
    }

    return await Transaction.aggregate([
      {
        $match: {
          type: "Expense",
          ...dateFilter,
        },
      },
      { // group by the specified pattern and sum amounts
        $group: {
          _id: groupStage,
          totalSpent: { $sum: "$amount" },
        },
      },
      { // sort by date ascending
        $sort: { _id: 1 },
      },
      { // project the output to have a readable period format
        $project: {
          _id: 0,
          period: "$_id",
          totalSpent: 1,
        },
      },
    ]);
  }
  // Calculate total income for a user with optional date filters
  static async totalIncome(
    filters: TransactionFilters,
  ): Promise<number> {
    const result = await Transaction.aggregate([
      {
        $match: {
          type: "Income",
          ...(filters.startDate || filters.endDate
            ? {
                date: {
                  ...(filters.startDate
                    ? { $gte: new Date(filters.startDate) }
                    : {}),
                  ...(filters.endDate
                    ? { $lte: new Date(filters.endDate) }
                    : {}),
                },
              }
            : {}),
        },
      },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: "$amount" },
        },
      },
    ]);
    // return total income or 0 if no income transactions found
    return result[0]?.totalIncome || 0;
  }

  // Calculate total expenses for a user with optional date filters
  static async totalExpenses(
    filters: TransactionFilters,
  ): Promise<number> {
    const result = await Transaction.aggregate([
      {
        $match: {
          type: "Expense",
          ...(filters.startDate || filters.endDate
            ? {
                date: {
                  ...(filters.startDate
                    ? { $gte: new Date(filters.startDate) }
                    : {}),
                  ...(filters.endDate
                    ? { $lte: new Date(filters.endDate) }
                    : {}),
                },
              }
            : {}),
        },
      },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: "$amount" },
        },
      },
    ]);

    return result[0]?.totalExpenses || 0;
  }

  // Get expense breakdown by category for a user with optional date filters
  static async expenseByCategory(
    filters: TransactionFilters = {},
  ) {
    const dateFilter =
      filters.startDate || filters.endDate
        ? {
            date: {
              ...(filters.startDate && {
                $gte: new Date(filters.startDate),
              }),
              ...(filters.endDate && {
                $lte: new Date(filters.endDate),
              }),
            },
          }
        : {};

    // return array of categories with total expenses for each category
    return await Transaction.aggregate([
      {
        // condition to match only expenses for the user and apply date filters if provided
        $match: {
          type: "Expense",
          ...dateFilter,
        },
      },
      {
        // group by category and sum amounts
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        // join with categories collection to get category names
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        // flatten the category array to get category details
        $unwind: "$category",
      },
      {
        // project the final output with category name and total amount
        $project: {
          _id: 0,
          categoryName: "$category.name",
          totalAmount: 1,
        },
      },
    ]);
  }
}

export default ReportService;