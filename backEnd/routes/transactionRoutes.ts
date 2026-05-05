import { Router } from 'express';
import transactionController from '../controllers/transactionController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/categories', transactionController.createCategory);
router.get('/categories', transactionController.getAllCategories);
router.delete('/categories/:id', transactionController.deleteCategory);

router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getAllTransactions);
router.get('/:id', transactionController.getTransaction);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

export default router;
