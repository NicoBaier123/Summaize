const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // Alle Kartensets eines Benutzers abrufen
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

      // Konvertiere BLOB zu Base64 wenn vorhanden
      const processedCardSets = cardSets.map((set) => ({
        ...set,
        preview_image_blob: set.preview_image_blob
          ? `data:image/jpeg;base64,${Buffer.from(set.preview_image_blob).toString("base64")}`
          : null,
      }));

      console.log(
        `${new Date().toISOString()} - Query result:`,
        JSON.stringify(processedCardSets, null, 2),
      );
      res.json(processedCardSets);
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

  // Spezifisches Kartenset und seine Karten abrufen
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
          cs.preview_image_blob,
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
        preview_image_blob: results[0].preview_image_blob
          ? `data:image/jpeg;base64,${Buffer.from(results[0].preview_image_blob).toString("base64")}`
          : null,
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

  // Kartenset erstellen
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
        INSERT INTO card_sets (user_id, title, preview_image_blob, created_at, updated_at)
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

  // Kartenset-Titel aktualisieren
  router.put("/users/:userId/card-sets/:id", async (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - Update request received`);
    console.log("Parameters:", req.params);
    console.log("Body:", req.body);

    try {
      const { userId, id } = req.params;
      const { title } = req.body;

      if (!title || typeof title !== "string") {
        console.log(`${timestamp} - Invalid title:`, title);
        return res.status(400).json({
          error: "Title is required and must be a string",
          received: title,
        });
      }

      if (!db || typeof db.get !== "function") {
        throw new Error("Database connection not properly initialized");
      }

      const existingSet = await db.get(
        "SELECT * FROM card_sets WHERE id = ? AND user_id = ?",
        [id, userId],
      );

      if (!existingSet) {
        console.log(`${timestamp} - Set not found:`, { id, userId });
        return res.status(404).json({
          error: "Card set not found or access denied",
          details: { id, userId },
        });
      }

      console.log(`${timestamp} - Updating title to:`, title.trim());
      const updateResult = await db.run(
        `UPDATE card_sets 
         SET title = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND user_id = ?`,
        [title.trim(), id, userId],
      );

      console.log(`${timestamp} - Update result:`, updateResult);

      if (updateResult.changes === 0) {
        throw new Error("Update operation did not affect any rows");
      }

      const updatedSet = await db.get(
        "SELECT * FROM card_sets WHERE id = ? AND user_id = ?",
        [id, userId],
      );

      if (!updatedSet) {
        throw new Error("Failed to retrieve updated set");
      }

      console.log(`${timestamp} - Successfully updated set:`, updatedSet);
      res.json(updatedSet);
    } catch (error) {
      console.error(`${timestamp} - Error:`, error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message,
        timestamp,
      });
    }
  });

  // Kartenset löschen
  router.delete("/users/:userId/card-sets/:setId", async (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`[DEBUG] ${timestamp} - Delete request received`);
    console.log("[DEBUG] Parameters:", {
      userId: req.params.userId,
      setId: req.params.setId,
    });

    try {
      const { userId, setId } = req.params;

      console.log("[DEBUG] Checking if set exists:", {
        query: "SELECT * FROM card_sets WHERE id = ? AND user_id = ?",
        params: [setId, userId],
      });

      const existingSet = await db.get(
        "SELECT * FROM card_sets WHERE id = ? AND user_id = ?",
        [setId, userId],
      );

      console.log("[DEBUG] Existing set query result:", existingSet);

      if (!existingSet) {
        console.log("[DEBUG] Set not found or unauthorized");
        return res.status(404).json({
          error: "Card set not found or access denied",
          details: { setId, userId },
        });
      }

      console.log("[DEBUG] Starting transaction");
      await db.run("BEGIN TRANSACTION");

      try {
        console.log("[DEBUG] Deleting cards");
        const deleteCardsResult = await db.run(
          "DELETE FROM cards WHERE card_set_id = ?",
          [setId],
        );
        console.log("[DEBUG] Cards deletion result:", deleteCardsResult);

        console.log("[DEBUG] Deleting set");
        const deleteSetResult = await db.run(
          "DELETE FROM card_sets WHERE id = ? AND user_id = ?",
          [setId, userId],
        );
        console.log("[DEBUG] Set deletion result:", deleteSetResult);

        console.log("[DEBUG] Committing transaction");
        await db.run("COMMIT");

        console.log("[DEBUG] Deletion successful");
        return res.status(204).send();
      } catch (error) {
        console.error("[DEBUG] Error during deletion:", error);
        await db.run("ROLLBACK");
        throw error;
      }
    } catch (error) {
      console.error("[DEBUG] Error in delete route:", error);
      if (!res.headersSent) {
        res.status(500).json({
          error: "Internal server error",
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    }
  });

  return router;
};
