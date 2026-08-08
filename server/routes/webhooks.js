const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/webhooks/meeting-event - Ingests participant join/leave updates (M2 Jitsi integration)
router.post('/meeting-event', async (req, res) => {
  const { meetingId, participant } = req.body; // Expects { name, role, joinTime, leaveTime, duration, status }

  if (!meetingId || !participant || !participant.name || !participant.status) {
    return res.status(400).json({ error: 'Validation Error', message: 'Missing meetingId or participant parameters' });
  }

  try {
    // 1. Add record to attendance table
    const result = await db.addParticipantAttendance(meetingId, participant);

    // 2. Commit log into audit trails
    await db.addAuditLog({
      user: participant.name,
      action: participant.status === 'Absent' ? 'Participant Absent' : 'Participant Joined',
      module: 'Attendance (M6)',
      ip: req.ip || '127.0.0.1',
      status: 'Success',
      severity: participant.status === 'Left Early' || participant.status === 'Late' ? 'WARNING' : 'INFO',
      details: `Participant ${participant.name} (${participant.role}) join/leave session: Status marked as '${participant.status}'.`
    });

    res.status(201).json({ success: true, record: result });
  } catch (err) {
    res.status(500).json({ error: 'Webhook processing failed', message: err.message });
  }
});

// POST /api/webhooks/ai-transcript - Ingests NLP transcript blocks into memory indices (M5 AI integration)
router.post('/ai-transcript', async (req, res) => {
  const { record } = req.body; // Expects title, category, record_date, summary, decision_details, action_items, authorized_roles, etc.

  if (!record || !record.title || !record.summary || !record.authorized_roles) {
    return res.status(400).json({ error: 'Validation Error', message: 'Missing record parameters' });
  }

  try {
    // Commit transcript chunk to institutional_memory
    // Under fallback, we just write to db.json.
    // Under postgres, we insert it and trigger tsvector regeneration automatically.
    
    // In our prototype, since we are doing file db fallback, let's write to local JSON memory
    // (In db.js, we would write an insert query for memory. Let's add it to db.json first)
    const fs = require('fs');
    const path = require('path');
    const DB_FILE = path.join(__dirname, '../db.json');
    
    let dbData = { memory: [] };
    try {
      dbData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch(e) {}

    const newRecord = {
      id: `mem-${Date.now()}`,
      title: record.title,
      category: record.category || 'Meetings',
      date: record.record_date || new Date().toISOString().split('T')[0],
      relevance: 90,
      details: {
        summary: record.summary,
        decision: record.decision_details || '',
        actionItems: record.action_items || '',
        blockchainHash: record.blockchain_hash || '0xmock...',
        authorizedRoles: record.authorized_roles,
        documents: record.documents_list || [],
        aiHighlights: record.ai_transcript_segment || ''
      }
    };
    
    dbData.memory.unshift(newRecord);
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));

    // Log the event
    await db.addAuditLog({
      user: 'ai_transcriber',
      action: 'Record Updated',
      module: 'Blockchain (M4)',
      ip: req.ip || '127.0.0.1',
      status: 'Success',
      severity: 'INFO',
      details: `Ingested AI Summary for '${record.title}'. Committed decision parameters to FTS vector index.`
    });

    res.status(201).json({ success: true, record: newRecord });
  } catch (err) {
    res.status(500).json({ error: 'Webhook processing failed', message: err.message });
  }
});

module.exports = router;
