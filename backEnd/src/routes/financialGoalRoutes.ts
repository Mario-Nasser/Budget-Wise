/**
 * @swagger
 * tags:
 *   - name: Goals
 *     description: Financial goal management
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     FinancialGoal:
 *       type: object
 *       properties:
 *         goalId:
 *           type: string
 *         goalName:
 *           type: string
 *         targetAmount:
 *           type: number
 *         currentAmount:
 *           type: number
 *         deadline:
 *           type: string
 *           format: date
 *         progress:
 *           type: number
 *         isAchieved:
 *           type: boolean
 *       required:
 *         - goalId
 *         - goalName
 *         - targetAmount
 *         - currentAmount
 *         - deadline
 *
 * security:
 *   - bearerAuth: []
 *
 * /goals:
 *   post:
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new financial goal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               goalName:
 *                 type: string
 *               targetAmount:
 *                 type: number
 *               deadline:
 *                 type: string
 *                 format: date
 *             required:
 *               - goalName
 *               - targetAmount
 *               - deadline
 *     responses:
 *       201:
 *         description: Goal created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FinancialGoal'
 *       400:
 *         description: Invalid request
 *
 *   get:
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     summary: Get all financial goals
 *     responses:
 *       200:
 *         description: List of goals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FinancialGoal'
 *
 * /goals/{id}:
 *   get:
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     summary: Get a specific financial goal by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Goal found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FinancialGoal'
 *       404:
 *         description: Goal not found
 *
 * /goals/{id}/progress:
 *   patch:
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     summary: Update progress for a goal
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *             required:
 *               - amount
 *     responses:
 *       200:
 *         description: Updated goal
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FinancialGoal'
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Goal not found
 */

import express from 'express';
import {
  createGoal,
  getGoal,
  updateProgress,
  getAllGoals,
  deleteGoal,
} from "../controllers/financialGoalController";
import { verifyToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', verifyToken, createGoal);
router.get("/", verifyToken, getAllGoals);
router.delete("/:id", verifyToken, deleteGoal);
router.get('/:id', verifyToken, getGoal);
router.patch('/:id/progress', verifyToken, updateProgress);

export default router;