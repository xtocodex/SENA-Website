const express = require('express');
const router = express.Router();
const versionService = require('../services/versionService');

// GET /app-version
router.get('/', async (req, res) => {
  try {
    const version = await versionService.getAppVersion();
    res.json(version);
  } catch (err) {
    console.error('GET /app-version error:', err);
    res.status(500).json({ error: 'Failed to fetch app version' });
  }
});

module.exports = router;
