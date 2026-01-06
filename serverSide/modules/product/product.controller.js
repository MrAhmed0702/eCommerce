import productModel from "./product.model.js";
import xss from "xss";
import mongoose from "mongoose";

const createProduct = async (req, res) => {
  try {
    const { name, description, costPrice, salePrice, category, stock, images } =
      req.body;

    if (
      !name ||
      !description ||
      costPrice === undefined ||
      salePrice === undefined ||
      !category ||
      stock === undefined
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (salePrice < costPrice) {
      return res.status(400).json({
        message: "Sale price cannot be less than cost price",
      });
    }

    const productData = {
      name: xss(name),
      description: xss(description),
      costPrice,
      salePrice,
      category: xss(category),
      stock,
      images: images || [],
      sellerId: req.user.id,
    };

    const product = await productModel.create(productData);

    res.status(201).json({
      message: "Product created successfully",
      product: {
        id: product._id,
        name: product.name,
        salePrice: product.salePrice,
        category: product.category,
        stock: product.stock,
        sellerId: product.sellerId,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: `Failed to create product`,
    });
  }
};

const getAllProduct = async (req, res) => {
  try {
    const products = await productModel.find();

    res.status(200).json({
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: `Failed to fetch all products}`,
    });
  }
};

const getSingleProduct = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Product ID",
      });
    }

    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: `Failed to fetch the product`,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Product ID",
      });
    }

    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({
        message: `Product Not Found`,
      });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = product.sellerId.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        message: `Unauthorized`,
      });
    }

    const { name, description, costPrice, salePrice, category, stock, images } =
      req.body;

    if (
      costPrice !== undefined &&
      salePrice !== undefined &&
      salePrice < costPrice
    ) {
      return res.status(400).json({
        message: "Sale price cannot be less than cost price",
      });
    }

    if (name) {
      product.name = xss(name);
    }

    if (description) {
      product.description = xss(description);
    }

    if (costPrice !== undefined) {
      product.costPrice = costPrice;
    }

    if (salePrice !== undefined) {
      product.salePrice = salePrice;
    }

    if (category) {
      product.category = xss(category);
    }

    if (stock !== undefined) {
      product.stock = stock;
    }

    if (images) {
      product.images = images;
    }

    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product: {
        id: product._id,
        name: product.name,
        salePrice: product.salePrice,
        category: product.category,
        stock: product.stock,
        sellerId: product.sellerId,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: `Failed to update product`,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: `Product ID is invalid`,
      });
    }

    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({
        message: `Product Not Found`,
      });
    }

    await product.deleteOne();

    res.status(200).json({
      message: `Product deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      message: `Failed to delete product`,
    });
  }
};

const searchProduct = async (req, res) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.salePrice = {};
      if (minPrice) {
        query.salePrice.$gte = Number(minPrice);
      }
      if (maxPrice) {
        query.salePrice.$lte = Number(maxPrice);
      }
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 50);
    const skip = (pageNumber - 1) * limitNumber;

    const products = await productModel
      .find(query)
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    const totalProducts = await productModel.countDocuments(query);

    res.status(200).json({
      message: "Products fetched successfully",
      totalProducts,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts / limitNumber),
      products,
    });

  } catch (error) {
    res.status(500).json({
      message: `Failed to search product`,
    });
  }
};

export {
  createProduct,
  getAllProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  searchProduct,
};