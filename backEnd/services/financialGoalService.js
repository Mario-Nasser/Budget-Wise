const FinancialGoal = require('../classes/FinancialGoal');
const FinancialGoalModel = require('../models/financialGoalModel');
const { v4: uuidv4 } = require('uuid');

class FinancialGoalService {

  static async createGoal(data) {
    const goal = new FinancialGoal({
      goalId: uuidv4(),
      ...data
    });

    return await FinancialGoalModel.create(goal.getData());
  }

  static async getGoal(goalId) {
    const data = await FinancialGoalModel.findOne({ goalId });

    if (!data) throw new Error("Goal not found");

    const goal = new FinancialGoal(data);
    return goal.getFullDetails();
  }

  static async updateProgress(goalId, amount) {
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

module.exports = FinancialGoalService;