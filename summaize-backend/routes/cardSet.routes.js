const express = require("express");
const router = express.Router();

module.exports = (db) => {
  const logOperation = (operation, details) => {
    console.log(`${new Date().toISOString()} - ${operation}:`, details);
  };

  /**
   * GET /users/:userId/card-sets
   * Retrieves all card sets for a specific user, ordered by creation date
   */
  router.get("/users/:userId/card-sets", async (req, res) => {
    try {
      const userId = req.params.userId;
      logOperation("Fetching card sets for user", userId);

      const cardSets = await db.all(
        `SELECT * FROM card_sets
         WHERE user_id = ?
         ORDER BY created_at DESC`,
        [userId],
      );

      const processedCardSets = cardSets.map((set) => ({
        ...set,
        preview_image_blob: set.preview_image_blob
          ? `data:image/jpeg;base64,${Buffer.from(set.preview_image_blob).toString("base64")}`
          : null,
      }));

      logOperation("Successfully retrieved card sets", {
        count: processedCardSets.length,
      });
      res.json(processedCardSets);
    } catch (error) {
      logOperation("Error fetching card sets", error.message);
      res
        .status(500)
        .json({ error: "Failed to fetch card sets", details: error.message });
    }
  });

  /**
   * GET /users/:userId/card-sets/:setId
   * Retrieves a specific card set and its associated cards
   */
  router.get("/users/:userId/card-sets/:setId", async (req, res) => {
    try {
      const { userId, setId } = req.params;
      logOperation("Fetching specific card set", { userId, setId });

      const results = await db.all(
        `SELECT
          cs.id AS set_id,
          cs.title AS set_title,
          cs.preview_image_blob,
          c.id AS card_id,
          c.front_content,
          c.back_content
         FROM card_sets cs
         LEFT JOIN cards c ON cs.id = c.card_set_id
         WHERE cs.id = ? AND cs.user_id = ?`,
        [setId, userId],
      );

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

      logOperation("Successfully retrieved card set", { setId });
      res.json(cardSet);
    } catch (error) {
      logOperation("Error fetching card set", error.message);
      res
        .status(500)
        .json({ error: "Failed to fetch card set", details: error.message });
    }
  });

  /**
   * POST /users/:userId/card-sets
   * Creates a new card set for a user
   */
  router.post("/users/:userId/card-sets", async (req, res) => {
    try {
      const { userId } = req.params;
      const { title } = req.body;
      logOperation("Creating new card set", { userId, title });

      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      await db.run("BEGIN TRANSACTION");

      const result = await db.run(
        `INSERT INTO card_sets (user_id, title, preview_image_blob, created_at, updated_at)
         VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [userId, title, null],
      );

      if (!result.lastID) {
        await db.run("ROLLBACK");
        throw new Error("Failed to create card set");
      }

      const newSet = await db.get("SELECT * FROM card_sets WHERE id = ?", [
        result.lastID,
      ]);
      await db.run("COMMIT");

      logOperation("Successfully created card set", { id: result.lastID });
      res.status(201).json(newSet);
    } catch (error) {
      await db.run("ROLLBACK");
      logOperation("Error creating card set", error.message);
      res
        .status(500)
        .json({ error: "Failed to create card set", details: error.message });
    }
  });

  /**
   * PUT /users/:userId/card-sets/:id
   * Updates the title of a specific card set
   */
  router.put("/users/:userId/card-sets/:id", async (req, res) => {
    try {
      const { userId, id } = req.params;
      const { title } = req.body;
      logOperation("Updating card set", { userId, id, title });

      if (!title || typeof title !== "string") {
        return res
          .status(400)
          .json({ error: "Title is required and must be a string" });
      }

      const existingSet = await db.get(
        "SELECT * FROM card_sets WHERE id = ? AND user_id = ?",
        [id, userId],
      );

      if (!existingSet) {
        return res
          .status(404)
          .json({ error: "Card set not found or access denied" });
      }

      await db.run(
        `UPDATE card_sets 
         SET title = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND user_id = ?`,
        [title.trim(), id, userId],
      );

      const updatedSet = await db.get(
        "SELECT * FROM card_sets WHERE id = ? AND user_id = ?",
        [id, userId],
      );

      logOperation("Successfully updated card set", { id });
      res.json(updatedSet);
    } catch (error) {
      logOperation("Error updating card set", error.message);
      res
        .status(500)
        .json({ error: "Failed to update card set", details: error.message });
    }
  });

  /**
   * DELETE /users/:userId/card-sets/:setId
   * Deletes a specific card set and all its associated cards
   */
  router.delete("/users/:userId/card-sets/:setId", async (req, res) => {
    try {
      const { userId, setId } = req.params;
      logOperation("Deleting card set", { userId, setId });

      const existingSet = await db.get(
        "SELECT * FROM card_sets WHERE id = ? AND user_id = ?",
        [setId, userId],
      );

      if (!existingSet) {
        return res
          .status(404)
          .json({ error: "Card set not found or access denied" });
      }

      await db.run("BEGIN TRANSACTION");
      await db.run("DELETE FROM cards WHERE card_set_id = ?", [setId]);
      await db.run("DELETE FROM card_sets WHERE id = ? AND user_id = ?", [
        setId,
        userId,
      ]);
      await db.run("COMMIT");

      logOperation("Successfully deleted card set", { setId });
      res.status(204).send();
    } catch (error) {
      await db.run("ROLLBACK");
      logOperation("Error deleting card set", error.message);
      res
        .status(500)
        .json({ error: "Failed to delete card set", details: error.message });
    }
  });

  return router;
};
