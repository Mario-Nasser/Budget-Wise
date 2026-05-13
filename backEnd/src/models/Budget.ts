import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

export interface IBudget {
  userId: Types.ObjectId;
  category: Types.ObjectId;
  amount: number;
  startDate: Date;
  endDate: Date;
  alertThreshold: number;
}

export type BudgetDocument = HydratedDocument<IBudget>;

type BudgetModel = Model<IBudget>;

const budgetSchema = new Schema<IBudget, BudgetModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Budget amount is required."],
      min: [0.01, "Budget amount must be greater than 0."],
      max: [9999999.99, "Budget amount cannot exceed 9999999.99."],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    alertThreshold: {
      type: Number,
      default: 100,
      min: [1, "Alert threshold must be at least 1."],
      max: [100, "Alert threshold cannot exceed 100."],
    },
  },
  { timestamps: true },
);

budgetSchema.index(
  { userId: 1, category: 1, startDate: 1, endDate: 1 },
  { unique: true },
);

const Budget = mongoose.model<IBudget, BudgetModel>("Budget", budgetSchema);
export default Budget;
