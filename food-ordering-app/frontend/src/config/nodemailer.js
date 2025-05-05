const nodemailer = require("nodemailer"); 
require("dotenv").config(); 

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
    service: "gmail", // Use Gmail as the email service
    auth: {
        user: process.env.GMAIL_EMAIL, // Your Gmail address (from .env)
        pass: process.env.GMAIL_PASSWORD, // Your Gmail app password (from .env)
    }
});

module.exports = transporter;
