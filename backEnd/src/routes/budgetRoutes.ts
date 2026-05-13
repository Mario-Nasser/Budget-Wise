import { Router } from "express";
import budgetController from "../controllers/budgetController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.use(verifyToken);
router.post("/", budgetController.create);
router.get("/", budgetController.getAll);
router.put("/:id", budgetController.update);
router.delete("/:id", budgetController.delete);

export default router;
