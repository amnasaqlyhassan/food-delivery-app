const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//     name: { type: String, required: true, trim: true },

//     email: {
//         type: String,
//         required: true,
//         unique: true,
//         lowercase: true,
//         trim: true,
//         match: [/.+\@.+\..+/, "Invalid email format"]  
//         // match: [/^[a-zA-Z0-9._%+-]+@lums\.edu\.pk$/, "Only LUMS email addresses are allowed"] // -added

//     },

//     passwordHash: { type: String, required: true },

//     role: {
//         type: String,
//         enum: ["customer", "owner", "admin"], // Admin added
//         default: "customer", // Users cannot sign up as admin
//         required: true
//     },

//     phoneNumber: {
//         type: String,
//         match: [/^\d{10,15}$/, "Invalid phone number"],
//         required: false
//     },

//     isVerified: { type: Boolean, default: false },
//     resetTokenExpires: { type: Date, default: null },  // Expiration time - added 
//     createdAt: { type: Date, default: Date.now }
// });

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+\@.+\..+/, "Invalid email format"]
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "owner", "admin"],
      default: "customer",
      required: true
    },
    phoneNumber: {
      type: String,
      match: [/^\d{10,15}$/, "Invalid phone number"],
      required: false
    },
    isVerified: { type: Boolean, default: false },
    resetTokenExpires: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  
    // 🆕 Only owners will use this field
    eateries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Eatery"
      }
    ]
  });
  
    module.exports = mongoose.model("User", userSchema);