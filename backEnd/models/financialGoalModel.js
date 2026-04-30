const mongoose = require('mongoose');

const FinancialGoalSchema = new mongoose.Schema({
  goalId: { type: String, unique: true },
  goalName: String,
  targetAmount: Number,
  currentAmount: Number,
  deadline: Date
});

module.exports = mongoose.model('FinancialGoal', FinancialGoalSchema);