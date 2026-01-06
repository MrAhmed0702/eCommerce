import express from "express";
import dotenv from "dotenv";
import userRoutes from "./modules/user/user.routes.js";
import connectDB from "./config/db.js";
import productRoutes from "./modules/product/product.routes.js";

dotenv.config();

const app = express();

// Connect DB
connectDB();

// Middlewares
app.use(express.json());

// Routes
app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running" });
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(
    `Server is running at http://localhost:${process.env.PORT}`
  );
});
