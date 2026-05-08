import { FinancialGoal, GoalData } from "../classes/financialGoal";
import FinancialGoalModel from "../models/financialGoalModel";
import { v4 as uuidv4 } from "uuid";

class FinancialGoalService {
  static async createGoal(data: any) {
    const goal = new FinancialGoal({
      goalId: uuidv4(),
      ...data,
    });

    return await FinancialGoalModel.create(goal.getData());
  }

  static async getGoal(goalId: string, userId: string) {
    const data: GoalData | null = await FinancialGoalModel.findOne({
      goalId,
      userId,
    });

    if (!data) throw new Error("Goal not found");

    const goal = new FinancialGoal(data);
    return goal.getFullDetails();
  }

  static async updateProgress(goalId: string, amount: number, userId: string) {
    const data: GoalData | null = await FinancialGoalModel.findOne({
      goalId,
      userId,
    });

    if (!data) throw new Error("Goal not found");

    const goal = new FinancialGoal(data);
    goal.updateProgress(amount);

    await FinancialGoalModel.updateOne(
      { goalId, userId },
      { currentAmount: goal.getData().currentAmount }
    );

    return goal.getFullDetails();
  }

  static async getAllGoals(userId: string) {
    const goals: GoalData[] | null = await FinancialGoalModel.find({
      userId,
    });

    if (!goals) throw new Error("No goals found");

    return goals.map((g: GoalData) => {
      const goal = new FinancialGoal(g);
      return goal.getFullDetails();
    });
  }
}

export default FinancialGoalService;
