import productModel from "./product.model.js";
import { createToken } from "../../middleware/auth.middleware.js";
import xss from "xss";
import mongoose from "mongoose";

const createProduct = async (req, res) => {
    try {
        const {name, description, costPrice, salePrice, category, stock, images} = req.body;

        if(!name || !description || !costPrice || !salePrice || !category || !stock){
            return res.status(400).json({
                message: "All fields are required"
            })
        }

        const sanitizedProduct = {
            name: xss(name),
            description: xss(description),
            costPrice,
            salePrice,
            category,
            stock,
            images
        }

        const product = await productModel.create(sanitizedProduct);

        res.status(201).json({
            message: "Product created successfully",
            product
        });

    } catch (error) {
        res.status(500).json({
            message: `Failed to create product and the error is ${error.message}`
        })
    }
}

const getAllProduct = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
}

const getSingleProduct = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
}

const updateProduct = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
}

const deleteProduct = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
}

const searchProduct = async (req, res) => {
    try {
        
    } catch (error) {
        
    }
}

export { createProduct, getAllProduct, getSingleProduct, updateProduct, deleteProduct, searchProduct };