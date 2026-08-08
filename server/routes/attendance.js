const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// GET /api/attendance - Accessible to Admin, Chairman, CIO, Advisor, and Evaluator
router.get('/', authMiddleware, authorizeRoles('Admin', 'Chairman', 'CIO', 'Advisor', 'Evaluator'), async (req, res) => {
  try {
    const meetings = await db.getAttendance();
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: 'Database query failed', message: err.message });
  }
});

module.exports = router;
