const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // Route zum Abrufen aller Kartensets eines Benutzers
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
      res
        .status(500)
        .json({
          error: "An error occurred while fetching card sets",
          details: error.message,
        });
    }
  });

  return router;
};
