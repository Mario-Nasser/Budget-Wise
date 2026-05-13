import { Request, Response } from "express";
import BudgetService from "../services/budgetService";

const message = (error: unknown): string => error instanceof Error ? error.message : "Unexpected error occurred.";
const param = (value: string | string[] | undefined): string => Array.isArray(value) ? value[0] : value || "";

const budgetController = {
  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const budget = await BudgetService.createBudget((req as any).user.id, req.body);
      res.status(201).json({ message: "Budget created successfully.", data: budget });
    } catch (error) {
      res.status(400).json({ message: message(error) });
    }
  },

  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const budgets = await BudgetService.getBudgets((req as any).user.id);
      res.status(200).json({ message: "Budgets retrieved successfully.", data: budgets });
    } catch (error) {
      res.status(500).json({ message: message(error) });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const budget = await BudgetService.updateBudget((req as any).user.id, param(req.params.id), req.body);
      res.status(200).json({ message: "Budget updated successfully.", data: budget });
    } catch (error) {
      res.status(400).json({ message: message(error) });
    }
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      await BudgetService.deleteBudget((req as any).user.id, param(req.params.id));
      res.status(200).json({ message: "Budget deleted successfully." });
    } catch (error) {
      res.status(400).json({ message: message(error) });
    }
  },
};

export default budgetController;
