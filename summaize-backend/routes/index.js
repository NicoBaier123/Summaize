const express = require("express");
const cardSetRoutes = require("./cardSet.routes");
const cardRoutes = require("./card.routes");

function initializeRoutes(db) {
  const router = express.Router();

  // Alle Routen einbinden
  router.use("/", cardSetRoutes(db)); // Enthält auch user-bezogene card-set Routen
  router.use("/", cardRoutes(db)); // Alle card-bezogenen Routen

  return router;
}

module.exports = initializeRoutes;
