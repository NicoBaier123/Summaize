const initializeDatabase = require('./db.js'); // Pfad anpassen

async function insertTestData() {
  const db = await initializeDatabase();

  try {
    await db.exec('BEGIN TRANSACTION');

    // Testbenutzer einfügen
    await db.run(`
      INSERT INTO users (username, email, password_hash)
      VALUES ('max_mustermann', 'max@example.com', 'hashed_password_here')
    `);

    const userId = await db.get('SELECT last_insert_rowid() as id');

    // Testkartenset einfügen
    await db.run(`
      INSERT INTO card_sets (user_id, title, preview_image_url)
      VALUES (?, 'Deutsche Städte', '/api/placeholder/300/200')
    `, userId.id);

    const cardSetId = await db.get('SELECT last_insert_rowid() as id');

    // Testkarten einfügen
    const cards = [
      ['Hauptstadt von Deutschland', 'Berlin'],
      ['Größte Stadt im Ruhrgebiet', 'Dortmund'],
      ['Stadt der Fugger', 'Augsburg']
    ];

    for (const [front, back] of cards) {
      await db.run(`
        INSERT INTO cards (card_set_id, front_content, back_content)
        VALUES (?, ?, ?)
      `, cardSetId.id, front, back);
    }

    await db.exec('COMMIT');
    console.log('Testdaten erfolgreich eingefügt');
  } catch (error) {
    await db.exec('ROLLBACK');
    console.error('Fehler beim Einfügen der Testdaten:', error);
  } finally {
    await db.close();
  }
}

insertTestData().catch(console.error);