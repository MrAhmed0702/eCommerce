import Order from "./order.model.js";
import Cart from "../cart/cart.model.js";
import Product from "../product/product.model.js";
import mongoose from "mongoose";

const placeOrder = async (req, res) => {
  try {
    // get user id from req.user.id and shipping address from req.body
    const userId = req.user.id;
    const { shippingAddress } = req.body;

    // fetch cart
    let cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    // validate stock
    for (let item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          message: "Product not found",
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product ${product._id}`,
        });
      }
    }

    // calculate total amount from cart items
    let totalAmount = cart.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    // Create Order
    let order = new Order({
      userId,
      items: cart.items,
      totalAmount,
      shippingAddress,
      status: "placed",
    });

    await order.save();

    // Update Stock of products
    for (let item of cart.items) {
      const product = await Product.findById(item.productId);
      product.stock -= item.quantity;
      await product.save();
    }

    // Clear Cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    // Send Response to Client
    return res.status(200).json({
      message: "Order placed successfully",
      orderId: order._id,
      totalAmount,
      shippingAddress,
      status: "placed",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Cannot place the order",
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId });
    return res.status(200).json({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Cannot fetch orders",
    });
  }
};

const getSingleOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        message: "Invalid order id",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.userId.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    return res.status(200).json({
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Cannot fetch your order",
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { id: orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const isOwner = order.userId.toString() === userId;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "Unauthorized to cancel this order",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        message: "Order is already cancelled",
      });
    }

    if (order.status === "shipped" || order.status === "delivered") {
      return res.status(400).json({
        message: "Order cannot be cancelled after shipping",
      });
    }

    for (const item of order.items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        continue;
      }

      product.stock += item.quantity;
      await product.save();
    }

    order.status = "cancelled";
    await order.save();

    return res.status(200).json({
      message: "Order cancelled successfully",
      orderId: order._id,
      status: order.status,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Cannot cancel your order",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id:orderId } = req.params;
    const { status: newStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const allowedStatuses = [
      "placed",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if(!allowedStatuses.includes(newStatus)){
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const currentStatus = order.status;

     const allowedTransitions = {
      placed: ["confirmed", "cancelled"],
      confirmed: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: [],
      cancelled: [],
    };

    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      return res.status(400).json({
        message: `Cannot change order status from ${currentStatus} to ${newStatus}`,
      });
    }

    order.status = newStatus;
    await order.save();

    return res.status(200).json({
      message: "Order status updated successfully",
      orderId: order._id,
      status: order.status,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Cannot update order status",
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    return res.status(200).json({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Cannot fetch orders",
    });
  }
};

export {
  placeOrder,
  getMyOrders,
  getSingleOrder,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
};
