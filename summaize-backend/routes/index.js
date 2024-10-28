const express = require("express");
const cardSetRoutes = require("./cardSet.routes");
const cardRoutes = require("./card.routes");
const previewImageRoutes = require("./previewImage.routes");

const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const auth = require("auto-load")("routes/auth");

// Generate node secret key for jwt
const jwt_secret = crypto.createSecretKey(crypto.randomBytes(32));

// Middleware function to verify JWT
const verifyToken = (req, res, next) => {
  if (req.path === "/auth/login" || req.path === "/auth/register") {
    next(); // Skip token verification for login and register
    return;
  }
  try {
    const token = req.cookies.token; // Access the token from the cookie

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    jwt.verify(token, jwt_secret, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Failed to authenticate token" });
      }

      req.userId = decoded.userId;
      next();
    });
  } catch (error) {
    console.error(
      `${new Date().toISOString()} - Error verifying token:`,
      error,
    );
    res.status(500).json({
      error: "An error occurred while verifying token",
      details: error.message,
    });
  }
};

function initializeRoutes(db) {
  const router = express.Router();
  const logOperation = (operation, details) => {
    console.log(`${new Date().toISOString()} - ${operation}:`, details);
  };

  // Log incoming requests
  router.use((req, res, next) => {
    logOperation("Incoming request", { method: req.method, path: req.path });
    next();
  });

  // Make verifyToken run before every request
  router.use(verifyToken);

  // Mount route handlers
  router.use("/", cardSetRoutes(db)); // Card set and user routes
  router.use("/", cardRoutes(db)); // Card management routes
  router.use("/", previewImageRoutes(db)); // Preview image routes

  // POST route for user login
  router.post("/auth/login", async (req, res) => {
    console.log("got here");
    auth.login(req, res, db, jwt, jwt_secret);
  });

  // POST route for user registration
  router.post("/auth/register", async (req, res) => {
    auth.register(req, res, db);
  });

  // Handle 404 errors
  router.use((req, res) => {
    logOperation("Route not found", { method: req.method, path: req.path });
    res.status(404).json({
      error: "Route not found",
      path: req.path,
      method: req.method,
    });
  });

  // Global error handler
  router.use((err, req, res, next) => {
    logOperation("Error occurred", {
      path: req.path,
      method: req.method,
      error: err.message,
    });

    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error",
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}

module.exports = initializeRoutes;
