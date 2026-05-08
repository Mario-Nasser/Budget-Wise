import express from "express";
import { verifyToken } from "../middleware/authMiddleware";
import { register, login, logout } from "../controllers/authController";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", verifyToken, logout);

router.get("/profile", verifyToken, (req, res) => {
  res.json({
    message: "You are authorized",
    user: (req as any).user,
  });
});

export default router;
