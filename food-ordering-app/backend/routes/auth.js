const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const transporter = require("../config/nodemailer");
require("dotenv").config();

// Request password reset - Generates token and sends email
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        // Check if the user exists
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        // Generate a secure reset token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Hash the token before saving it to the database
        const hashedToken = await bcrypt.hash(resetToken, 10);

        // Set reset token and expiry time (1 hour)
        user.resetToken = hashedToken;
        user.resetTokenExpiry = Date.now() + parseInt(process.env.RESET_TOKEN_EXPIRY);
        await user.save();

        // Construct the password reset link
        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}&email=${user.email}`;

        // Send password reset email
        await transporter.sendMail({
            from: process.env.GMAIL_EMAIL,
            to: user.email,
            subject: "Password Reset Request",
            html: `<p>Hello ${user.name},</p>
                   <p>You requested a password reset. Click the link below to reset your password:</p>
                   <a href="${resetLink}">Reset Password</a>
                   <p>If you did not request this, please ignore this email.</p>`
        });

        res.json({ message: "Password reset email sent successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Reset password - Verifies token and updates password
router.post("/reset-password", async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;

        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        // Check if user exists
        const user = await User.findOne({ email: normalizedEmail });
        if (!user || !user.resetToken || !user.resetTokenExpiry) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }

        // Check if the token has expired
        if (Date.now() > user.resetTokenExpiry) {
            return res.status(400).json({ error: "Reset token has expired" });
        }

        // Compare the token with the stored hashed token
        const isMatch = await bcrypt.compare(token, user.resetToken);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid token" });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);

        // Clear the reset token fields
        user.resetToken = null;
        user.resetTokenExpiry = null;

        await user.save();

        res.json({ message: "Password reset successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
