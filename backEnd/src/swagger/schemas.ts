export const schemas = {
  FinancialGoal: {
    type: "object",
    properties: {
      goalId: { type: "string" },
      goalName: { type: "string" },
      targetAmount: { type: "number" },
      currentAmount: { type: "number" },
      deadline: { type: "string", format: "date" },
      progress: { type: "number" },
      isAchieved: { type: "boolean" }
    },
    required: [
      "goalId",
      "goalName",
      "targetAmount",
      "currentAmount",
      "deadline"
    ]
  }
};