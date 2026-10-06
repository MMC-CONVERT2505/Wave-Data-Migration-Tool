import { Router } from "express";
import { redirectToWave, handleCallback, getStatus, logout, manualLogin } from "../controllers/auth.controller.js";

const router = Router();

router.get("/wave", redirectToWave);
router.get("/status", getStatus);
router.post("/logout", logout);
router.post("/manual", manualLogin);

export default router;