
const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String }, 
    price: { type: Number, required: true },
    eatery: { 
        // eateryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Eatery', required: true },  // Reference to the Eatery model
        eateryId: { type: String, required: true  },
        eateryName: { type: String, required: true }
    },
    ingredients: [{ type: String, required: true }],
    cuisineType: { 
        type: String, 
        required: true, 
        enum: ["Pakistani", "Chinese", "Italian", "Fast Food", "Healthy", "Dessert"]
    },
    dietaryPreferences: [{ 
        type: String, 
        enum: ["Vegan", "Vegetarian", "Gluten-Free", "Keto"] 
    }],
    allergens: [{ 
        type: String, 
        enum: ["Dairy", "Eggs", "Gluten", "Nuts", "Seafood", "Peanuts"]
    }]
}, { timestamps: true }); 

module.exports = mongoose.models.MenuItem || mongoose.model("MenuItem", menuItemSchema);
