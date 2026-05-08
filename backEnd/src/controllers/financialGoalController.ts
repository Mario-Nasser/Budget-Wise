import { Request, Response } from "express";
import FinancialGoalService from "../services/financialGoalService";
import { GoalData } from "../classes/financialGoal";

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
    const goal: GoalData = await FinancialGoalService.getGoal(
      String(req.params.id),
      (req as any).user.id,
    );
    res.json(goal);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

export const updateProgress = async (req: Request, res: Response) => {
  try {
    const goal = await FinancialGoalService.updateProgress(
      String(req.params.id),
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
