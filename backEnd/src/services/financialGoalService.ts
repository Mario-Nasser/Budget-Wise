import { FinancialGoal, GoalData } from "../classes/financialGoal";
import FinancialGoalModel from "../models/financialGoalModel";
const crypto = require('crypto');
import { AIIconService } from "./goalIconService";

class FinancialGoalService {
  static async createGoal(data: any) {
    const goalIcon : string = await AIIconService.generateIconName(data.goalName);
    const goal = new FinancialGoal({
      goalId: uuidv4(),
      ...data,
      goalIcon,
    });

    const saved = await FinancialGoalModel.create(goal.getData());
    const obj = saved.toObject() as any;
    obj.userId = obj.userId.toString();
    return new FinancialGoal(obj as GoalData).getFullDetails();
  }

  static async getGoal(goalId: string, userId: string) {
    const data = await FinancialGoalModel.findOne({
      goalId,
      userId,
    });

    if (!data) throw new Error("Goal not found");

    const obj = data.toObject() as any;
    obj.userId = obj.userId.toString();
    const goal = new FinancialGoal(obj as GoalData);
    return goal.getFullDetails();
  }

  static async updateProgress(goalId: string, amount: number, userId: string) {
    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      throw new Error("Amount must be positive");
    }

    const data = await FinancialGoalModel.findOne({
      goalId,
      userId,
    });

    if (!data) throw new Error("Goal not found");

    const obj = data.toObject() as any;
    obj.userId = obj.userId.toString();
    const goal = new FinancialGoal(obj as GoalData);
    goal.updateProgress(numericAmount);

    await FinancialGoalModel.updateOne(
      { goalId, userId },
      { currentAmount: goal.getData().currentAmount },
    );

    return goal.getFullDetails();
  }

  static async getAllGoals(userId: string) {
    await FinancialGoalModel.updateMany(
      { userId, currentAmount: { $exists: false } },
      { $set: { currentAmount: 0 } },
    );

    const goals = await FinancialGoalModel.find({
      userId,
    });

    return goals.map((g) => {
      const obj = g.toObject() as any;
      obj.userId = obj.userId.toString();
      const goal = new FinancialGoal(obj as GoalData);
      return goal.getFullDetails();
    });
  }

  static async deleteGoal(goalId: string, userId: string) {
    const result = await FinancialGoalModel.deleteOne({ goalId, userId });
    if (result.deletedCount === 0) throw new Error("Goal not found or unauthorized");
    return { success: true };
  }
}

export default FinancialGoalService;
