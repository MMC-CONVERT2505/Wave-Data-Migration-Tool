import { Router } from "express";
import isAuthenticated from "../middleware/auth.middleware.js";
import { bulkCreateInvoices } from "../controllers/invoice.controller.js";

const router = Router();

router.post("/bulk", isAuthenticated, bulkCreateInvoices);

export default router;