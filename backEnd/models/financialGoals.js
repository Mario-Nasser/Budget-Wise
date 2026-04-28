class FinancialGoals {
    #goalId;
    #goalName;
    #targetAmount;
    #currentAmount;
    #deadline;
    constructor() {
        this.#goalId = null;
        this.#goalName = null;
        this.#targetAmount = null;
        this.#currentAmount = null;
        this.#deadline = null;
    }
    // set the goal
    setGoal(goalId, goalName, targetAmount, currentAmount, deadline) {
        this.#goalId = goalId;
        this.#goalName = goalName;
        this.#targetAmount = targetAmount;
        this.#currentAmount = currentAmount;
        this.#deadline = deadline;
    }
    // update the progress of the goal
    updateProgress(amount) {
        this.#currentAmount += amount;
    }
    // calculate the progress of the goal
    calculateProgress() {
        if (this.#targetAmount === 0) return 0;
        return (this.#currentAmount / this.#targetAmount) * 100;
    }
    // check if the goal is achieved
    isAchieved() {
        return this.#currentAmount >= this.#targetAmount;
    }
    // get the goal details
    getGoalDetails() {
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