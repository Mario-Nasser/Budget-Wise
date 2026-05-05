import { FinancialGoal } from '../classes/financialGoal';
import FinancialGoalModel from '../models/financialGoalModel';
import { v4 as uuidv4 } from 'uuid';

class FinancialGoalService {

  static async createGoal(data: any) {
    const goal = new FinancialGoal({
      goalId: uuidv4(),
      ...data
    });

    return await FinancialGoalModel.create(goal.getData());
  }

  static async getGoal(goalId: string) {
    const data = await FinancialGoalModel.findOne({ goalId });

    if (!data) throw new Error("Goal not found");

    const goal = new FinancialGoal(data);
    return goal.getFullDetails();
  }

  static async updateProgress(goalId: string, amount: number) {
    const data = await FinancialGoalModel.findOne({ goalId });

    if (!data) throw new Error("Goal not found");

    const goal = new FinancialGoal(data);
    goal.updateProgress(amount);

    await FinancialGoalModel.updateOne(
      { goalId },
      { currentAmount: goal.getData().currentAmount }
    );

    return goal.getFullDetails();
  }

  static async getAllGoals() {
    const goals = await FinancialGoalModel.find();

    return goals.map(g => {
      const goal = new FinancialGoal(g);
      return goal.getFullDetails();
    });
  }
}

export default FinancialGoalService;