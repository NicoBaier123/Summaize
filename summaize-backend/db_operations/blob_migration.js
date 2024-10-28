// migrations/add-image-blob.js
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

async function migrateDatabase() {
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

  console.log("Starting database migration...");

  try {
    await db.exec("BEGIN TRANSACTION");

    // 1. Füge neue Spalte hinzu
    console.log("Adding preview_image_blob column...");
    await db.exec(`
      ALTER TABLE card_sets 
      ADD COLUMN preview_image_blob BLOB
    `);

    // 2. Optional: Migriere existierende Bilddaten
    console.log("Migrating existing image data...");
    const sets = await db.all(`
      SELECT id, preview_image_url 
      FROM card_sets 
      WHERE preview_image_url IS NOT NULL
    `);

    for (const set of sets) {
      try {
        if (set.preview_image_url && set.preview_image_url.startsWith("http")) {
          const response = await fetch(set.preview_image_url);
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          await db.run(
            `
            UPDATE card_sets 
            SET preview_image_blob = ?
            WHERE id = ?
          `,
            [buffer, set.id],
          );
        }
      } catch (error) {
        console.warn(`Failed to migrate image for set ${set.id}:`, error);
      }
    }

    // 3. Entferne alte Spalte
    console.log("Removing old preview_image_url column...");
    await db.exec(`
      CREATE TABLE card_sets_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT NOT NULL,
        preview_image_blob BLOB,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      INSERT INTO card_sets_new 
      SELECT id, user_id, title, preview_image_blob, created_at, updated_at
      FROM card_sets;

      DROP TABLE card_sets;
      ALTER TABLE card_sets_new RENAME TO card_sets;
    `);

    // 4. Erstelle Index neu
    console.log("Recreating indices...");
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_card_sets_user_id 
      ON card_sets(user_id)
    `);

    await db.exec("COMMIT");
    console.log("Migration completed successfully!");
  } catch (error) {
    await db.exec("ROLLBACK");
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await db.close();
  }
}

// Führe Migration aus
migrateDatabase().catch(console.error);
