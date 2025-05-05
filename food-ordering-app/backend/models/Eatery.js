const mongoose = require("mongoose");

const eaterySchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    contactInfo: { type: String },
    openingHours: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    phoneNumber: { type: String },
    image: {
        data: Buffer,
        contentType: String 
    },
    
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    ratingsBreakdown: {
        1: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        5: { type: Number, default: 0 }
    }
});

module.exports = mongoose.model("Eatery", eaterySchema);



// const mongoose = require("mongoose");

// const eaterySchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     location: { type: String, required: true },
//     contactInfo: { type: String },
//     openingHours: { type: String },
//     owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     phoneNumber: { type: String },
    
//     image: {
//         data: Buffer,
//         contentType: String 
//     }
// });

// module.exports = mongoose.model("Eatery", eaterySchema);
