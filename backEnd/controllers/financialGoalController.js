const FinancialGoalService = require('../services/financialGoalService');

exports.createGoal = async (req, res) => {
  try {
    const goal = await FinancialGoalService.createGoal(req.body);
    res.status(201).json(goal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getGoal = async (req, res) => {
  try {
    const goal = await FinancialGoalService.getGoal(req.params.id);
    res.json(goal);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const goal = await FinancialGoalService.updateProgress(
      req.params.id,
      req.body.amount
    );
    res.json(goal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllGoals = async (req, res) => {
  try {
    const goals = await FinancialGoalService.getAllGoals();
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};