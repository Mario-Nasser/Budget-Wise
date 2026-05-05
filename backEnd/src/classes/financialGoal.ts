interface GoalData {
  goalId: string;
  goalName: string;
  targetAmount: number;
  currentAmount?: number;
  deadline: Date | string;
}

export class FinancialGoal {
  #goalId: string;
  #goalName: string;
  #targetAmount: number;
  #currentAmount: number;
  #deadline: Date;

  constructor({ goalId, goalName, targetAmount, currentAmount = 0, deadline }: GoalData) {
    this.#goalId = goalId;
    this.#goalName = goalName;
    this.#targetAmount = targetAmount;
    this.#currentAmount = currentAmount;
    this.#deadline = new Date(deadline);
  }

  updateProgress(amount: number) {
    if (amount <= 0) throw new Error("Amount must be positive");
    this.#currentAmount += amount;
  }

  calculateProgress(): number {
    if (this.#targetAmount === 0) return 0;
    return (this.#currentAmount / this.#targetAmount) * 100;
  }

  isAchieved(): boolean {
    return this.#currentAmount >= this.#targetAmount;
  }

  getData() {
    return {
      goalId: this.#goalId,
      goalName: this.#goalName,
      targetAmount: this.#targetAmount,
      currentAmount: this.#currentAmount,
      deadline: this.#deadline
    };
  }

  getFullDetails() {
    return {
      ...this.getData(),
      progress: this.calculateProgress(),
      isAchieved: this.isAchieved()
    };
  }
}

// export default FinancialGoal;