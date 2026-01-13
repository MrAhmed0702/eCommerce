import express from "express";
const router = express.Router();

import { verifyToken } from "../../middleware/auth.middleware.js";
import {
  addToCart,
  deleteProductFromCart,
  fetchCart,
} from "../controllers/cart.controller.js";

router.post("/cart", verifyToken, addToCart);
router.get("/cart", verifyToken, fetchCart);
router.delete("/cart/:productId", verifyToken, deleteProductFromCart);

export default router;
