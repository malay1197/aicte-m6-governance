const express = require('express');
const cors = require('cors');
const db = require('./db');
const { authMiddleware, authorizeRoles } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Import Modular Routers
const auditRouter = require('./routes/audit');
const attendanceRouter = require('./routes/attendance');
const reportsRouter = require('./routes/reports');
const memoryRouter = require('./routes/memory');
const webhooksRouter = require('./routes/webhooks');
const aiRouter = require('./routes/ai');
const meetingsRouter = require('./routes/meetings');

// Mount Webhooks first (no auth checks to simulate external system inputs)
app.use('/api/webhooks', webhooksRouter);

// Mount Audited Core Routers (enforcing M1 RBAC validation middleware)
app.use('/api/audit-logs', auditRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/memory', memoryRouter);
app.use('/api/ai', aiRouter);
app.use('/api/meetings', meetingsRouter);

// --- Direct Alerts & Notifications Routes (With Auth Middleware) ---

// GET /api/notifications - Accessible to all logged-in governance roles
app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const list = await db.getNotifications();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Database fetch failed', message: err.message });
  }
});

// PATCH /api/notifications/:id/read
app.patch('/api/notifications/:id/read', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await db.markNotificationRead(id);
    if (updated) {
      res.json({ success: true, notification: updated });
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Update failed', message: err.message });
  }
});

// GET /api/security-events - SOC monitoring panel (accessible to Admin/Chairman)
app.get('/api/security-events', authMiddleware, authorizeRoles('Admin', 'Chairman'), async (req, res) => {
  try {
    const events = await db.getSecurityEvents();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Database query failed', message: err.message });
  }
});

// PATCH /api/security-events/:id/resolve
app.patch('/api/security-events/:id/resolve', authMiddleware, authorizeRoles('Admin', 'Chairman'), async (req, res) => {
  const { id } = req.params;
  try {
    const resolved = await db.updateSecurityEvent(id, 'Resolved');
    if (resolved) {
      // Append an audit trail log
      await db.addAuditLog({
        user: req.user.username,
        action: 'Security Event Resolved',
        module: 'Audit (M6)',
        ip: req.ip || '127.0.0.1',
        status: 'Success',
        severity: 'INFO',
        details: `Compliance officer resolved incident ID: ${id}. Removed quarantine block.`
      });
      res.json({ success: true, event: resolved });
    } else {
      res.status(404).json({ error: 'Security incident not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Update failed', message: err.message });
  }
});

// Boot Setup & Connect Database
db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`M6 secure governance service is running on port ${PORT}`);
  });

  // Clean up orphaned active attendance sessions (e.g., if a user crashed/disconnected)
  setInterval(async () => {
    try {
      await db.sweepOrphanedSessions();
    } catch (err) {
      console.error('Failed to sweep active sessions:', err);
    }
  }, 30000);
});
