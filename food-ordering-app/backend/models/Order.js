const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  eatery: { type: mongoose.Schema.Types.ObjectId, ref: "Eatery", required: true },
  orderItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "OrderItem" }], // Array of order items
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ["pending", "preparing", "out_for_delivery", "delivered", "completed", "cancelled"], 
    default: "pending" },// add
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);