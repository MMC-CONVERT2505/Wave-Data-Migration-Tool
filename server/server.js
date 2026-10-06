import express from "express";
import dotenv from "dotenv";
import corsMiddleware from "./src/middleware/cors.middleware.js";
import sessionMiddleware from "./src/middleware/session.middleware.js";
import authRoutes from "./src/routes/auth.routes.js";
import businessRoutes from "./src/routes/business.routes.js";
import invoiceRoutes from "./src/routes/invoice.routes.js";
import paymentRoutes from "./src/routes/payment.routes.js";
import exportRoutes from "./src/routes/export.routes.js";
import { handleCallback } from "./src/controllers/auth.controller.js";

dotenv.config();

const app = express();

// Production me Nginx / load balancer ke peeche HTTPS cookies sahi kaam karein
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

app.use(express.json());
app.use(corsMiddleware);
app.use(sessionMiddleware);

app.use("/auth", authRoutes);
// server.js mein directly
app.get("/callback", handleCallback);
app.use("/api/businesses", businessRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);  // NEW
app.use("/api/export", exportRoutes);  // NEW — data extraction module

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));