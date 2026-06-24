import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with the API key from your environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

class AIController {
  public async getFinancialAdvice(req: Request, res: Response): Promise<void> {
    try {
      const { userMessage, financialData, chatHistory } = req.body;

      if (!userMessage || !financialData) {
        res.status(400).json({ error: "Missing userMessage or financialData in request body." });
        return;
      }

      // Extract details matching your schema definitions
      const { totalIncome, totalExpenses, netBalance, expenseByCategory, goals, budgets } = financialData;

      // Calculate derived financial metrics
      const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(1) : "0";
      const expenseToIncomeRatio = totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(1) : "0";

      // Construct a highly detailed system instruction so the AI understands its boundaries
      const systemInstruction = `
        You are "BudgetWise AI", an expert personal finance companion embedded in the BudgetWise web application. 
        Your absolute priority is to help the user navigate their real-world financial situation, guide them toward their goals, and offer highly practical strategies to save money.

        Here is the user's live financial landscape extracted from their profile:
        - Monthly Income: $${totalIncome || 0}
        - Monthly Expenses: $${totalExpenses || 0}
        - Current Net Balance: $${netBalance || 0}
        - Savings Rate: ${savingsRate}%
        - Expense-to-Income Ratio: ${expenseToIncomeRatio}%
        
        Breakdown of Expenses by Category:
        ${expenseByCategory ? JSON.stringify(expenseByCategory, null, 2) : "No categorical data logged yet."}

        Budget Limits & Spending:
        ${budgets && budgets.length > 0 ? JSON.stringify(budgets, null, 2) : "No budgets set yet."}

        Active Financial Goals:
        ${goals && goals.length > 0 ? JSON.stringify(goals, null, 2) : "No active goals set yet."}

        Behavioral Guidelines:
        1. Be encouraging, realistic, and highly empathetic. Do not judge their spending habits.
        2. Use their specific breakdown data to highlight optimizations. (e.g., if "Food" or "Entertainment" is high relative to income, offer realistic tips to reduce it).
        3. Keep calculations mathematically precise. Use budgeting rules like 50/30/20 where applicable to guide them.
        4. Provide scannable formatting using clean bullet points and markdown bold text. Keep answers clear and digestible.
        5. If they have an active financial goal, prioritize giving strategies to reach it faster based on their current net balance.
        6. If they have budget limits set, alert them if any category is close to or over the limit.
        7. Cover a wide range of personal finance topics when asked, including:
           - Emergency fund planning (recommend 3-6 months of expenses)
           - Debt payoff strategies (avalanche vs snowball methods)
           - Basic investment concepts (compound interest, diversification)
           - Tax-saving tips and deductions
           - Smart shopping and expense reduction tactics
           - Income diversification ideas
        8. When the user has no financial data yet, still provide helpful general financial advice and encourage them to start tracking their expenses in BudgetWise.
        9. Keep responses concise but actionable - prefer 3-5 bullet points over long paragraphs.
        10. Always end with a specific, actionable next step the user can take.
      `;

      // Set up the model using high-accuracy gemini-2.5-flash
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: systemInstruction,
      });

      // Format the chat history arrays to match what Gemini's API expects
      const formattedHistory = (chatHistory || []).map((msg: any) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }));

      // Initialize the conversation thread with history
      const chat = model.startChat({
        history: formattedHistory,
      });

      // Send the current input message
      const result = await chat.sendMessage(userMessage);
      const responseText = result.response.text();

      res.status(200).json({ reply: responseText });
    } catch (error) {
      console.error("Gemini AI Controller Error:", error);
      res.status(500).json({ error: "Internal server error processing AI financial advice." });
    }
  }
}

export default new AIController();