const express = require("express");
const cardSetRoutes = require("./cardSet.routes");
const cardRoutes = require("./card.routes");
const previewImageRoutes = require("./previewImage.routes");

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

  // Mount route handlers
  router.use("/", cardSetRoutes(db)); // Card set and user routes
  router.use("/", cardRoutes(db)); // Card management routes
  router.use("/", previewImageRoutes(db)); // Preview image routes

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
