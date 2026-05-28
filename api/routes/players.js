const express = require('express');
const router = express.Router();
const playerService = require('../services/playerService');
const { requireApiKey } = require('../middleware/auth');

// GET /players
router.get('/', requireApiKey, async (req, res) => {
  try {
    const players = await playerService.listPlayers();
    res.json(players);
  } catch (err) {
    console.error('GET /players error:', err);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// GET /players/:id
router.get('/:id', requireApiKey, async (req, res) => {
  try {
    const player = await playerService.getPlayer(req.params.id);
    res.json(player);
  } catch (err) {
    if (err.message === 'Player not found') {
      return res.status(404).json({ error: 'Player not found' });
    }
    console.error('GET /players/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

// POST /players
router.post('/', requireApiKey, async (req, res) => {
  try {
    const player = await playerService.createPlayer(req.body);
    res.status(201).json(player);
  } catch (err) {
    console.error('POST /players error:', err);
    res.status(500).json({ error: 'Failed to create player' });
  }
});

// PATCH /players/:id
router.patch('/:id', requireApiKey, async (req, res) => {
  try {
    const player = await playerService.updatePlayer(req.params.id, req.body);
    res.json(player);
  } catch (err) {
    console.error('PATCH /players/:id error:', err);
    res.status(500).json({ error: 'Failed to update player' });
  }
});

// DELETE /players/:id
router.delete('/:id', requireApiKey, async (req, res) => {
  try {
    const result = await playerService.deletePlayer(req.params.id);
    res.json(result);
  } catch (err) {
    console.error('DELETE /players/:id error:', err);
    res.status(500).json({ error: 'Failed to delete player' });
  }
});

module.exports = router;
