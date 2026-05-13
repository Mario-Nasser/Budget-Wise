import mongoose from "mongoose";
import Budget, { BudgetDocument } from "../models/Budget";
import Category from "../models/Category";
import Transaction from "../models/Transaction";

interface BudgetInput {
  categoryId: string;
  amount: number | string;
  startDate?: string;
  endDate?: string;
  alertThreshold?: number | string;
}

const monthBounds = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

const toDate = (value: string | undefined, fallback: Date): Date => {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Please enter a valid budget date.");
  }
  return parsed;
};

class BudgetService {
  static async createBudget(userId: string, input: BudgetInput): Promise<BudgetDocument> {
    const budget = await this.buildBudget(userId, input);
    const existing = await Budget.findOne({
      userId,
      category: budget.category,
      startDate: budget.startDate,
      endDate: budget.endDate,
    });

    if (existing) {
      throw new Error("A budget for this category already exists for this period. Please edit the existing budget instead.");
    }

    return await budget.save();
  }

  static async updateBudget(userId: string, budgetId: string, input: Partial<BudgetInput>): Promise<BudgetDocument> {
    const budget = await Budget.findOne({ _id: budgetId, userId });
    if (!budget) throw new Error("Budget not found.");

    if (input.categoryId) {
      await this.validateExpenseCategory(userId, input.categoryId);
      budget.category = new mongoose.Types.ObjectId(input.categoryId);
    }
    if (input.amount !== undefined) budget.amount = this.validateAmount(input.amount);
    if (input.alertThreshold !== undefined) budget.alertThreshold = this.validateThreshold(input.alertThreshold);
    if (input.startDate) budget.startDate = toDate(input.startDate, budget.startDate);
    if (input.endDate) budget.endDate = toDate(input.endDate, budget.endDate);
    if (budget.endDate < budget.startDate) throw new Error("End date must be after start date.");

    const conflict = await Budget.findOne({
      _id: { $ne: budget._id },
      userId,
      category: budget.category,
      startDate: budget.startDate,
      endDate: budget.endDate,
    });
    if (conflict) {
      throw new Error("A budget for this category already exists for this period.");
    }

    return await budget.save();
  }

  static async deleteBudget(userId: string, budgetId: string): Promise<void> {
    const deleted = await Budget.findOneAndDelete({ _id: budgetId, userId });
    if (!deleted) throw new Error("Budget not found.");
  }

  static async getBudgets(userId: string): Promise<any[]> {
    const budgets = await Budget.find({ userId }).populate("category", "name type").sort({ startDate: -1 });
    return await Promise.all(budgets.map((budget) => this.withProgress(userId, budget)));
  }

  static async getAlertForTransaction(userId: string, categoryId: string, date: Date): Promise<string | undefined> {
    const budget = await Budget.findOne({
      userId,
      category: categoryId,
      startDate: { $lte: date },
      endDate: { $gte: date },
    }).populate("category", "name");

    if (!budget) return undefined;
    const enriched = await this.withProgress(userId, budget);
    if (enriched.percentSpent >= 100) {
      return `Budget Exceeded - ${enriched.category.name}: You've used ${enriched.percentSpent.toFixed(1)}% of your budget.`;
    }
    if (enriched.percentSpent >= budget.alertThreshold) {
      return `Budget Alert - ${enriched.category.name}: You've used ${enriched.percentSpent.toFixed(1)}% of your budget.`;
    }
    return undefined;
  }

  private static async buildBudget(userId: string, input: BudgetInput): Promise<BudgetDocument> {
    if (!input.categoryId) throw new Error("Category is required.");
    await this.validateExpenseCategory(userId, input.categoryId);

    const { start, end } = monthBounds();
    const startDate = toDate(input.startDate, start);
    const endDate = toDate(input.endDate, end);
    if (endDate < startDate) throw new Error("End date must be after start date.");

    return new Budget({
      userId,
      category: input.categoryId,
      amount: this.validateAmount(input.amount),
      startDate,
      endDate,
      alertThreshold: this.validateThreshold(input.alertThreshold ?? 100),
    });
  }

  private static validateAmount(amount: number | string): number {
    const numeric = Number(amount);
    if (Number.isNaN(numeric) || numeric <= 0) throw new Error("Budget amount must be greater than 0.");
    if (numeric > 9999999.99) throw new Error("Budget amount cannot exceed 9,999,999.99.");
    return numeric;
  }

  private static validateThreshold(value: number | string): number {
    const numeric = Number(value);
    if (Number.isNaN(numeric) || numeric <= 0 || numeric > 100) {
      throw new Error("Alert threshold must be between 1 and 100.");
    }
    return numeric;
  }

  private static async validateExpenseCategory(userId: string, categoryId: string): Promise<void> {
    const category = await Category.findOne({
      _id: categoryId,
      type: "expense",
      $or: [{ isDefault: true }, { userId }],
    });
    if (!category) throw new Error("Please select a valid expense category.");
  }

  private static async withProgress(userId: string, budget: BudgetDocument): Promise<any> {
    const result = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          category: budget.category instanceof mongoose.Types.ObjectId ? budget.category : (budget.category as any)._id,
          type: "Expense",
          date: { $gte: budget.startDate, $lte: budget.endDate },
        },
      },
      { $group: { _id: null, spent: { $sum: "$amount" } } },
    ]);

    const spent = result[0]?.spent || 0;
    const percentSpent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    const status = percentSpent >= 100 ? "Exceeded" : percentSpent >= budget.alertThreshold ? "Near Limit" : "On Track";

    return {
      id: budget._id,
      category: budget.category,
      amount: budget.amount,
      startDate: budget.startDate,
      endDate: budget.endDate,
      alertThreshold: budget.alertThreshold,
      spent: Number(spent.toFixed(2)),
      remaining: Number((budget.amount - spent).toFixed(2)),
      percentSpent,
      status,
    };
  }
}

export default BudgetService;
