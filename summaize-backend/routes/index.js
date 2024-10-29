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
  if (
    req.path === "/auth/login" ||
    req.path === "/auth/register" ||
    req.path === "/auth/logout"
  ) {
    next(); // Skip token verification for auth routes
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
  router.use("/", cardSetRoutes(db));
  router.use("/", cardRoutes(db));
  router.use("/", previewImageRoutes(db));

  // Auth routes
  router.post("/auth/login", (req, res) => {
    auth.login(req, res, db, jwt, jwt_secret);
  });

  router.post("/auth/register", (req, res) => {
    auth.register(req, res, db);
  });

  router.post("/auth/logout", (req, res) => {
    auth.logout(req, res);
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
