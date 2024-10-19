const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // GET all card sets
  router.get('/card-sets', async (req, res) => {
    try {
      const cardSets = await db.all('SELECT * FROM card_sets ORDER BY updated_at DESC');
      res.json(cardSets);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET a specific card set with its cards
  router.get('/card-sets/:id', async (req, res) => {
    try {
      const cardSet = await db.get('SELECT * FROM card_sets WHERE id = ?', req.params.id);
      if (!cardSet) {
        return res.status(404).json({ error: 'Card set not found' });
      }
      const cards = await db.all('SELECT * FROM cards WHERE card_set_id = ?', req.params.id);
      res.json({ ...cardSet, cards });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST a new card set
  router.post('/card-sets', async (req, res) => {
    const { title, preview_image_url } = req.body;
    try {
      const result = await db.run(
        'INSERT INTO card_sets (title, preview_image_url) VALUES (?, ?)',
        [title, preview_image_url]
      );
      res.status(201).json({ id: result.lastID, title, preview_image_url });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};