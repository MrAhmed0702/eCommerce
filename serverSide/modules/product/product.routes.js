import express from "express";
const router = express.Router();
import { verifyToken } from "../../middleware/auth.middleware.js";
import authorize from "../../middleware/rbac.middleware.js";
import {
    createProduct,
    getAllProduct,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    searchProduct,
} from "./product.controller.js";

router.post("/products", verifyToken, authorize("admin", "seller"), createProduct);

router.get("/products", getAllProduct);

router.get("/products/:id", getSingleProduct);

router.put("/products/:id", verifyToken, authorize("admin", "seller"), updateProduct);

router.delete("/products/:id", verifyToken, authorize("admin"), deleteProduct);

router.get("/products/search", searchProduct);

export default router;