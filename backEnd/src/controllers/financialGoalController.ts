import { Request, Response } from "express";
import FinancialGoalService from "../services/financialGoalService";

export const createGoal = async (req: Request, res: Response) => {
  try {
    const goal = await FinancialGoalService.createGoal({
      ...req.body,
      userId: (req as any).user.id,
    });
    res.status(201).json(goal);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getGoal = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const goal = await FinancialGoalService.getGoal(
      id,
      (req as any).user.id,
    );
    res.json(goal);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

export const updateProgress = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const goal = await FinancialGoalService.updateProgress(
      id,
      req.body.amount,
      (req as any).user.id,
    );
    res.json(goal);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllGoals = async (req: Request, res: Response) => {
  try {
    const goals = await FinancialGoalService.getAllGoals((req as any).user.id);
    res.json(goals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteGoal = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await FinancialGoalService.deleteGoal(id, (req as any).user.id);
    res.json({ message: "Goal deleted successfully" });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};
