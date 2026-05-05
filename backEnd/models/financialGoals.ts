export interface GoalDetails {
    goalId: string | null;
    goalName: string | null;
    targetAmount: number;
    currentAmount: number;
    deadline: Date | string | null;
    progress: number;
    isAchieved: boolean;
}

class FinancialGoals {
    #goalId: string | null;
    #goalName: string | null;
    #targetAmount: number;
    #currentAmount: number;
    #deadline: Date | string | null;

    constructor() {
        this.#goalId = null;
        this.#goalName = null;
        this.#targetAmount = 0;
        this.#currentAmount = 0;
        this.#deadline = null;
    }

    setGoal(
        goalId: string,
        goalName: string,
        targetAmount: number,
        currentAmount: number,
        deadline: Date | string
    ): void {
        this.#goalId = goalId;
        this.#goalName = goalName;
        this.#targetAmount = targetAmount;
        this.#currentAmount = currentAmount;
        this.#deadline = deadline;
    }

    updateProgress(amount: number): void {
        this.#currentAmount += amount;
    }

    calculateProgress(): number {
        if (this.#targetAmount === 0) {
            return 0;
        }
        return (this.#currentAmount / this.#targetAmount) * 100;
    }

    isAchieved(): boolean {
        return this.#currentAmount >= this.#targetAmount;
    }

    getGoalDetails(): GoalDetails {
        return {
            goalId: this.#goalId,
            goalName: this.#goalName,
            targetAmount: this.#targetAmount,
            currentAmount: this.#currentAmount,
            deadline: this.#deadline,
            progress: this.calculateProgress(),
            isAchieved: this.isAchieved()
        };
    }
}

export default FinancialGoals;