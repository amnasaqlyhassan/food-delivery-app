const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    eatery: { type: mongoose.Schema.Types.ObjectId, ref: "Eatery", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    reviewText: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Review", reviewSchema);
