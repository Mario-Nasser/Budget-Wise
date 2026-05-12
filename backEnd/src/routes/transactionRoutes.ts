/**
 * @swagger
 * tags:
 *   - name: Transactions
 *     description: Transaction and category management
 *
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *       required:
 *         - id
 *         - name
 *
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         amount:
 *           type: number
 *         type:
 *           type: string
 *           enum: [income, expense]
 *         categoryId:
 *           type: string
 *         description:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *       required:
 *         - id
 *         - amount
 *         - type
 *         - categoryId
 *         - date
 *
 * /transactions/categories:
 *   post:
 *     tags: [Transactions]
 *     summary: Create a new category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Category created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *
 *   get:
 *     tags: [Transactions]
 *     summary: Get all categories
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *
 * /transactions/categories/{id}:
 *   delete:
 *     tags: [Transactions]
 *     summary: Delete category by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 *       404:
 *         description: Category not found
 *
 * /transactions:
 *   post:
 *     tags: [Transactions]
 *     summary: Create a new transaction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       201:
 *         description: Transaction created
 *
 *   get:
 *     tags: [Transactions]
 *     summary: Get all transactions
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *
 * /transactions/{id}:
 *   get:
 *     tags: [Transactions]
 *     summary: Get transaction by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction found
 *       404:
 *         description: Transaction not found
 *
 *   put:
 *     tags: [Transactions]
 *     summary: Update transaction
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
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       200:
 *         description: Transaction updated
 *
 *   delete:
 *     tags: [Transactions]
 *     summary: Delete transaction
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction deleted
 */

import { Router } from "express";
import transactionController from "../controllers/transactionController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.use(verifyToken);

/* ======================
   CATEGORIES
====================== */
router.post('/categories', verifyToken, transactionController.createCategory);
router.get('/categories', verifyToken, transactionController.getAllCategories);
router.delete('/categories/:id', verifyToken, transactionController.deleteCategory);

/* ======================
   TRANSACTIONS
====================== */
router.post('/', verifyToken, transactionController.createTransaction);
router.get("/", verifyToken, transactionController.getAllTransactions);
router.get("/:id", verifyToken, transactionController.getTransaction);
router.put("/:id", verifyToken, transactionController.updateTransaction);
router.delete("/:id", verifyToken, transactionController.deleteTransaction);
router.delete("/clear/all", verifyToken, transactionController.clearAll);

export default router;
