const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET /api/memory/search - Accessible to authenticated users, filtered dynamically by role
router.get('/search', authMiddleware, async (req, res) => {
  const query = req.query.q || '';
  const category = req.query.category || 'All';
  const role = req.user.role; // Active M1 user role extracted from auth headers

  try {
    const results = await db.searchMemory(query, category, role);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'FTS search query failed', message: err.message });
  }
});

module.exports = router;
