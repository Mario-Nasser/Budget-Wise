/**
 * @swagger
 * tags:
 * - name: AI Advisor
 * description: AI-powered financial guidance and recommendations
 *
 * /ai/chat:
 * post:
 * tags: [AI Advisor]
 * summary: Chat with BudgetWise AI advisor
 * description: Sends user message along with real-time financial data context to Gemini for personalized advice.
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - userMessage
 * - financialData
 * - chatHistory
 * properties:
 * userMessage:
 * type: string
 * example: "How can I optimize my budget to save for my graduation trip?"
 * chatHistory:
 * type: array
 * items:
 * type: object
 * properties:
 * sender:
 * type: string
 * enum: [user, ai]
 * text:
 * type: string
 * financialData:
 * type: object
 * properties:
 * totalIncome:
 * type: number
 * totalExpenses:
 * type: number
 * netBalance:
 * type: number
 * expenseByCategory:
 * type: object
 * goals:
 * type: array
 * items:
 * type: object
 * properties:
 * goalName:
 * type: string
 * targetAmount:
 * type: number
 * currentAmount:
 * type: number
 * responses:
 * 200:
 * description: AI response generated successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * reply:
 * type: string
 * 400:
 * description: Invalid request payload
 * 401:
 * description: Unauthorized
 */

import { Router } from "express";
import aiController from "../controllers/aiController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

// Protect the AI route so only logged-in users can access it
router.use(verifyToken);

router.post("/chat", aiController.getFinancialAdvice);

export default router;