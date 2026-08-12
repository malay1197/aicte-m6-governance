const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

// 1. POST /api/meetings/:meetingId/join
router.post('/:meetingId/join', authMiddleware, async (req, res) => {
  const { meetingId } = req.params;
  const userId = req.user.username;

  try {
    const isAllowed = await db.isUserAllowedInMeeting(meetingId, userId);
    if (!isAllowed) {
      return res.status(403).json({ 
        error: 'Forbidden Access', 
        message: 'M6 Secure Gatekeeper: You are not authorized to participate in this meeting room.' 
      });
    }

    // Return unique Jitsi room name
    res.json({
      success: true,
      roomName: `AICTE-Sec-Governance-Room-${meetingId}`,
      displayName: `${userId} (${req.user.role})`
    });

  } catch (err) {
    res.status(500).json({ error: 'Verification failed', message: err.message });
  }
});

// 2. POST /api/meetings/:meetingId/attendance/start
router.post('/:meetingId/attendance/start', authMiddleware, async (req, res) => {
  const { meetingId } = req.params;
  const { userId, name, email, jitsiRoomName } = req.body;

  // Prevent one user from submitting attendance for another user
  if (req.user.username !== userId && req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden Access', message: 'Cannot start attendance session for another user identity.' });
  }

  try {
    const session = await db.startAttendanceSession(meetingId, userId, name, email, jitsiRoomName);
    res.json({ success: true, sessionId: session.sessionId || session.session_id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record join event', message: err.message });
  }
});

// 3. POST /api/meetings/:meetingId/attendance/heartbeat
router.post('/:meetingId/attendance/heartbeat', authMiddleware, async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Validation Error', message: 'sessionId is required' });
  }

  try {
    await db.heartbeatAttendanceSession(sessionId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record heartbeat', message: err.message });
  }
});

// 4. POST /api/meetings/:meetingId/attendance/end
router.post('/:meetingId/attendance/end', authMiddleware, async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Validation Error', message: 'sessionId is required' });
  }

  try {
    await db.endAttendanceSession(sessionId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record leave event', message: err.message });
  }
});

// 5. GET /api/meetings/:meetingId/attendance
router.get('/:meetingId/attendance', authMiddleware, async (req, res) => {
  const { meetingId } = req.params;

  try {
    const list = await db.getMeetingAttendanceDetails(meetingId);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Database fetch failed', message: err.message });
  }
});

// 6. GET /api/meetings/:meetingId/attendance/:userId
router.get('/:meetingId/attendance/:userId', authMiddleware, async (req, res) => {
  const { meetingId, userId } = req.params;

  try {
    const details = await db.getUserMeetingAttendanceDetails(meetingId, userId);
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: 'Database fetch failed', message: err.message });
  }
});

module.exports = router;
