// db.js
const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

async function initializeDatabase() {
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

  // Führen Sie die Initialisierungen in einer Transaktion aus
  await db.exec("BEGIN TRANSACTION");

  try {
    // Benutzer-Tabelle
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Kartensets-Tabelle mit BLOB für Bilder
    await db.exec(`
      CREATE TABLE IF NOT EXISTS card_sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT NOT NULL,
        preview_image_blob BLOB,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Karten-Tabelle
    await db.exec(`
      CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_set_id INTEGER,
        front_content TEXT,
        back_content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (card_set_id) REFERENCES card_sets(id)
      )
    `);

    // Indizes für schnellere Abfragen
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_card_sets_user_id ON card_sets(user_id);
      CREATE INDEX IF NOT EXISTS idx_cards_card_set_id ON cards(card_set_id);
    `);

    await db.exec("COMMIT");
    console.log("Datenbankinitialisierung erfolgreich abgeschlossen");
  } catch (error) {
    await db.exec("ROLLBACK");
    console.error("Fehler bei der Datenbankinitialisierung:", error);
    throw error;
  }

  return db;
}

// Hilfsfunktionen für Bildoperationen
async function saveImageToDatabase(db, cardSetId, imageBuffer) {
  try {
    await db.run(
      `
      UPDATE card_sets 
      SET preview_image_blob = ?, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `,
      [imageBuffer, cardSetId],
    );

    return true;
  } catch (error) {
    console.error("Error saving image:", error);
    return false;
  }
}

async function getImageFromDatabase(db, cardSetId) {
  try {
    const result = await db.get(
      `
      SELECT preview_image_blob 
      FROM card_sets 
      WHERE id = ?
    `,
      [cardSetId],
    );

    return result?.preview_image_blob || null;
  } catch (error) {
    console.error("Error getting image:", error);
    return null;
  }
}

module.exports = {
  initializeDatabase,
  saveImageToDatabase,
  getImageFromDatabase,
};
