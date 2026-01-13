import { Schema, model } from "mongoose";

const orderSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: [{
            productId: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            price: {
                type: Number,
                required: true,
            }
        }],
        totalAmount: {
            type: Number,
            required: true,
        },
        shippingAddress: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "placed", "confirmed", "shipped", "delivered", "cancelled"],
            default: "placed",
        }
    },
    {timestamps: true}
);

const Order = model("Order", orderSchema);
export default Order;