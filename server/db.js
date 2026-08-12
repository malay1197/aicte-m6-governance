const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');
let pgPool = null;
let supabase = null;
let useSupabase = false;
let useFallback = false;

// Baseline seed data to initialize both Postgres and JSON file
const baselineSeed = {
  meetings: [
    {
      id: "meet-001",
      name: "AICTE Review Meeting - Budget Allocations Q3",
      date: "2026-08-05",
      startTime: "10:00 AM",
      endTime: "11:30 AM",
      totalParticipants: 12,
      present: 10,
      absent: 2,
      late: 3,
      status: "Completed",
      participants: [
        { id: "p-001", name: "Dr. Anil Sahasrabudhe", role: "Chairman", joinTime: "09:55 AM", leaveTime: "11:30 AM", duration: "95 min", status: "Present" },
        { id: "p-002", name: "Prof. Rajive Kumar", role: "Member Secretary", joinTime: "09:58 AM", leaveTime: "11:30 AM", duration: "92 min", status: "Present" },
        { id: "p-003", name: "Dr. Abhay Jere", role: "Chief Innovation Officer", joinTime: "10:05 AM", leaveTime: "11:28 AM", duration: "83 min", status: "Late" },
        { id: "p-004", name: "Shri Vineet Joshi", role: "Government Nominee", joinTime: "09:54 AM", leaveTime: "11:15 AM", duration: "81 min", status: "Left Early" },
        { id: "p-005", name: "Smt. Mamta R. Agarwal", role: "Adviser I", joinTime: "10:08 AM", leaveTime: "11:30 AM", duration: "82 min", status: "Late" },
        { id: "p-006", name: "Dr. Ramesh Unnikrishnan", role: "Advisor II", joinTime: "09:59 AM", leaveTime: "11:30 AM", duration: "91 min", status: "Present" },
        { id: "p-007", name: "Prof. M.P. Poonia", role: "Vice Chairman", joinTime: "09:57 AM", leaveTime: "11:30 AM", duration: "93 min", status: "Present" },
        { id: "p-008", name: "Shri Harish C. Rai", role: "Advisor (E&T)", joinTime: "10:15 AM", leaveTime: "11:30 AM", duration: "75 min", status: "Late" },
        { id: "p-009", name: "Dr. Amit Dutta", role: "Regional Officer", joinTime: "09:59 AM", leaveTime: "11:30 AM", duration: "91 min", status: "Present" },
        { id: "p-010", name: "Shri Sanjeev Kumar", role: "System Administrator", joinTime: "09:50 AM", leaveTime: "11:30 AM", duration: "100 min", status: "Present" },
        { id: "p-011", name: "Prof. K.K. Aggarwal", role: "NBA Chairman", joinTime: "--", leaveTime: "--", duration: "0 min", status: "Absent" },
        { id: "p-012", name: "Dr. K.P. Isaac", role: "External Expert", joinTime: "--", leaveTime: "--", duration: "0 min", status: "Absent" },
      ]
    },
    {
      id: "meet-002",
      name: "Project Evaluation Committee - Smart India Hackathon",
      date: "2026-08-06",
      startTime: "02:00 PM",
      endTime: "04:30 PM",
      totalParticipants: 8,
      present: 7,
      absent: 1,
      late: 1,
      status: "Completed",
      participants: [
        { id: "p-001", name: "Dr. Abhay Jere", role: "Chief Innovation Officer", joinTime: "01:55 PM", leaveTime: "04:30 PM", duration: "155 min", status: "Present" },
        { id: "p-013", name: "Mr. Malay Vyas", role: "SIH Evaluator (M6 Panel)", joinTime: "01:50 PM", leaveTime: "04:30 PM", duration: "160 min", status: "Present" },
        { id: "p-014", name: "Dr. Mohit Gambhir", role: "Innovation Director", joinTime: "02:03 PM", leaveTime: "04:28 PM", duration: "145 min", status: "Late" },
        { id: "p-015", name: "Smt. Vinita Singhal", role: "Industry Representative", joinTime: "01:58 PM", leaveTime: "04:30 PM", duration: "152 min", status: "Present" },
        { id: "p-016", name: "Prof. S. R. Patel", role: "Senior Academician", joinTime: "01:59 PM", leaveTime: "04:30 PM", duration: "151 min", status: "Present" },
        { id: "p-017", name: "Dr. Sunita Sharma", role: "DST Representative", joinTime: "01:57 PM", leaveTime: "04:10 PM", duration: "133 min", status: "Left Early" },
        { id: "p-018", name: "Shri Neeraj Saxena", role: "Advisor (RIFD)", joinTime: "01:54 PM", leaveTime: "04:30 PM", duration: "156 min", status: "Present" },
        { id: "p-019", name: "Dr. Nitin Kumar", role: "External Evaluator", joinTime: "--", leaveTime: "--", duration: "0 min", status: "Absent" },
      ]
    }
  ],
  auditLogs: [
    { id: "log-101", timestamp: "2026-08-08 14:15:22", user: "admin_aicte", action: "Report Generated", module: "Reports (M6)", ip: "192.168.1.45", status: "Success", severity: "INFO", details: "Generated Security Audit Report for Q2." },
    { id: "log-102", timestamp: "2026-08-08 13:58:10", user: "sys_monitor", action: "Security Warning", module: "Audit (M6)", ip: "10.0.4.12", status: "Triggered", severity: "CRITICAL", details: "Multiple failed login attempts detected on admin profile." },
    { id: "log-103", timestamp: "2026-08-08 13:10:44", user: "prof_rajive", action: "Meeting Created", module: "Meeting (M2)", ip: "172.16.22.102", status: "Success", severity: "INFO", details: "Faculty Governance Meeting - National Level Norms created successfully." }
  ],
  securityEvents: [
    { id: "sec-001", title: "Multiple failed login attempts", description: "System detected 6 unsuccessful login attempts on 'admin_aicte' within 2 minutes.", timestamp: "2026-08-08 13:58:10", severity: "CRITICAL", status: "Active", details: "IP quarantined. AICTE governance team notified." },
    { id: "sec-002", title: "Permission updated securely", description: "Admin granted temporary read permissions on evaluation files.", timestamp: "2026-08-08 12:45:00", severity: "INFO", status: "Resolved", details: "Verified with Blockchain ledger (M4)." }
  ],
  notifications: [
    { id: "not-001", message: "Reminder: Review meeting report is pending signoff.", timestamp: "2026-08-08 14:00:00", priority: "HIGH", read: false, type: "reminder" },
    { id: "not-002", message: "Action Item: Approve SIH incubation grant criteria by tonight.", timestamp: "2026-08-08 12:30:00", priority: "HIGH", read: false, type: "action" }
  ],
  memory: [
    {
      id: "mem-001",
      title: "AICTE Review Meeting - Budget Allocations Q3 2026",
      category: "Meetings",
      date: "2026-08-05",
      relevance: 98,
      details: {
        summary: "AICTE quarterly budget allocation approval. Allocated INR 12.5 Crores.",
        decision: "Approved funding increase of 15% for innovation cell labs.",
        actionItems: "Dr. Abhay Jere to finalize dispersal metrics.",
        blockchainHash: "0x892e8bf723da890bf2a3e9c8821a9980d28711e9a2bc91e772153c3d2890fb91",
        authorizedRoles: ["Admin", "Chairman", "CIO", "Advisor"],
        documents: ["AICTE_Budget_2026_Q3.pdf"],
        aiHighlights: "Decided in 12 mins. Primary advocates: Prof M.P. Poonia."
      }
    },
    {
      id: "mem-002",
      title: "SIH Incubation Grant Dispersal Scheme",
      category: "Decisions",
      date: "2026-08-05",
      relevance: 92,
      details: {
        summary: "Approval of the criteria for selecting hackathon project prototypes.",
        decision: "SIH final prototypes with gold rating will receive 2 Lakhs seed grant.",
        actionItems: "All coordinators to distribute guidelines.",
        blockchainHash: "0xf3a890b7218d22e8bf287c8811e92bc9153c99e9c88e77c3d215bda90ab228fc",
        authorizedRoles: ["Admin", "Chairman", "CIO", "Evaluator"],
        documents: ["Incubation_Select_Guidelines_v2.pdf"],
        aiHighlights: "Consensus reached rapidly."
      }
    }
  ],
  reports: [],
  users: [
    { id: "admin_aicte", name: "Dr. Abhay Jere", email: "abhay.jere@aicte-india.org", role: "Admin" },
    { id: "student_rahul", name: "Rahul Patel", email: "rahul.patel@sih.gov.in", role: "Student" },
    { id: "prof_rajive", name: "Prof. Rajive Kumar", email: "rajive.kumar@aicte-india.org", role: "Member Secretary" }
  ],
  meetingParticipants: [
    { meetingId: "meet-001", userId: "admin_aicte", allowed: true },
    { meetingId: "meet-001", userId: "prof_rajive", allowed: true },
    { meetingId: "meet-002", userId: "admin_aicte", allowed: true },
    { meetingId: "meet-002", userId: "student_rahul", allowed: true }
  ],
  attendanceSessions: []
};

