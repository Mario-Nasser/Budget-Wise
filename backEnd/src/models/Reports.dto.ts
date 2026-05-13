export interface SpendingPattern {
  period: {
    year: number;
    month?: number;
    day?: number;
    week?: number;
  };
  totalSpent: number;
}

export interface Report {
  totalIncome: number;
  totalExpenses: number;
  totalGoalSavings: number;
  netBalance: number;
  expenseByCategory: ExpenseByCategory[];
  categoryChart: CategoryChart;
  spendingPattern: SpendingPattern[];
}

export interface ExpenseByCategory {
  categoryName: string;
  totalAmount: number;
  percentage: number;
}

export interface CategoryChart {
  labels: string[];
  values: number[];
}
