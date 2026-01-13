import express from "express";
import { cancelOrder, placeOrder, updateOrderStatus, getMyOrders, getSingleOrder, getAllOrders } from "./order.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import authorize from "../../middleware/rbac.middleware.js";

const router = express.Router();

router.post("/orders", verifyToken, placeOrder);
router.get("/orders/myorders", verifyToken, getMyOrders);
router.get("/orders/:id", verifyToken, getSingleOrder);
router.put("/orders/:id/cancel", verifyToken, cancelOrder);
router.get("/orders", verifyToken, authorize("admin"), getAllOrders);
router.put("/orders/:id/status", verifyToken, authorize("admin"), updateOrderStatus);

export default router;