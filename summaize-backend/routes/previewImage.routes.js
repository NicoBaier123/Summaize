const express = require("express");
const router = express.Router();
const sharp = require("sharp");

module.exports = (db) => {
  const logOperation = (operation, details) => {
    console.log(`${new Date().toISOString()} - ${operation}:`, details);
  };

  const optimizeImage = async (imageBuffer) => {
    return sharp(imageBuffer)
      .resize(800, 600, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toBuffer();
  };

  /**
   * POST /card-sets/:setId/preview-image
   * Uploads and processes a new preview image for a card set
   */
  router.post("/card-sets/:setId/preview-image", async (req, res) => {
    const upload = req.upload.single("image");

    upload(req, res, async (err) => {
      if (err) {
        logOperation("Upload error", err.message);
        return res.status(400).json({ error: "Fehler beim Upload" });
      }

      try {
        const setId = req.params.setId;
        logOperation("Processing image upload", { setId });

        const optimizedImageBuffer = await optimizeImage(req.file.buffer);

        await req.db.run(
          `UPDATE card_sets
           SET preview_image_blob = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [optimizedImageBuffer, setId],
        );

        logOperation("Successfully uploaded image", { setId });
        res.json({
          message: "Bild erfolgreich hochgeladen",
          preview_image_blob: `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`,
          updated: true,
        });
      } catch (error) {
        logOperation("Error saving image", error.message);
        res.status(500).json({
          error: "Fehler beim Speichern des Bildes",
          details: error.message,
        });
      }
    });
  });

  /**
   * GET /card-sets/:setId/preview-image
   * Retrieves the preview image for a specific card set
   */
  router.get("/card-sets/:setId/preview-image", async (req, res) => {
    try {
      const setId = req.params.setId;
      logOperation("Fetching preview image", { setId });

      const result = await req.db.get(
        `SELECT preview_image_blob 
         FROM card_sets 
         WHERE id = ?`,
        [setId],
      );

      if (!result?.preview_image_blob) {
        return res.status(404).json({ error: "Kein Vorschaubild gefunden" });
      }

      res.json({
        preview_image_blob: `data:image/jpeg;base64,${Buffer.from(result.preview_image_blob).toString("base64")}`,
      });
    } catch (error) {
      logOperation("Error fetching image", error.message);
      res.status(500).json({
        error: "Fehler beim Abrufen des Bildes",
        details: error.message,
      });
    }
  });

  /**
   * DELETE /card-sets/:setId/preview-image
   * Removes the preview image from a card set
   */
  router.delete("/card-sets/:setId/preview-image", async (req, res) => {
    try {
      const setId = req.params.setId;
      logOperation("Deleting preview image", { setId });

      const result = await req.db.run(
        `UPDATE card_sets
         SET preview_image_blob = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [setId],
      );

      if (result.changes === 0) {
        return res.status(404).json({ error: "Kartenset nicht gefunden" });
      }

      logOperation("Successfully deleted preview image", { setId });
      res.json({
        message: "Bild erfolgreich gelöscht",
        updated: true,
      });
    } catch (error) {
      logOperation("Error deleting image", error.message);
      res.status(500).json({
        error: "Fehler beim Löschen des Bildes",
        details: error.message,
      });
    }
  });

  /**
   * PUT /card-sets/:setId/preview-image
   * Updates the preview image for a card set
   */
  router.put("/card-sets/:setId/preview-image", async (req, res) => {
    const upload = req.upload.single("image");

    upload(req, res, async (err) => {
      if (err) {
        logOperation("Upload error", err.message);
        return res.status(400).json({ error: "Fehler beim Upload" });
      }

      try {
        const setId = req.params.setId;
        logOperation("Updating preview image", { setId });

        const existingSet = await req.db.get(
          "SELECT id FROM card_sets WHERE id = ?",
          [setId],
        );

        if (!existingSet) {
          return res.status(404).json({ error: "Kartenset nicht gefunden" });
        }

        const optimizedImageBuffer = await optimizeImage(req.file.buffer);

        await req.db.run(
          `UPDATE card_sets
           SET preview_image_blob = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [optimizedImageBuffer, setId],
        );

        logOperation("Successfully updated preview image", { setId });
        res.json({
          message: "Bild erfolgreich aktualisiert",
          preview_image_blob: `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`,
          updated: true,
        });
      } catch (error) {
        logOperation("Error updating image", error.message);
        res.status(500).json({
          error: "Fehler beim Aktualisieren des Bildes",
          details: error.message,
        });
      }
    });
  });

  return router;
};
