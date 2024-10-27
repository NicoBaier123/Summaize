const express = require("express");
const cardSetRoutes = require("./cardSet.routes");
const cardRoutes = require("./card.routes");
const previewImageRoutes = require("./previewImage.routes");

function initializeRoutes(db) {
  const router = express.Router();

  // Log alle eingehenden Requests
  router.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // Kartenset und User-bezogene Routen
  router.use("/", cardSetRoutes(db));

  // Karten-bezogene Routen
  router.use("/", cardRoutes(db));

  // Vorschaubild-bezogene Routen
  router.use("/", previewImageRoutes(db));

  // Error-Handler für nicht gefundene Routen
  router.use((req, res) => {
    console.log(
      `${new Date().toISOString()} - Route not found: ${req.method} ${req.path}`,
    );
    res.status(404).json({
      error: "Route not found",
      path: req.path,
      method: req.method,
    });
  });

  // Globaler Error-Handler
  router.use((err, req, res, next) => {
    console.error(`${new Date().toISOString()} - Error:`, err);
    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error",
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}

module.exports = initializeRoutes;
