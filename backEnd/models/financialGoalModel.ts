import mongoose from 'mongoose';

const FinancialGoalSchema = new mongoose.Schema({
  goalId: { type: String, unique: true },
  goalName: String,
  targetAmount: Number,
  currentAmount: Number,
  deadline: Date
});

export default mongoose.model('FinancialGoal', FinancialGoalSchema);
