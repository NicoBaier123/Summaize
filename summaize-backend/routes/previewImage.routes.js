const express = require("express");
const router = express.Router();

module.exports = (db) => {
  // Vorschaubild hochladen
  router.post(
    "/card-sets/:setId/preview-image/preview-image",
    async (req, res) => {
      const timestamp = new Date().toISOString();
      console.log(
        `${timestamp} - Processing image upload for set ${req.params.setId}`,
      );

      const upload = req.upload.single("image");

      upload(req, res, async (err) => {
        if (err) {
          console.error(`${timestamp} - Upload error:`, err);
          return res.status(400).json({ error: "Fehler beim Upload" });
        }

        try {
          const setId = req.params.setId;
          const imageBuffer = req.file.buffer;

          // Bildoptimierung mit sharp
          const sharp = require("sharp");
          const optimizedImageBuffer = await sharp(imageBuffer)
            .resize(800, 600, {
              fit: "inside",
              withoutEnlargement: true,
            })
            .jpeg({ quality: 80 })
            .toBuffer();

          console.log(`${timestamp} - Image optimized, saving to database`);

          // Speichere das Bild in der Datenbank
          await req.db.run(
            `UPDATE card_sets
           SET preview_image_blob = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
            [optimizedImageBuffer, setId],
          );

          console.log(`${timestamp} - Image saved successfully`);

          // Sende das optimierte Bild zurück
          res.json({
            message: "Bild erfolgreich hochgeladen",
            preview_image_blob: `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`,
            updated: true,
          });
        } catch (error) {
          console.error(`${timestamp} - Error saving image:`, error);
          res.status(500).json({
            error: "Fehler beim Speichern des Bildes",
            details: error.message,
          });
        }
      });
    },
  );

  // Vorschaubild abrufen
  router.get(
    "/card-sets/:setId/preview-image/preview-image",
    async (req, res) => {
      const timestamp = new Date().toISOString();
      console.log(
        `${timestamp} - Fetching preview image for set ${req.params.setId}`,
      );

      try {
        const setId = req.params.setId;
        const result = await req.db.get(
          `SELECT preview_image_blob 
         FROM card_sets 
         WHERE id = ?`,
          [setId],
        );

        if (!result?.preview_image_blob) {
          console.log(`${timestamp} - No preview image found for set ${setId}`);
          return res.status(404).json({ error: "Kein Vorschaubild gefunden" });
        }

        res.json({
          preview_image_blob: `data:image/jpeg;base64,${Buffer.from(result.preview_image_blob).toString("base64")}`,
        });
      } catch (error) {
        console.error(`${timestamp} - Error fetching image:`, error);
        res.status(500).json({
          error: "Fehler beim Abrufen des Bildes",
          details: error.message,
        });
      }
    },
  );

  // Vorschaubild löschen
  router.delete(
    "/card-sets/:setId/preview-image/preview-image",
    async (req, res) => {
      const timestamp = new Date().toISOString();
      console.log(
        `${timestamp} - Deleting preview image for set ${req.params.setId}`,
      );

      try {
        const setId = req.params.setId;

        const result = await req.db.run(
          `UPDATE card_sets
         SET preview_image_blob = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
          [setId],
        );

        if (result.changes === 0) {
          console.log(`${timestamp} - No set found with ID ${setId}`);
          return res.status(404).json({ error: "Kartenset nicht gefunden" });
        }

        console.log(`${timestamp} - Preview image deleted successfully`);
        res.json({
          message: "Bild erfolgreich gelöscht",
          updated: true,
        });
      } catch (error) {
        console.error(`${timestamp} - Error deleting image:`, error);
        res
          .status(500)
          .json({
            error: "Fehler beim Löschen des Bildes",
            details: error.message,
          });
      }
    },
  );

  // Vorschaubild aktualisieren
  router.put(
    "/card-sets/:setId/preview-image/preview-image",
    async (req, res) => {
      const timestamp = new Date().toISOString();
      console.log(
        `${timestamp} - Updating preview image for set ${req.params.setId}`,
      );

      const upload = req.upload.single("image");

      upload(req, res, async (err) => {
        if (err) {
          console.error(`${timestamp} - Upload error:`, err);
          return res.status(400).json({ error: "Fehler beim Upload" });
        }

        try {
          const setId = req.params.setId;

          // Prüfe ob das Set existiert
          const existingSet = await req.db.get(
            "SELECT id FROM card_sets WHERE id = ?",
            [setId],
          );

          if (!existingSet) {
            return res.status(404).json({ error: "Kartenset nicht gefunden" });
          }

          const imageBuffer = req.file.buffer;

          // Bildoptimierung mit sharp
          const sharp = require("sharp");
          const optimizedImageBuffer = await sharp(imageBuffer)
            .resize(800, 600, {
              fit: "inside",
              withoutEnlargement: true,
            })
            .jpeg({ quality: 80 })
            .toBuffer();

          console.log(`${timestamp} - Image optimized, updating in database`);

          await req.db.run(
            `UPDATE card_sets
           SET preview_image_blob = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
            [optimizedImageBuffer, setId],
          );

          console.log(`${timestamp} - Image updated successfully`);

          res.json({
            message: "Bild erfolgreich aktualisiert",
            preview_image_blob: `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`,
            updated: true,
          });
        } catch (error) {
          console.error(`${timestamp} - Error updating image:`, error);
          res.status(500).json({
            error: "Fehler beim Aktualisieren des Bildes",
            details: error.message,
          });
        }
      });
    },
  );

  return router;
};
