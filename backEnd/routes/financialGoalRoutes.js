/**
 * @swagger
 * tags:
 *   - name: Goals
 *     description: Financial goal management
 * components:
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
 * /goals:
 *   post:
 *     tags: [Goals]
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
 *   get:
 *     tags: [Goals]
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

const express = require('express');
const router = express.Router();
const controller = require('../controllers/financialGoalController');

router.post('/', controller.createGoal);
router.get('/', controller.getAllGoals);
router.get('/:id', controller.getGoal);
router.patch('/:id/progress', controller.updateProgress);

module.exports = router;