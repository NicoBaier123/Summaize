const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // Bestehende Route zum Abrufen aller Kartensets eines Benutzers
  router.get("/users/:userId/card-sets", async (req, res) => {
    console.log(
      `${new Date().toISOString()} - Fetching card sets for user ${req.params.userId}`,
    );
    try {
      const userId = req.params.userId;
      const query = `
        SELECT * FROM card_sets
        WHERE user_id = ?
        ORDER BY created_at DESC
      `;
      console.log(`${new Date().toISOString()} - Executing query: ${query}`);
      const cardSets = await db.all(query, [userId]);
      console.log(
        `${new Date().toISOString()} - Query result:`,
        JSON.stringify(cardSets, null, 2),
      );
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
      const results = await db.all(query, [setId, userId]);
      if (results.length === 0) {
        return res
          .status(404)
          .json({ error: "Card set not found or unauthorized access" });
      }
      const cardSet = {
        id: results[0].set_id,
        title: results[0].set_title,
        preview_image_url: results[0].preview_image_url,
        cards: results
          .filter((row) => row.card_id)
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

  // Neue Route zum Aktualisieren einer Karte
  router.put("/cards/:id", async (req, res) => {
    console.log(`${new Date().toISOString()} - Updating card ${req.params.id}`);
    try {
      const { id } = req.params;
      const { front_content, back_content } = req.body;

      const query = `
        UPDATE cards 
        SET front_content = ?, 
            back_content = ?, 
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      console.log(`${new Date().toISOString()} - Executing query: ${query}`);

      const result = await db.run(query, [front_content, back_content, id]);

      if (result.changes === 0) {
        return res.status(404).json({ error: "Card not found" });
      }

      const updatedCard = await db.get("SELECT * FROM cards WHERE id = ?", [
        id,
      ]);

      console.log(
        `${new Date().toISOString()} - Updated card:`,
        JSON.stringify(updatedCard, null, 2),
      );

      res.json(updatedCard);
    } catch (error) {
      console.error(
        `${new Date().toISOString()} - Error updating card:`,
        error,
      );
      res.status(500).json({
        error: "An error occurred while updating the card",
        details: error.message,
      });
    }
  });

  // Neue Route zum Erstellen einer Karte
  router.post("/card-sets/:setId/cards", async (req, res) => {
    console.log(
      `${new Date().toISOString()} - Creating new card for set ${req.params.setId}`,
    );
    try {
      const { setId } = req.params;
      const { front_content, back_content } = req.body;

      const query = `
        INSERT INTO cards (card_set_id, front_content, back_content) 
        VALUES (?, ?, ?)
      `;
      console.log(`${new Date().toISOString()} - Executing query: ${query}`);

      const result = await db.run(query, [setId, front_content, back_content]);

      const newCard = await db.get("SELECT * FROM cards WHERE id = ?", [
        result.lastID,
      ]);

      console.log(
        `${new Date().toISOString()} - Created new card:`,
        JSON.stringify(newCard, null, 2),
      );

      res.status(201).json(newCard);
    } catch (error) {
      console.error(
        `${new Date().toISOString()} - Error creating card:`,
        error,
      );
      res.status(500).json({
        error: "An error occurred while creating the card",
        details: error.message,
      });
    }
  });

  // Neue Route zum Löschen einer Karte
  router.delete("/cards/:id", async (req, res) => {
    console.log(`${new Date().toISOString()} - Deleting card ${req.params.id}`);
    try {
      const { id } = req.params;

      const query = "DELETE FROM cards WHERE id = ?";
      console.log(`${new Date().toISOString()} - Executing query: ${query}`);

      const result = await db.run(query, [id]);

      if (result.changes === 0) {
        return res.status(404).json({ error: "Card not found" });
      }

      console.log(
        `${new Date().toISOString()} - Successfully deleted card ${id}`,
      );

      res.status(204).send();
    } catch (error) {
      console.error(
        `${new Date().toISOString()} - Error deleting card:`,
        error,
      );
      res.status(500).json({
        error: "An error occurred while deleting the card",
        details: error.message,
      });
    }
  });

  // Neue Route zum Erstellen eines Kartensets
  router.post("/users/:userId/card-sets", async (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(
      `${timestamp} - Creating new card set for user ${req.params.userId}`,
    );
    console.log(`${timestamp} - Request body:`, req.body);

    try {
      const { userId } = req.params;
      const { title } = req.body;

      if (!title) {
        console.log(`${timestamp} - Missing title in request`);
        return res.status(400).json({ error: "Title is required" });
      }

      // Begin transaction
      await db.run("BEGIN TRANSACTION");

      const insertQuery = `
        INSERT INTO card_sets (user_id, title, preview_image_url, created_at, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;

      console.log(`${timestamp} - Executing insert query`);
      const result = await db.run(insertQuery, [userId, title, null]);

      if (!result.lastID) {
        await db.run("ROLLBACK");
        throw new Error("Failed to get lastID from insert");
      }

      const selectQuery = `
        SELECT * FROM card_sets WHERE id = ?
      `;

      console.log(`${timestamp} - Fetching newly created set`);
      const newSet = await db.get(selectQuery, [result.lastID]);

      if (!newSet) {
        await db.run("ROLLBACK");
        throw new Error("Failed to fetch created set");
      }

      await db.run("COMMIT");

      console.log(`${timestamp} - Successfully created new set:`, newSet);
      res.status(201).json(newSet);
    } catch (error) {
      await db.run("ROLLBACK");
      console.error(`${timestamp} - Error creating card set:`, error);
      res.status(500).json({
        error: "An error occurred while creating the card set",
        details: error.message,
      });
    }
  });

  router.put("/users/:userId/card-sets/:id", async (req, res) => {
    const { userId, id } = req.params;
    const { title, user_id } = req.body;

    console.log("Update request received:", {
      params: { userId, id },
      body: { title, user_id },
    });

    try {
      // Eingabevalidierung
      if (!title) {
        console.log("Title validation failed");
        return res.status(400).json({
          error: "Title is required",
          details: "The title field cannot be empty",
        });
      }

      if (!id || !userId) {
        console.log("ID validation failed");
        return res.status(400).json({
          error: "Invalid parameters",
          details: "Both userId and card set ID are required",
        });
      }

      // Überprüfen Sie, ob das Set existiert
      const existingSet = await db.get(
        "SELECT * FROM card_sets WHERE id = ? AND user_id = ?",
        [id, userId],
      );

      console.log("Existing set:", existingSet);

      if (!existingSet) {
        console.log("Card set not found:", { id, userId });
        return res.status(404).json({
          error: "Card set not found",
          details:
            "The requested card set does not exist or you don't have access",
        });
      }

      // Aktualisieren Sie den Titel
      await db.run(
        `UPDATE card_sets 
         SET title = ?, 
             updated_at = DATETIME('now')
         WHERE id = ? AND user_id = ?`,
        [title, id, userId],
      );

      // Holen Sie das aktualisierte Set
      const updatedSet = await db.get(
        `SELECT id, title, user_id, created_at, updated_at 
         FROM card_sets 
         WHERE id = ?`,
        [id],
      );

      console.log("Updated set:", updatedSet);

      if (!updatedSet) {
        throw new Error("Failed to fetch updated card set");
      }

      res.json(updatedSet);
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({
        error: "Database error",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  });

  return router;
};
