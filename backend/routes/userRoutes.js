const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Eatery = require("../models/Eatery");
const bcrypt = require("bcrypt");
const authMiddleware = require("../middleware/authMiddleware");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Register a new user (Signup)
router.post("/signup", async (req, res) => {
    try {
        let { name, email, password, phoneNumber, role } = req.body;
        email = email.toLowerCase().trim(); 

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({ name, email, passwordHash: hashedPassword, role, phoneNumber });
        await user.save();

        
        if (role === 'owner') {
            const eatery = new Eatery({
                name: `${name}`, // placeholder name
                location: 'Not provided', // default value, update later if needed
                contactInfo: phoneNumber,
                owner: user._id, // Link to newly created user
                phoneNumber,
                averageRating: 0,
                totalRatings: 0,
                ratingsBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            });
            await eatery.save();

            // Push eatery ID to user's eateries array
            user.eateries.push(eatery._id);
            await user.save(); // update user
        
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(201).json({ message: "User created successfully", token, userId: user._id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login user
router.post("/login", async (req, res) => {
    try {
        let { email, password } = req.body;
        email = email.toLowerCase().trim();

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ message: "Login successful", token, userId: user._id });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Forgot Password - Generate Reset Token
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ error: "User not found" });

        // Generate a secure token
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetToken = resetToken;
        await user.save();

        // In a real app, send email (for now, log to console)
        console.log(`Password reset link: http://localhost:5173/reset-password/${resetToken}`);

        res.json({ message: "Password reset link sent" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reset Password - Update New Password
router.post("/reset-password/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({ resetToken: token });

        if (!user) return res.status(400).json({ error: "Invalid or expired token" });

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(password, salt);
        user.resetToken = null; // Clear token after reset
        await user.save();

        res.json({ message: "Password reset successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Get all users (Protected: Only Admins)
router.get("/", authMiddleware, async (req, res) => {
    try {
        // Check if the requesting user has the "admin" role
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied" }); 
        }

        // Fetch all users from the database, selecting specific fields to return
        const users = await User.find().select("name email role phoneNumber createdAt");

        // Send the list of users as a response
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get user by ID (Protected: Only the user themselves or an admin can access)
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        // Check if the requesting user is either the same user as the one being requested or an admin
        if (req.user.userId !== req.params.id && req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied" }); 
        }

        // Fetch user data from the database based on the provided user ID
        const user = await User.findById(req.params.id).select("name email role phoneNumber createdAt");

        // If the user does not exist, return a 404 Not Found error
        if (!user) return res.status(404).json({ message: "User not found" });

        // Send the retrieved user data as a response
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update user (Protected: Only the user themselves can update their profile)
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        // Ensure the user is only updating their own profile
        if (req.user.userId !== req.params.id) {
            return res.status(403).json({ error: "Access denied" }); // 403 Forbidden
        }

        const { password, oldPassword, role, ...updateData } = req.body;

        // Prevent role modification (users should not be able to change their role)
        if (role) {
            return res.status(400).json({ error: "Cannot change user role" });
        }

        // If password update is requested, verify the old password first
        if (password) {
            const user = await User.findById(req.params.id);

            // Check if oldPassword is provided
            if (!oldPassword) {
                return res.status(400).json({ error: "Old password is required" });
            }

            // Compare old password with stored hash
            const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
            if (!isMatch) {
                return res.status(400).json({ error: "Old password is incorrect" });
            }

            // Hash the new password
            const salt = await bcrypt.genSalt(10);
            updateData.passwordHash = await bcrypt.hash(password, salt);
        }

        // Update the user in the database and return the updated user details (excluding password)
        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true })
                                      .select("name email role phoneNumber createdAt");

        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete user (Protected: Users can delete their own accounts, Admins can delete anyone)
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        // Allow only the user themselves or an admin to delete the account
        if (req.user.userId !== req.params.id && req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied" }); // 403 Forbidden
        }

        // If the request is from a user (not an admin), require password confirmation
        if (req.user.userId === req.params.id) {
            const { password } = req.body;
            if (!password) return res.status(400).json({ error: "Password is required to delete account" });

            const user = await User.findById(req.params.id);
            if (!user) return res.status(404).json({ error: "User not found" });

            const isMatch = await bcrypt.compare(password, user.passwordHash);
            if (!isMatch) return res.status(400).json({ error: "Incorrect password" });
        }

        // Delete the user from the database
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Account deleted successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/update-password", async (req, res) => {
    try {
        let { email, password } = req.body;

        // Convert email to lowercase and trim spaces
        email = email.toLowerCase().trim();

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: "Email and new password are required." });
        }

        // Check password strength
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long." });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update user's password in the database
        user.passwordHash = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully!" });

    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ error: "Internal server error. Please try again later." });
    }
});

module.exports = router;
