const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

async function initializeDatabase() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  // Führen Sie die Initialisierungen in einer Transaktion aus
  await db.exec('BEGIN TRANSACTION');

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

    // Kartensets-Tabelle
    await db.exec(`
      CREATE TABLE IF NOT EXISTS card_sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT NOT NULL,
        preview_image_url TEXT,
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

    // Commit der Transaktion
    await db.exec('COMMIT');
    console.log('Datenbankinitialisierung erfolgreich abgeschlossen');
  } catch (error) {
    // Bei einem Fehler: Rollback der Transaktion
    await db.exec('ROLLBACK');
    console.error('Fehler bei der Datenbankinitialisierung:', error);
    throw error;
  }

  return db;
}

module.exports = initializeDatabase;