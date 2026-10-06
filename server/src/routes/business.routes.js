// import { Router } from "express";
// import isAuthenticated from "../middleware/auth.middleware.js";
// import { listBusinesses, listCustomers, listProducts } from "../controllers/business.controller.js";

// const router = Router();

// router.get("/", isAuthenticated, listBusinesses);
// router.get("/:businessId/customers", isAuthenticated, listCustomers);
// router.get("/:businessId/products", isAuthenticated, listProducts);

// export default router;


import { Router } from "express";
import isAuthenticated from "../middleware/auth.middleware.js";
import { listBusinesses, listCustomers, listProducts, listSalesTaxes } from "../controllers/business.controller.js";

const router = Router();

router.get("/", isAuthenticated, listBusinesses);
router.get("/:businessId/customers", isAuthenticated, listCustomers);
router.get("/:businessId/products", isAuthenticated, listProducts);
router.get("/:businessId/taxes", isAuthenticated, listSalesTaxes); // NEW

export default router;