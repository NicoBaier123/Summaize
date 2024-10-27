const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // Karte aktualisieren
  // wird in der EditCardView.vue-Komponente aufgerufen
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

  // Karte erstellen
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

  // Karte löschen
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

  return router;
};
