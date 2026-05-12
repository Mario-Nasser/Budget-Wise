import mongoose from 'mongoose';

const FinancialGoalSchema = new mongoose.Schema({
  goalId: { type: String, unique: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goalName: String,
  targetAmount: Number,
  currentAmount: { type: Number, default: 0 },
  deadline: Date
});

export default mongoose.model('FinancialGoal', FinancialGoalSchema);
