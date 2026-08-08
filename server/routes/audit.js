const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// GET /api/audit-logs - Accessible to Admin, Chairman, and Advisors
router.get('/', authMiddleware, authorizeRoles('Admin', 'Chairman', 'Advisor'), async (req, res) => {
  try {
    const logs = await db.getAuditLogs();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Database query failed', message: err.message });
  }
});

module.exports = router;
