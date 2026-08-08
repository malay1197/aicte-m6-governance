const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// GET /api/reports - Accessible to Admin, Chairman, and CIO
router.get('/', authMiddleware, authorizeRoles('Admin', 'Chairman', 'CIO'), async (req, res) => {
  try {
    const reports = await db.getReports();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Database query failed', message: err.message });
  }
});

// POST /api/reports/generate - Accessible to Admin, Chairman, and CIO
router.post('/generate', authMiddleware, authorizeRoles('Admin', 'Chairman', 'CIO'), async (req, res) => {
  const { type, meetingId, dateRange } = req.body;
  
  if (!type) {
    return res.status(400).json({ error: 'Validation Error', message: 'Report type is required' });
  }

  try {
    // 1. Simulate blockchain payload hash commit
    const blockchainHash = '0x8a92fbcd9a928ef782bcf9287cba1192e8bf77a8';

    const newReport = {
      id: `REP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      type,
      timestamp: new Date().toISOString(),
      hash: blockchainHash
    };

    // 2. Commit to database
    await db.addReport(newReport);

    // 3. Commit action into audit logs table
    await db.addAuditLog({
      user: req.user.username,
      action: "Report Generated",
      module: "Reports (M6)",
      ip: req.ip || '127.0.0.1',
      status: "Success",
      severity: "INFO",
      details: `Generated compliance report type: '${type}' for meeting reference: '${meetingId || 'All'}'. Hash committed to blockchain.`
    });

    res.status(201).json(newReport);
  } catch (err) {
    res.status(500).json({ error: 'Failed to compile report', message: err.message });
  }
});

module.exports = router;
