import { Router } from "express";
import { filterInvoices, downloadExcel } from "../controllers/export.controller.js";

const router = Router();

// Ye routes apna khud ka api_token + business_id form input se lete hain
// (jaisa purane Python/FastAPI extraction tool me tha), isliye session auth
// middleware yahan zaroori nahi hai.
router.post("/filter", filterInvoices);
router.post("/download", downloadExcel);

export default router;
