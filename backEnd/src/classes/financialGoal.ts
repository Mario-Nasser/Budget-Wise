export interface GoalData {
  goalId: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date | string;
}

export class FinancialGoal {
  private goalData: GoalData;

  constructor(data: GoalData) {
    this.goalData = data;
  }

  get goalId() {
    return this.goalData.goalId;
  }

  get goalName() {
    return this.goalData.goalName;
  }

  get targetAmount() {
    return this.goalData.targetAmount;
  }

  get currentAmount() {
    return this.goalData.currentAmount;
  }

  get deadline() {
    return this.goalData.deadline;
  }

  updateProgress(amount: number) {
    if (amount <= 0) throw new Error("Amount must be positive");
    this.goalData.currentAmount += amount;
  }

  calculateProgress(): number {
    if (this.targetAmount === 0) return 0;
    return (this.currentAmount / this.targetAmount) * 100;
  }

  isAchieved(): boolean {
    return this.currentAmount >= this.targetAmount;
  }

  getData() {
    return {
      goalId: this.goalId,
      goalName: this.goalName,
      targetAmount: this.targetAmount,
      currentAmount: this.currentAmount,
      deadline: this.deadline,
    };
  }

  getFullDetails() {
    return {
      ...this.getData(),
      progress: this.calculateProgress(),
      isAchieved: this.isAchieved(),
    };
  }
}
