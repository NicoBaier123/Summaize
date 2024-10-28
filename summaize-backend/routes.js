const express = require("express");
const router = express.Router();

const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// Generate node secret key for jwt
const jwt_secret = crypto.createSecretKey(crypto.randomBytes(32));

// API Subsystems
const auth = require("auto-load")("./api/auth");

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

// Make verifyToken run before every request
router.use(verifyToken);

module.exports = (db) => {
  // Bestehende Route zum Abrufen aller Kartensets eines Benutzers
  router.get("/users/:userId/card-sets", async (req, res) => {
    console.log(
      `${new Date().toISOString()} - Fetching card sets for user ${req.params.userId}`,
    );
    try {
      const userId = req.params.userId;

      // SQL-Abfrage, um alle Kartensets für einen bestimmten Benutzer zu erhalten
      const query = `
        SELECT * FROM card_sets
        WHERE user_id = ?
        ORDER BY created_at DESC
      `;

      console.log(`${new Date().toISOString()} - Executing query: ${query}`);

      // Ausführen der Abfrage
      const cardSets = await db.all(query, [userId]);

      console.log(
        `${new Date().toISOString()} - Query result:`,
        JSON.stringify(cardSets, null, 2),
      );

      // Senden der Ergebnisse als JSON
      res.json(cardSets);
    } catch (error) {
      console.error(
        `${new Date().toISOString()} - Error fetching card sets:`,
        error,
      );
      res.status(500).json({
        error: "An error occurred while fetching card sets",
        details: error.message,
      });
    }
  });

  // Aktualisierte Route zum Abrufen eines spezifischen Kartensets und seiner Karten
  router.get("/users/:userId/card-sets/:setId", async (req, res) => {
    console.log(
      `${new Date().toISOString()} - Fetching card set ${req.params.setId} for user ${req.params.userId}`,
    );
    try {
      const { userId, setId } = req.params;

      // SQL-Abfrage, um das Kartenset und seine Karten zu erhalten, mit Überprüfung der userId
      const query = `
        SELECT
          cs.id AS set_id,
          cs.title AS set_title,
          cs.preview_image_url,
          c.id AS card_id,
          c.front_content,
          c.back_content
        FROM card_sets cs
        LEFT JOIN cards c ON cs.id = c.card_set_id
        WHERE cs.id = ? AND cs.user_id = ?
      `;

      console.log(`${new Date().toISOString()} - Executing query: ${query}`);

      // Ausführen der Abfrage
      const results = await db.all(query, [setId, userId]);

      if (results.length === 0) {
        return res
          .status(404)
          .json({ error: "Card set not found or unauthorized access" });
      }

      // Strukturieren der Ergebnisse
      const cardSet = {
        id: results[0].set_id,
        title: results[0].set_title,
        preview_image_url: results[0].preview_image_url,
        cards: results
          .filter((row) => row.card_id) // Filtere Zeilen ohne Karten
          .map((row) => ({
            id: row.card_id,
            front_content: row.front_content,
            back_content: row.back_content,
          })),
      };

      console.log(
        `${new Date().toISOString()} - Query result:`,
        JSON.stringify(cardSet, null, 2),
      );

      // Senden der Ergebnisse als JSON
      res.json(cardSet);
    } catch (error) {
      console.error(
        `${new Date().toISOString()} - Error fetching card set:`,
        error,
      );
      res.status(500).json({
        error: "An error occurred while fetching the card set",
        details: error.message,
      });
    }
  });

  // POST route for user login
  router.post("/auth/login", async (req, res) => {
    auth.login(req, res, db, jwt, jwt_secret);
  });

  // POST route for user registration
  router.post("/auth/register", async (req, res) => {
    auth.register(req, res, db);
  });
  return router;
};
