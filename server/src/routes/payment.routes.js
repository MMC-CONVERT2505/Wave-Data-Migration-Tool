import { Router } from "express";
import isAuthenticated from "../middleware/auth.middleware.js";
import { listInvoices, listAccounts, applyPayment, bulkApplyPayment, bulkCreatePaymentsFromExcel } from "../controllers/payment.controller.js";

const router = Router();

router.get("/:businessId/invoices",       isAuthenticated, listInvoices);
router.get("/:businessId/accounts",       isAuthenticated, listAccounts);
router.post("/apply",                     isAuthenticated, applyPayment);
router.post("/bulk-apply",                isAuthenticated, bulkApplyPayment);
router.post("/bulk-excel",                isAuthenticated, bulkCreatePaymentsFromExcel); // NEW

export default router;