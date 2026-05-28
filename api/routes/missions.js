const express = require('express');
const router = express.Router();
const missionService = require('../services/missionService');
const { requireApiKey } = require('../middleware/auth');

// GET /missions/daily
router.get('/daily', async (req, res) => {
  try {
    const missions = await missionService.getDailyMissions();
    res.json(missions);
  } catch (err) {
    console.error('GET /daily error:', err);
    res.status(500).json({ error: 'Failed to fetch daily missions' });
  }
});

// GET /missions/weekly
router.get('/weekly', async (req, res) => {
  try {
    const missions = await missionService.getWeeklyMissions();
    res.json(missions);
  } catch (err) {
    console.error('GET /weekly error:', err);
    res.status(500).json({ error: 'Failed to fetch weekly missions' });
  }
});

// POST /missions
router.post('/', requireApiKey, async (req, res) => {
  try {
    const { id, type, description, rewards, value, active } = req.body;
    if (!id || !type || !description || !rewards || value === undefined) {
      return res.status(400).json({ error: 'Missing required fields: id, type, description, rewards, value' });
    }
    if (!['daily', 'weekly'].includes(type)) {
      return res.status(400).json({ error: 'type must be "daily" or "weekly"' });
    }
    const result = await missionService.createMission({
      id, type, description, rewards, value, active: active ?? true,
    });
    res.status(201).json(result);
  } catch (err) {
    console.error('POST /missions error:', err);
    res.status(500).json({ error: 'Failed to create mission' });
  }
});

// PUT /missions/:docId
router.put('/:docId', requireApiKey, async (req, res) => {
  try {
    await missionService.updateMission(req.params.docId, req.body);
    res.json({ success: true });
  } catch (err) {
    console.error('PUT /missions/:docId error:', err);
    res.status(500).json({ error: 'Failed to update mission' });
  }
});

// DELETE /missions/:docId
router.delete('/:docId', requireApiKey, async (req, res) => {
  try {
    await missionService.deleteMission(req.params.docId);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /missions/:docId error:', err);
    res.status(500).json({ error: 'Failed to delete mission' });
  }
});

module.exports = router;
