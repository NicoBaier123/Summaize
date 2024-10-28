const express = require("express");
const router = express.Router();

module.exports = (db) => {
  const logOperation = (operation, details) => {
    console.log(`${new Date().toISOString()} - ${operation}:`, details);
  };

  /**
   * PUT /cards/:id
   * Updates the content of a specific flashcard
   * Used by EditCardView.vue component
   */
  router.put("/cards/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { front_content, back_content } = req.body;
      logOperation("Updating card", { id });

      const result = await db.run(
        `UPDATE cards
         SET front_content = ?,
             back_content = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [front_content, back_content, id],
      );

      if (result.changes === 0) {
        return res.status(404).json({ error: "Card not found" });
      }

      const updatedCard = await db.get("SELECT * FROM cards WHERE id = ?", [
        id,
      ]);
      logOperation("Successfully updated card", { id });
      res.json(updatedCard);
    } catch (error) {
      logOperation("Error updating card", error.message);
      res
        .status(500)
        .json({ error: "Failed to update card", details: error.message });
    }
  });

  /**
   * POST /card-sets/:setId/cards
   * Creates a new flashcard in a specific card set
   */
  router.post("/card-sets/:setId/cards", async (req, res) => {
    try {
      const { setId } = req.params;
      const { front_content, back_content } = req.body;
      logOperation("Creating new card", { setId });

      const result = await db.run(
        `INSERT INTO cards (card_set_id, front_content, back_content)
         VALUES (?, ?, ?)`,
        [setId, front_content, back_content],
      );

      const newCard = await db.get("SELECT * FROM cards WHERE id = ?", [
        result.lastID,
      ]);
      logOperation("Successfully created card", { id: result.lastID });
      res.status(201).json(newCard);
    } catch (error) {
      logOperation("Error creating card", error.message);
      res
        .status(500)
        .json({ error: "Failed to create card", details: error.message });
    }
  });

  /**
   * DELETE /cards/:id
   * Deletes a specific flashcard
   */
  router.delete("/cards/:id", async (req, res) => {
    try {
      const { id } = req.params;
      logOperation("Deleting card", { id });

      const result = await db.run("DELETE FROM cards WHERE id = ?", [id]);

      if (result.changes === 0) {
        return res.status(404).json({ error: "Card not found" });
      }

      logOperation("Successfully deleted card", { id });
      res.status(204).send();
    } catch (error) {
      logOperation("Error deleting card", error.message);
      res
        .status(500)
        .json({ error: "Failed to delete card", details: error.message });
    }
  });

  return router;
};
