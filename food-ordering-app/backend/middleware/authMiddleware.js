const jwt = require("jsonwebtoken");

// Middleware to authenticate users using JWT
const authMiddleware = (req, res, next) => {
    try {
        // Get the token from the request headers
        const token = req.header("Authorization");
        if (!token) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }

        // Ensure the token is in the correct format (Bearer <token>)
        if (!token.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Invalid token format. Use 'Bearer <token>'" });
        }

        // Extract the actual token after "Bearer "
        const actualToken = token.split(" ")[1];

        // Verify the token
        const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);

        // Attach user details to the request object
        req.user = decoded;
        next(); // Move to the next middleware or route handler
    } catch (err) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
};

module.exports = authMiddleware;