// Initialize connection
function initDb() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;
  
  if (supabaseUrl && supabaseKey) {
    console.log('Supabase credentials found. Initializing connection to hosted Postgres state.');
    supabase = createClient(supabaseUrl, supabaseKey);
    useSupabase = true;
    return Promise.resolve();
  }

  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/aicte_m6';
  
  pgPool = new Pool({
    connectionString,
    connectionTimeoutMillis: 2000
  });

  return new Promise((resolve) => {
    pgPool.query('SELECT NOW()', (err, res) => {
      if (err) {
        console.warn('PostgreSQL connection failed. Activating local file-based database fallback (db.json).');
        useFallback = true;
        // Make sure db.json exists on disk
        if (!fs.existsSync(DB_FILE)) {
          fs.writeFileSync(DB_FILE, JSON.stringify(baselineSeed, null, 2));
        }
      } else {
        console.log('Successfully connected to PostgreSQL Database.');
      }
      resolve();
    });
  });
}

// Helper: JSON File Read
function readLocalFile() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return baselineSeed;
  }
}

// Helper: JSON File Write
function writeLocalFile(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Database Actions Adapter
const db = {
  init: initDb,

  // --- Audit Logs ---
  async getAuditLogs() {
    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(r => ({
          id: r.id,
          timestamp: new Date(r.created_at).toISOString().replace('T', ' ').substring(0, 19),
          user: r.actor_username,
          action: r.action,
          module: r.module_name,
          ip: r.ip_address,
          status: r.status,
          severity: r.severity_level,
          details: r.details
        }));
      } catch (err) {
        console.error('Supabase query failed, falling back.', err);
      }
    }
    if (useFallback) {
      return readLocalFile().auditLogs;
    }
    const { rows } = await pgPool.query('SELECT * FROM audit_logs ORDER BY created_at DESC');
    return rows.map(r => ({
      id: r.id,
      timestamp: r.created_at.toISOString().replace('T', ' ').substring(0, 19),
      user: r.actor_username,
      action: r.action,
      module: r.module_name,
      ip: r.ip_address,
      status: r.status,
      severity: r.severity_level,
      details: r.details
    }));
  },

  async addAuditLog(log) {
    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .insert({
            actor_username: log.user,
            action: log.action,
            module_name: log.module,
            ip_address: log.ip || '127.0.0.1',
            status: log.status || 'Success',
            severity_level: log.severity || 'INFO',
            details: log.details || ''
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase insertion failed, falling back.', err);
      }
    }
    if (useFallback) {
      const data = readLocalFile();
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        user: log.user,
        action: log.action,
        module: log.module,
        ip: log.ip || '127.0.0.1',
        status: log.status || 'Success',
        severity: log.severity || 'INFO',
        details: log.details || ''
      };
      data.auditLogs.unshift(newLog);
      writeLocalFile(data);
      return newLog;
    }
    const q = `
      INSERT INTO audit_logs (actor_username, action, module_name, ip_address, status, severity_level, details)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;
    const values = [log.user, log.action, log.module, log.ip || '127.0.0.1', log.status || 'Success', log.severity || 'INFO', log.details || ''];
    const { rows } = await pgPool.query(q, values);
    return rows[0];
  },

  // --- Attendance ---
  async getAttendance() {
    if (useSupabase) {
      try {
        const { data: meetings, error: mErr } = await supabase
          .from('meetings')
          .select('*')
          .order('scheduled_start', { ascending: false });
        if (mErr) throw mErr;
        
        const finalMeetings = [];
        for (let m of meetings) {
          const { data: participants, error: pErr } = await supabase
            .from('attendance')
            .select('*')
            .eq('meeting_id', m.id);
          
          const parts = participants || [];
          finalMeetings.push({
            id: m.id,
            name: m.title,
            date: new Date(m.scheduled_start).toISOString().split('T')[0],
            startTime: new Date(m.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: new Date(m.scheduled_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            totalParticipants: parts.length,
            present: parts.filter(p => p.attendance_status === 'Present').length,
            absent: parts.filter(p => p.attendance_status === 'Absent').length,
            late: parts.filter(p => p.attendance_status === 'Late').length,
            status: m.status,
            participants: parts.map(p => ({
              id: p.id,
              name: p.participant_name,
              role: p.official_role,
              joinTime: p.join_time ? new Date(p.join_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
              leaveTime: p.leave_time ? new Date(p.leave_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
              duration: `${p.duration_minutes} min`,
              status: p.attendance_status
            }))
          });
        }
        return finalMeetings;
      } catch (err) {
        console.error('Supabase getAttendance failed:', err);
      }
    }
    if (useFallback) {
      return readLocalFile().meetings;
    }
    // Return all meetings with their participant structures
    const { rows: meetings } = await pgPool.query('SELECT * FROM meetings ORDER BY scheduled_start DESC');
    const finalMeetings = [];
    for (let m of meetings) {
      const { rows: participants } = await pgPool.query('SELECT * FROM attendance WHERE meeting_id = $1', [m.id]);
      finalMeetings.push({
        id: m.id,
        name: m.title,
        date: m.scheduled_start.toISOString().split('T')[0],
        startTime: m.scheduled_start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTime: m.scheduled_end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        totalParticipants: participants.length,
        present: participants.filter(p => p.attendance_status === 'Present').length,
        absent: participants.filter(p => p.attendance_status === 'Absent').length,
        late: participants.filter(p => p.attendance_status === 'Late').length,
        status: m.status,
        participants: participants.map(p => ({
          id: p.id,
          name: p.participant_name,
          role: p.official_role,
          joinTime: p.join_time ? p.join_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
          leaveTime: p.leave_time ? p.leave_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
          duration: `${p.duration_minutes} min`,
          status: p.attendance_status
        }))
      });
    }
    return finalMeetings;
  },

  async addParticipantAttendance(meetingId, record) {
    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('attendance')
          .insert({
            meeting_id: meetingId,
            participant_name: record.name,
            official_role: record.role,
            join_time: record.joinTime ? new Date(record.joinTime).toISOString() : null,
            leave_time: record.leaveTime ? new Date(record.leaveTime).toISOString() : null,
            duration_minutes: record.duration ? parseInt(record.duration) : 0,
            attendance_status: record.status
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase addParticipantAttendance failed:', err);
      }
    }
    if (useFallback) {
      const data = readLocalFile();
      const m = data.meetings.find(x => x.id === meetingId);
      if (m) {
        m.participants.push(record);
        m.totalParticipants = m.participants.length;
        m.present = m.participants.filter(p => p.status === 'Present').length;
        m.absent = m.participants.filter(p => p.status === 'Absent').length;
        m.late = m.participants.filter(p => p.status === 'Late').length;
        writeLocalFile(data);
      }
      return record;
    }
    const q = `
      INSERT INTO attendance (meeting_id, participant_name, official_role, join_time, leave_time, duration_minutes, attendance_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `;
    const val = [
      meetingId, 
      record.name, 
      record.role, 
      record.joinTime ? new Date(record.joinTime) : null,
      record.leaveTime ? new Date(record.leaveTime) : null,
      record.duration ? parseInt(record.duration) : 0,
      record.status
    ];
    const { rows } = await pgPool.query(q, val);
    return rows[0];
  },

  // --- Reports ---
  async getReports() {
    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('compliance_reports')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(r => ({
          id: r.report_number,
          type: r.report_type,
          timestamp: r.created_at,
          hash: r.blockchain_ledger_hash
        }));
      } catch (err) {
        console.error('Supabase getReports failed:', err);
      }
    }
    if (useFallback) {
      return readLocalFile().reports;
    }
    const { rows } = await pgPool.query('SELECT * FROM compliance_reports ORDER BY created_at DESC');
    return rows.map(r => ({
      id: r.report_number,
      type: r.report_type,
      timestamp: r.created_at,
      hash: r.blockchain_ledger_hash
    }));
  },

  async addReport(report) {
    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('compliance_reports')
          .insert({
            report_number: report.id,
            report_type: report.type,
            compiled_by_username: 'admin_aicte',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
            blockchain_ledger_hash: report.hash
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase addReport failed:', err);
      }
    }
    if (useFallback) {
      const data = readLocalFile();
      data.reports.unshift(report);
      writeLocalFile(data);
      return report;
    }
    const q = `
      INSERT INTO compliance_reports (report_number, report_type, compiled_by_username, start_date, end_date, blockchain_ledger_hash)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `;
    const vals = [report.id, report.type, 'admin_aicte', new Date(), new Date(), report.hash];
    const { rows } = await pgPool.query(q, vals);
    return rows[0];
  },

  // --- Notifications ---
  async getNotifications() {
    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(r => ({
          id: r.id,
          message: r.message,
          timestamp: new Date(r.created_at).toISOString().replace('T', ' ').substring(0, 19),
          priority: r.priority_level,
          read: r.is_read,
          type: r.notification_type
        }));
      } catch (err) {
        console.error('Supabase getNotifications failed:', err);
      }
    }
    if (useFallback) {
      return readLocalFile().notifications;
    }
    const { rows } = await pgPool.query('SELECT * FROM notifications ORDER BY created_at DESC');
    return rows.map(r => ({
      id: r.id,
      message: r.message,
      timestamp: r.created_at.toISOString().replace('T', ' ').substring(0, 19),
      priority: r.priority_level,
      read: r.is_read,
      type: r.notification_type
    }));
  },

  async addNotification(notif) {
    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .insert({
            message: notif.message,
            priority_level: notif.priority || 'MEDIUM',
            notification_type: notif.type || 'reminder',
            is_read: false
          })
          .select()
          .single();
        if (error) throw error;
        return {
          id: data.id,
          message: data.message,
          timestamp: new Date(data.created_at).toISOString().replace('T', ' ').substring(0, 19),
          priority: data.priority_level,
          read: data.is_read,
          type: data.notification_type
        };
      } catch (err) {
        console.error('Supabase addNotification failed:', err);
      }
    }
    if (useFallback) {
      const data = readLocalFile();
      const newNotif = {
        id: `not-${Date.now()}`,
        message: notif.message,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        priority: notif.priority || 'MEDIUM',
        read: false,
        type: notif.type || 'reminder'
      };
      data.notifications.unshift(newNotif);
      writeLocalFile(data);
      return newNotif;
    }
    const q = `
      INSERT INTO notifications (message, priority_level, notification_type, is_read)
      VALUES ($1, $2, $3, FALSE) RETURNING *
    `;
    const { rows } = await pgPool.query(q, [notif.message, notif.priority || 'MEDIUM', notif.type || 'reminder']);
    return rows[0];
  },

  async markNotificationRead(id) {
    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return {
          id: data.id,
          message: data.message,
          timestamp: new Date(data.created_at).toISOString().replace('T', ' ').substring(0, 19),
          priority: data.priority_level,
          read: data.is_read,
          type: data.notification_type
        };
      } catch (err) {
        console.error('Supabase markNotificationRead failed:', err);
      }
    }
    if (useFallback) {
      const data = readLocalFile();
      const n = data.notifications.find(x => x.id === id);
      if (n) {
        n.read = true;
        writeLocalFile(data);
      }
      return n;
    }
    const { rows } = await pgPool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *', [id]);
    return rows[0];
  },

  // --- Security Events ---
  async getSecurityEvents() {
    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .or("severity_level.eq.CRITICAL,action.eq.Security Warning")
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(r => ({
          id: r.id,
          title: r.action,
          description: r.details,
          timestamp: new Date(r.created_at).toISOString().replace('T', ' ').substring(0, 19),
          severity: r.severity_level,
          status: r.status === 'Triggered' ? 'Active' : 'Resolved',
          details: r.details
        }));
      } catch (err) {
        console.error('Supabase getSecurityEvents failed:', err);
      }
    }
    if (useFallback) {
      return readLocalFile().securityEvents;
    }
    // Pull active critical logs from audit_logs that map as security events
    const { rows } = await pgPool.query("SELECT * FROM audit_logs WHERE severity_level = 'CRITICAL' OR action = 'Security Warning' ORDER BY created_at DESC");
    return rows.map(r => ({
      id: r.id,
      title: r.action,
      description: r.details,
      timestamp: r.created_at.toISOString().replace('T', ' ').substring(0, 19),
      severity: r.severity_level,
      status: r.status === 'Triggered' ? 'Active' : 'Resolved',
      details: r.details
    }));
  },

  async updateSecurityEvent(id, status) {
    if (useSupabase) {
      try {
        const pgStatus = status === 'Resolved' ? 'Resolved' : 'Triggered';
        const { data, error } = await supabase
          .from('audit_logs')
          .update({ status: pgStatus })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase updateSecurityEvent failed:', err);
      }
    }
    if (useFallback) {
      const data = readLocalFile();
      const sec = data.securityEvents.find(x => x.id === id);
      if (sec) {
        sec.status = status;
        writeLocalFile(data);
      }
      return sec;
    }
    const pgStatus = status === 'Resolved' ? 'Resolved' : 'Triggered';
    const { rows } = await pgPool.query('UPDATE audit_logs SET status = $1 WHERE id = $2 RETURNING *', [pgStatus, id]);
    return rows[0];
  },

  // --- Search Memory (With Database-level RBAC) ---
  async searchMemory(query, category, role) {
    if (useSupabase) {
      try {
        let queryBuilder = supabase
          .from('institutional_memory')
          .select('*');
        
        if (category && category !== 'All') {
          queryBuilder = queryBuilder.eq('category', category);
        }
        
        const { data, error } = await queryBuilder;
        if (error) throw error;
        
        let results = data.filter(r => r.authorized_roles && r.authorized_roles.includes(role));
        
        if (query) {
          const q = query.toLowerCase();
          results = results.filter(r => 
            r.title.toLowerCase().includes(q) || 
            (r.summary && r.summary.toLowerCase().includes(q))
          );
        }
        
        return results.map(r => ({
          id: r.id,
          title: r.title,
          category: r.category,
          date: r.record_date,
          relevance: 95,
          details: {
            summary: r.summary,
            decision: r.decision_details,
            actionItems: r.action_items,
            blockchainHash: r.blockchain_hash,
            authorizedRoles: r.authorized_roles,
            documents: r.documents_list,
            aiHighlights: r.ai_transcript_segment
          }
        }));
      } catch (err) {
        console.error('Supabase searchMemory failed:', err);
      }
    }
    if (useFallback) {
      let results = readLocalFile().memory;
      
      results = results.filter(r => r.details.authorizedRoles.includes(role));

      if (category && category !== 'All') {
        results = results.filter(r => r.category === category);
      }
      if (query) {
        const q = query.toLowerCase();
        results = results.filter(r => 
          r.title.toLowerCase().includes(q) || 
          r.details.summary.toLowerCase().includes(q)
        );
      }
      return results;
    }
    
    // PostgreSQL Full-Text Search (FTS) Query with SQL Role Check
    let sql = `
      SELECT *, ts_rank(search_vector, plainto_tsquery('english', $1)) AS rank 
      FROM institutional_memory 
      WHERE $2 = ANY(authorized_roles)
    `;
    const params = [query || '', role];
    
    let paramIndex = 3;
    if (category && category !== 'All') {
      sql += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    if (query) {
      sql += ` AND search_vector @@ plainto_tsquery('english', $1)`;
    }
    
    sql += ' ORDER BY rank DESC, record_date DESC';
    const { rows } = await pgPool.query(sql, params);
    
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      category: r.category,
      date: r.record_date ? (typeof r.record_date === 'string' ? r.record_date : r.record_date.toISOString().split('T')[0]) : '',
      relevance: Math.round((r.rank || 0.1) * 100),
      details: {
        summary: r.summary,
        decision: r.decision_details,
        actionItems: r.action_items,
        blockchainHash: r.blockchain_hash,
        authorizedRoles: r.authorized_roles,
        documents: r.documents_list,
        aiHighlights: r.ai_transcript_segment
      }
    }));
  },

  async getUser(id) {
    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase getUser failed:', err);
      }
    }
    if (useFallback) {
      const data = readLocalFile();
      return data.users.find(u => u.id === id) || null;
    }
    const { rows } = await pgPool.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async isUserAllowedInMeeting(meetingId, userId) {
    if (useSupabase) {
      try {
        const user = await this.getUser(userId);
        if (user && user.role === 'Admin') return true;
        
        const { data, error } = await supabase
          .from('meeting_participants')
          .select('*')
          .eq('meeting_id', meetingId)
          .eq('user_id', userId)
          .eq('allowed', true)
          .maybeSingle();
        
        if (error) return false;
        if (data) return true;
        
        // If it is a generic/evaluation meeting, default allow
        const { data: meeting } = await supabase
          .from('meetings')
          .select('id')
          .eq('id', meetingId)
          .maybeSingle();
        
        if (meeting && meeting.id !== '00000000-0000-0000-0000-000000000001') {
          return true;
        }
        return false;
      } catch (err) {
        console.error('Supabase isUserAllowedInMeeting failed:', err);
      }
    }
    const user = await this.getUser(userId);
    if (user && user.role === 'Admin') return true;

    if (useFallback) {
      const data = readLocalFile();
      const isAllowed = data.meetingParticipants.some(mp => mp.meetingId === meetingId && mp.userId === userId && mp.allowed);
      if (isAllowed) return true;
      const meeting = data.meetings.find(m => m.id === meetingId);
      if (meeting && meeting.id.startsWith('meet-') && meeting.id !== 'meet-001') return true;
      return false;
    }

    const { rows } = await pgPool.query('SELECT * FROM meeting_participants WHERE meeting_id = $1 AND user_id = $2 AND allowed = TRUE', [meetingId, userId]);
    if (rows.length > 0) return true;

    const { rows: meetings } = await pgPool.query('SELECT * FROM meetings WHERE id = $1', [meetingId]);
    if (meetings.length > 0 && meetings[0].id !== 'meet-001') {
      return true;
    }
    return false;
  },

  async startAttendanceSession(meetingId, userId, name, email, jitsiRoomName) {
    const now = new Date();
    const sessionId = `sess-${Date.now()}`;

    if (useSupabase) {
      try {
        await supabase
          .from('users')
          .upsert({ id: userId, name, email, role: 'Student' }, { onConflict: 'id' });

        const { data: activeSession } = await supabase
          .from('attendance_sessions')
          .select('*')
          .eq('meeting_id', meetingId)
          .eq('user_id', userId)
          .eq('status', 'Active')
          .gt('last_heartbeat', new Date(now - 45000).toISOString())
          .maybeSingle();

        if (activeSession) {
          await supabase
            .from('attendance_sessions')
            .update({ last_heartbeat: now.toISOString(), updated_at: now.toISOString() })
            .eq('id', activeSession.id);
          return { sessionId: activeSession.session_id };
        }

        await supabase
          .from('attendance_sessions')
          .update({ status: 'Completed', leave_time: now.toISOString() })
          .eq('meeting_id', meetingId)
          .eq('user_id', userId)
          .eq('status', 'Active');

        const { data: newSession, error: createErr } = await supabase
          .from('attendance_sessions')
          .insert({
            meeting_id: meetingId,
            user_id: userId,
            session_id: sessionId,
            join_time: now.toISOString(),
            status: 'Active',
            last_heartbeat: now.toISOString()
          })
          .select()
          .single();
        
        if (createErr) throw createErr;
        return { sessionId: newSession.session_id };
      } catch (err) {
        console.error('Supabase startAttendanceSession failed:', err);
      }
    }

    if (useFallback) {
      const data = readLocalFile();
      let user = data.users.find(u => u.id === userId);
      if (!user) {
        user = { id: userId, name, email, role: 'Student' };
        data.users.push(user);
      }

      const activeSession = data.attendanceSessions.find(s => 
        s.meetingId === meetingId && 
        s.userId === userId && 
        s.status === 'Active' &&
        (now - new Date(s.lastHeartbeat)) < 45000
      );

      if (activeSession) {
        activeSession.lastHeartbeat = now.toISOString();
        writeLocalFile(data);
        return activeSession;
      }

      data.attendanceSessions.forEach(s => {
        if (s.meetingId === meetingId && s.userId === userId && s.status === 'Active') {
          s.status = 'Completed';
          s.leaveTime = s.lastHeartbeat;
          s.durationSeconds = Math.max(0, Math.floor((new Date(s.leaveTime) - new Date(s.joinTime)) / 1000));
        }
      });

      const newSession = {
        id: `sess-uuid-${Date.now()}`,
        meetingId,
        userId,
        sessionId,
        joinTime: now.toISOString(),
        leaveTime: null,
        durationSeconds: 0,
        status: 'Active',
        lastHeartbeat: now.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };
      data.attendanceSessions.push(newSession);
      writeLocalFile(data);
      return newSession;
    }

    await pgPool.query(`
      INSERT INTO users (id, name, email, role) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING
    `, [userId, name, email, 'Student']);

    const activeCheck = await pgPool.query(`
      SELECT * FROM attendance_sessions 
      WHERE meeting_id = $1 AND user_id = $2 AND status = 'Active' AND last_heartbeat > NOW() - INTERVAL '45 seconds'
    `, [meetingId, userId]);

    if (activeCheck.rows.length > 0) {
      const activeSession = activeCheck.rows[0];
      await pgPool.query(`
        UPDATE attendance_sessions SET last_heartbeat = NOW(), updated_at = NOW() WHERE id = $1
      `, [activeSession.id]);
      return { sessionId: activeSession.session_id };
    }

    await pgPool.query(`
      UPDATE attendance_sessions 
      SET status = 'Completed', leave_time = last_heartbeat, duration_seconds = EXTRACT(EPOCH FROM (last_heartbeat - join_time))
      WHERE meeting_id = $1 AND user_id = $2 AND status = 'Active'
    `, [meetingId, userId]);

    const q = `
      INSERT INTO attendance_sessions (meeting_id, user_id, session_id, join_time, status, last_heartbeat)
      VALUES ($1, $2, $3, NOW(), 'Active', NOW()) RETURNING *
    `;
    const { rows } = await pgPool.query(q, [meetingId, userId, sessionId]);
    return { sessionId: rows[0].session_id };
  },

  async heartbeatAttendanceSession(sessionId) {
    const now = new Date();
    if (useSupabase) {
      try {
        const { data: sess } = await supabase
          .from('attendance_sessions')
          .select('join_time')
          .eq('session_id', sessionId)
          .maybeSingle();

        let duration = 0;
        if (sess) {
          duration = Math.max(0, Math.floor((now - new Date(sess.join_time)) / 1000));
        }

        const { data, error } = await supabase
          .from('attendance_sessions')
          .update({
            last_heartbeat: now.toISOString(),
            leave_time: now.toISOString(),
            duration_seconds: duration,
            updated_at: now.toISOString()
          })
          .eq('session_id', sessionId)
          .select()
          .maybeSingle();
        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase heartbeatAttendanceSession failed:', err);
      }
    }
    if (useFallback) {
      const data = readLocalFile();
      const session = data.attendanceSessions.find(s => s.sessionId === sessionId);
      if (session) {
        session.lastHeartbeat = now.toISOString();
        session.leaveTime = now.toISOString();
        session.durationSeconds = Math.max(0, Math.floor((new Date(session.leaveTime) - new Date(session.joinTime)) / 1000));
        session.updatedAt = now.toISOString();
        writeLocalFile(data);
        return session;
      }
      return null;
    }
    const q = `
      UPDATE attendance_sessions 
      SET last_heartbeat = NOW(), leave_time = NOW(), duration_seconds = EXTRACT(EPOCH FROM (NOW() - join_time)), updated_at = NOW() 
      WHERE session_id = $1 RETURNING *
    `;
    const { rows } = await pgPool.query(q, [sessionId]);
    return rows[0] || null;
  },

  async endAttendanceSession(sessionId) {
    const now = new Date();
    if (useSupabase) {
      try {
        const { data: sess } = await supabase
          .from('attendance_sessions')
          .select('join_time')
          .eq('session_id', sessionId)
          .maybeSingle();

        let duration = 0;
        if (sess) {
          duration = Math.max(0, Math.floor((now - new Date(sess.join_time)) / 1000));
        }

        const { data, error } = await supabase
          .from('attendance_sessions')
          .update({
            status: 'Completed',
            leave_time: now.toISOString(),
            duration_seconds: duration,
            updated_at: now.toISOString()
          })
          .eq('session_id', sessionId)
          .select()
          .maybeSingle();
        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase endAttendanceSession failed:', err);
      }
    }
    if (useFallback) {
      const data = readLocalFile();
      const session = data.attendanceSessions.find(s => s.sessionId === sessionId);
      if (session) {
        session.status = 'Completed';
        session.leaveTime = now.toISOString();
        session.durationSeconds = Math.max(0, Math.floor((new Date(session.leaveTime) - new Date(session.joinTime)) / 1000));
        session.updatedAt = now.toISOString();
        writeLocalFile(data);
        return session;
      }
      return null;
    }
    const q = `
      UPDATE attendance_sessions 
      SET status = 'Completed', leave_time = NOW(), duration_seconds = EXTRACT(EPOCH FROM (NOW() - join_time)), updated_at = NOW() 
      WHERE session_id = $1 RETURNING *
    `;
    const { rows } = await pgPool.query(q, [sessionId]);
    return rows[0] || null;
  },

  async sweepOrphanedSessions() {
    if (useSupabase) {
      try {
        const now = new Date();
        const { data: activeOld } = await supabase
          .from('attendance_sessions')
          .select('*')
          .eq('status', 'Active')
          .lt('last_heartbeat', new Date(now - 35000).toISOString());

        if (activeOld && activeOld.length > 0) {
          for (let s of activeOld) {
            const duration = Math.max(0, Math.floor((new Date(s.last_heartbeat) - new Date(s.join_time)) / 1000));
            await supabase
              .from('attendance_sessions')
              .update({
                status: 'Completed',
                leave_time: s.last_heartbeat,
                duration_seconds: duration,
                updated_at: now.toISOString()
              })
              .eq('id', s.id);
            console.log(`Swept orphaned Supabase session ${s.session_id}`);
          }
        }
        return;
      } catch (err) {
        console.error('Supabase sweepOrphanedSessions failed:', err);
      }
    }
    if (useFallback) {
      const data = readLocalFile();
      const now = new Date();
      let updated = false;
      data.attendanceSessions.forEach(s => {
        if (s.status === 'Active' && (now - new Date(s.lastHeartbeat)) > 35000) {
          s.status = 'Completed';
          s.leaveTime = s.lastHeartbeat;
          s.durationSeconds = Math.max(0, Math.floor((new Date(s.leaveTime) - new Date(s.joinTime)) / 1000));
          s.updatedAt = now.toISOString();
          updated = true;
          console.log(`Swept orphaned fallback session ${s.sessionId} for user ${s.userId}`);
        }
      });
      if (updated) {
        writeLocalFile(data);
      }
      return;
    }
    const q = `
      UPDATE attendance_sessions 
      SET status = 'Completed', leave_time = last_heartbeat, duration_seconds = EXTRACT(EPOCH FROM (last_heartbeat - join_time)), updated_at = NOW()
      WHERE status = 'Active' AND last_heartbeat < NOW() - INTERVAL '35 seconds'
    `;
    const res = await pgPool.query(q);
    if (res.rowCount > 0) {
      console.log(`Swept ${res.rowCount} orphaned active sessions in Postgres`);
    }
  },

  async getMeetingAttendanceDetails(meetingId) {
    if (useSupabase) {
      try {
        const { data: sessions, error } = await supabase
          .from('attendance_sessions')
          .select(`
            session_id,
            join_time,
            leave_time,
            duration_seconds,
            status,
            user_id,
            users (
              name,
              role
            )
          `)
          .eq('meeting_id', meetingId);

        if (error) throw error;
        
        const userGroup = {};
        sessions.forEach(s => {
          const u = s.users || { name: s.user_id, role: 'Student' };
          if (!userGroup[s.user_id]) {
            userGroup[s.user_id] = {
              userId: s.user_id,
              name: u.name,
              role: u.role,
              sessionsCount: 0,
              totalDurationSeconds: 0,
              status: 'Offline',
              sessions: []
            };
          }
          userGroup[s.user_id].sessionsCount++;
          userGroup[s.user_id].totalDurationSeconds += s.duration_seconds;
          userGroup[s.user_id].sessions.push({
            joinTime: s.join_time,
            leaveTime: s.leave_time,
            durationSeconds: s.duration_seconds,
            status: s.status
          });
          if (s.status === 'Active') {
            userGroup[s.user_id].status = 'Online';
          }
        });
        return Object.values(userGroup);
      } catch (err) {
        console.error('Supabase getMeetingAttendanceDetails failed:', err);
      }
    }
    if (useFallback) {
      const data = readLocalFile();
      const sessions = data.attendanceSessions.filter(s => s.meetingId === meetingId);
      const userGroup = {};
      
      sessions.forEach(s => {
        if (!userGroup[s.userId]) {
          const user = data.users.find(u => u.id === s.userId) || { id: s.userId, name: s.userId, role: 'Student' };
          userGroup[s.userId] = {
            userId: s.userId,
            name: user.name,
            role: user.role,
            sessionsCount: 0,
            totalDurationSeconds: 0,
            status: 'Offline',
            sessions: []
          };
        }
        
        userGroup[s.userId].sessionsCount++;
        userGroup[s.userId].totalDurationSeconds += s.durationSeconds;
        userGroup[s.userId].sessions.push({
          joinTime: s.joinTime,
          leaveTime: s.leaveTime,
          durationSeconds: s.durationSeconds,
          status: s.status
        });
        
        if (s.status === 'Active') {
          userGroup[s.userId].status = 'Online';
        }
      });
      
      return Object.values(userGroup);
    }

    const q = `
      SELECT s.*, u.name as user_name, u.role as user_role 
      FROM attendance_sessions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.meeting_id = $1
    `;
    const { rows } = await pgPool.query(q, [meetingId]);
    const userGroup = {};
    rows.forEach(r => {
      if (!userGroup[r.user_id]) {
        userGroup[r.user_id] = {
          userId: r.user_id,
          name: r.user_name,
          role: r.user_role,
          sessionsCount: 0,
          totalDurationSeconds: 0,
          status: 'Offline',
          sessions: []
        };
      }
      userGroup[r.user_id].sessionsCount++;
      userGroup[r.user_id].totalDurationSeconds += r.duration_seconds;
      userGroup[r.user_id].sessions.push({
        joinTime: r.join_time,
        leaveTime: r.leave_time,
        duration_seconds: r.duration_seconds,
        status: r.status
      });
      if (r.status === 'Active') {
        userGroup[r.user_id].status = 'Online';
      }
    });
    return Object.values(userGroup);
  },

  async getUserMeetingAttendanceDetails(meetingId, userId) {
    if (useSupabase) {
      try {
        const { data: sessions, error } = await supabase
          .from('attendance_sessions')
          .select(`
            session_id,
            join_time,
            leave_time,
            duration_seconds,
            status,
            users (
              name,
              email,
              role
            )
          `)
          .eq('meeting_id', meetingId)
          .eq('user_id', userId);

        if (error) throw error;
        
        const user = await this.getUser(userId);

        if (!sessions || sessions.length === 0) {
          return {
            userId,
            name: user ? user.name : userId,
            email: user ? user.email : '',
            role: user ? user.role : 'Student',
            totalDurationSeconds: 0,
            sessionsCount: 0,
            status: 'Offline',
            sessions: []
          };
        }

        const u = sessions[0].users || { name: userId, email: '', role: 'Student' };
        const totalSec = sessions.reduce((acc, s) => acc + s.duration_seconds, 0);
        const activeSession = sessions.find(s => s.status === 'Active');

        return {
          userId,
          name: u.name,
          email: u.email,
          role: u.role,
          totalDurationSeconds: totalSec,
          sessionsCount: sessions.length,
          status: activeSession ? 'Online' : 'Offline',
          sessions: sessions.map(s => ({
            sessionId: s.session_id,
            joinTime: s.join_time,
            leaveTime: s.leave_time,
            durationSeconds: s.duration_seconds,
            status: s.status
          }))
        };
      } catch (err) {
        console.error('Supabase getUserMeetingAttendanceDetails failed:', err);
      }
    }
    if (useFallback) {
      const data = readLocalFile();
      const sessions = data.attendanceSessions.filter(s => s.meetingId === meetingId && s.userId === userId);
      const user = data.users.find(u => u.id === userId) || { id: userId, name: userId, role: 'Student' };
      
      const totalSec = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
      const activeSession = sessions.find(s => s.status === 'Active');

      return {
        userId,
        name: user.name,
        email: user.email,
        role: user.role,
        totalDurationSeconds: totalSec,
        sessionsCount: sessions.length,
        status: activeSession ? 'Online' : 'Offline',
        sessions: sessions.map(s => ({
          sessionId: s.sessionId,
          joinTime: s.joinTime,
          leaveTime: s.leaveTime,
          durationSeconds: s.durationSeconds,
          status: s.status
        }))
      };
    }

    const { rows } = await pgPool.query(`
      SELECT s.*, u.name as user_name, u.email as user_email, u.role as user_role 
      FROM attendance_sessions s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.meeting_id = $1 AND s.user_id = $2
    `, [meetingId, userId]);

    if (rows.length === 0) {
      const user = await this.getUser(userId);
      return {
        userId,
        name: user ? user.name : userId,
        email: user ? user.email : '',
        role: user ? user.role : 'Student',
        totalDurationSeconds: 0,
        sessionsCount: 0,
        status: 'Offline',
        sessions: []
      };
    }

    const totalSec = rows.reduce((acc, r) => acc + r.duration_seconds, 0);
    const activeSession = rows.find(r => r.status === 'Active');

    return {
      userId,
      name: rows[0].user_name,
      email: rows[0].user_email,
      role: rows[0].user_role,
      totalDurationSeconds: totalSec,
      sessionsCount: rows.length,
      status: activeSession ? 'Online' : 'Offline',
      sessions: rows.map(r => ({
        sessionId: r.session_id,
        joinTime: r.join_time,
        leaveTime: r.leave_time,
        durationSeconds: r.duration_seconds,
        status: r.status
      }))
    };
  },

  async endMeeting(meetingId) {
    const now = new Date();
    if (useSupabase) {
      try {
        await supabase
          .from('meetings')
          .update({ status: 'Completed' })
          .eq('id', meetingId);

        const { data: activeSessions } = await supabase
          .from('attendance_sessions')
          .select('*')
          .eq('meeting_id', meetingId)
          .eq('status', 'Active');

        if (activeSessions && activeSessions.length > 0) {
          for (let s of activeSessions) {
            const duration = Math.max(0, Math.floor((now - new Date(s.join_time)) / 1000));
            await supabase
              .from('attendance_sessions')
              .update({
                status: 'Completed',
                leave_time: now.toISOString(),
                duration_seconds: duration,
                updated_at: now.toISOString()
              })
              .eq('id', s.id);
          }
        }
        return { success: true };
      } catch (err) {
        console.error('Supabase endMeeting failed:', err);
      }
    }

    if (useFallback) {
      const data = readLocalFile();
      const meeting = data.meetings.find(m => m.id === meetingId);
      if (meeting) {
        meeting.status = 'Completed';
      }
      data.attendanceSessions.forEach(s => {
        if (s.meetingId === meetingId && s.status === 'Active') {
          s.status = 'Completed';
          s.leaveTime = now.toISOString();
          s.durationSeconds = Math.max(0, Math.floor((new Date(s.leaveTime) - new Date(s.joinTime)) / 1000));
        }
      });
      writeLocalFile(data);
      return { success: true };
    }

    await pgPool.query("UPDATE meetings SET status = 'Completed' WHERE id = $1", [meetingId]);
    await pgPool.query(`
      UPDATE attendance_sessions 
      SET status = 'Completed', leave_time = NOW(), duration_seconds = EXTRACT(EPOCH FROM (NOW() - join_time)), updated_at = NOW()
      WHERE meeting_id = $1 AND status = 'Active'
    `, [meetingId]);
    return { success: true };
  },

  async createMeeting(m) {
    if (useSupabase) {
      try {
        const { data, error } = await supabase
          .from('meetings')
          .insert({
            id: m.id,
            title: m.name,
            scheduled_start: new Date(`${m.date} ${m.startTime}`).toISOString(),
            scheduled_end: new Date(`${m.date} ${m.endTime}`).toISOString(),
            status: m.status || 'Scheduled',
            description: m.description || '',
            room_name: `AICTE-Sec-Governance-Room-${m.id}`,
            created_by: m.createdBy || 'admin_aicte'
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Supabase createMeeting failed:', err);
      }
    }

    if (useFallback) {
      const data = readLocalFile();
      data.meetings.unshift({
        ...m,
        roomName: `AICTE-Sec-Governance-Room-${m.id}`,
        participants: m.participants || []
      });
      writeLocalFile(data);
      return m;
    }

    const q = `
      INSERT INTO meetings (id, title, scheduled_start, scheduled_end, status, description, room_name, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `;
    const startStr = new Date(`${m.date} ${m.startTime}`).toISOString();
    const endStr = new Date(`${m.date} ${m.endTime}`).toISOString();
    const { rows } = await pgPool.query(q, [
      m.id, 
      m.name, 
      startStr, 
      endStr, 
      m.status || 'Scheduled', 
      m.description || '', 
      `AICTE-Sec-Governance-Room-${m.id}`, 
      m.createdBy || 'admin_aicte'
    ]);
    return rows[0];
  }
};

module.exports = db;
