const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
    quantity: { type: Number, required: true },
    subtotalPrice: { type: Number, required: true }
});

module.exports = mongoose.model("OrderItem", orderItemSchema);