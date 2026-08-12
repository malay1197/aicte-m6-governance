// AICTE Security & Governance Platform - M6 API Client with M1 RBAC headers
import * as mock from './mockData';

const BASE_URL = 'http://localhost:5000/api';

// Enforce Mock credentials representing synced M1 context
const AUTH_HEADER_VALUE = 'Bearer admin_aicte:Admin';

// Local fallbacks in case the backend server goes completely offline
let localMeetings = [...mock.mockMeetings];
let localAuditLogs = [...mock.mockAuditLogs];
let localSecurityEvents = [...mock.mockSecurityEvents];
let localNotifications = [...mock.mockNotifications];
let localReports = [];

export const api = {
  // 1. GET /api/audit-logs
  async getAuditLogs() {
    try {
      const res = await fetch(`${BASE_URL}/audit-logs`, {
        headers: { 'Authorization': AUTH_HEADER_VALUE }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend offline. Loading local audits.");
    }
    return localAuditLogs;
  },

  // 2. GET /api/attendance
  async getAttendance() {
    try {
      const res = await fetch(`${BASE_URL}/attendance`, {
        headers: { 'Authorization': AUTH_HEADER_VALUE }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend offline. Loading local meetings.");
    }
    return localMeetings;
  },

  // 3. GET /api/reports
  async getReports() {
    try {
      const res = await fetch(`${BASE_URL}/reports`, {
        headers: { 'Authorization': AUTH_HEADER_VALUE }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend offline. Loading local reports.");
    }
    return localReports;
  },

  // 4. POST /api/reports/generate
  async generateReport(type, meetingId, dateRange) {
    try {
      const res = await fetch(`${BASE_URL}/reports/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': AUTH_HEADER_VALUE
        },
        body: JSON.stringify({ type, meetingId, dateRange })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend offline. Compiling report locally.");
    }
    
    const newReport = {
      id: `REP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      type,
      meetingId,
      dateRange,
      timestamp: new Date().toISOString(),
      hash: '0x8a92fbcd9a928ef782bcf9287cba1192e8bf77a8'
    };
    localReports.unshift(newReport);
    
    // Add audit log
    localAuditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: "admin_aicte",
      action: "Report Generated",
      module: "Reports (M6)",
      ip: "127.0.0.1",
      status: "Success",
      severity: "INFO",
      details: `Generated report type: ${type} locally (Fallback)`
    });

    return newReport;
  },

  // 5. GET /api/memory/search
  async searchMemory(query, category) {
    try {
      const url = new URL(`${BASE_URL}/memory/search`);
      if (query) url.searchParams.append('q', query);
      if (category && category !== 'All') url.searchParams.append('category', category);
      
      const res = await fetch(url, {
        headers: { 'Authorization': AUTH_HEADER_VALUE }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend offline. Searching memory index locally.");
    }

    // Local Search with simulated RBAC role checks
    let results = mock.mockMemoryRecords;
    // Assume role 'Admin' for local fallback filtering
    results = results.filter(r => r.details.authorizedRoles.includes('Admin'));

    if (category !== 'All') {
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
  },

  // 6. GET /api/notifications
  async getNotifications() {
    try {
      const res = await fetch(`${BASE_URL}/notifications`, {
        headers: { 'Authorization': AUTH_HEADER_VALUE }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend offline. Loading local notifications.");
    }
    return localNotifications;
  },

  // 7. PATCH /api/notifications/:id/read
  async markNotificationRead(id) {
    try {
      const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': AUTH_HEADER_VALUE }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend offline. Marking notifications read locally.");
    }

    localNotifications = localNotifications.map(n => n.id === id ? { ...n, read: true } : n);
    return { success: true };
  },

  // --- Security Events ---
  async getSecurityEvents() {
    try {
      const res = await fetch(`${BASE_URL}/security-events`, {
        headers: { 'Authorization': AUTH_HEADER_VALUE }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend offline. Loading local security threat matrix.");
    }
    return localSecurityEvents;
  },

  async resolveSecurityEvent(id) {
    try {
      const res = await fetch(`${BASE_URL}/security-events/${id}/resolve`, {
        method: 'PATCH',
        headers: { 'Authorization': AUTH_HEADER_VALUE }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend offline. Resolving security event locally.");
    }

    localSecurityEvents = localSecurityEvents.map(e => e.id === id ? { ...e, status: 'Resolved' } : e);
    
    // Add audit log
    localAuditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: "admin_aicte",
      action: "Security Event Resolved",
      module: "Audit (M6)",
      ip: "127.0.0.1",
      status: "Success",
      severity: "INFO",
      details: `Resolved security incident ID: ${id} locally`
    });

    return { success: true };
  },

  async analyzeTranscript(transcript) {
    const key = localStorage.getItem('gemini_api_key');
    
    // 1. Attempt to use backend AI api first
    try {
      const res = await fetch(`${BASE_URL}/ai/analyze-transcript`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': AUTH_HEADER_VALUE,
          'x-gemini-key': key || ''
        },
        body: JSON.stringify({ transcript })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend offline. Executing direct client-side Gemini analysis fallback.");
    }

    // 2. Client-side direct fallback if backend is offline/Vercel host
    if (!key) {
      throw new Error("Gemini API Key is missing. Please add your key in the configurations panel (Settings tab).");
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an expert AI Compliance Officer for the All India Council for Technical Education (AICTE). 
Analyze the following meeting transcript. Generate an executive summary of the meeting goals, list all approved governance decisions, and compile a compliance action items list.

Transcript:
"${transcript}"

You must respond with a JSON object formatted EXACTLY as shown below:
{
  "goalSummary": "A concise paragraph summarizing the meeting purpose, discussions, and goals.",
  "decisions": [
    "Decision sentence 1",
    "Decision sentence 2"
  ],
  "actionItems": [
    {
      "task": "Task description details",
      "assignee": "Name of official assigned to the task",
      "deadline": "Deadline date (e.g. Aug 22, 2026)"
    }
  ]
}

Return ONLY raw JSON. Do not write any markdown code blocks, backticks, or formatting text around the JSON.`
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini Direct API Error: ${errBody}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    return JSON.parse(resultText.trim());
  },

  // --- Secure Jitsi Meetings & Attendance Systems ---
  async joinMeeting(meetingId, credentials) {
    try {
      const authVal = `Bearer ${credentials.username}:${credentials.role}`;
      const res = await fetch(`${BASE_URL}/meetings/${meetingId}/join`, {
        method: 'POST',
        headers: { 
          'Authorization': authVal,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend offline. Running client-side Jitsi Gatekeeper simulation.");
    }

    // Direct local fallback check
    if (meetingId === 'meet-001' && credentials.role === 'Student') {
      throw new Error("Access Denied: Jitsi Security Gatekeeper rejected join request. Check authorization.");
    }
    return {
      success: true,
      roomName: `AICTE-Sec-Governance-Room-${meetingId}`,
      displayName: `${credentials.username} (${credentials.role})`
    };
  },

  async startAttendance(meetingId, body, credentials) {
    try {
      const authVal = `Bearer ${credentials.username}:${credentials.role}`;
      const res = await fetch(`${BASE_URL}/meetings/${meetingId}/attendance/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authVal
        },
        body: JSON.stringify(body)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend offline. Starting client-side attendance session fallback.");
    }

    // Fallback logic using localStorage
    const now = new Date();
    const sessionId = `sess-${Date.now()}`;
    const sessions = JSON.parse(localStorage.getItem('local_attendance_sessions') || '[]');
    
    // Check if there is already an active session
    const active = sessions.find(s => 
      s.meetingId === meetingId && 
      s.userId === body.userId && 
      s.status === 'Active' &&
      (now - new Date(s.lastHeartbeat)) < 45000
    );

    if (active) {
      active.lastHeartbeat = now.toISOString();
      localStorage.setItem('local_attendance_sessions', JSON.stringify(sessions));
      return { sessionId: active.sessionId };
    }

    // Close other active sessions
    sessions.forEach(s => {
      if (s.meetingId === meetingId && s.userId === body.userId && s.status === 'Active') {
        s.status = 'Completed';
        s.leaveTime = s.lastHeartbeat;
        s.durationSeconds = Math.max(0, Math.floor((new Date(s.leaveTime) - new Date(s.joinTime)) / 1000));
      }
    });

    const newSess = {
      meetingId,
      userId: body.userId,
      name: body.name,
      role: credentials.role,
      sessionId,
      joinTime: now.toISOString(),
      leaveTime: null,
      durationSeconds: 0,
      status: 'Active',
      lastHeartbeat: now.toISOString()
    };
    sessions.push(newSess);
    localStorage.setItem('local_attendance_sessions', JSON.stringify(sessions));
    return { sessionId };
  },

  async heartbeatAttendance(meetingId, body, credentials) {
    try {
      const authVal = `Bearer ${credentials.username}:${credentials.role}`;
      await fetch(`${BASE_URL}/meetings/${meetingId}/attendance/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authVal
        },
        body: JSON.stringify(body)
      });
      return;
    } catch (e) {
      // ignore
    }

    const now = new Date();
    const sessions = JSON.parse(localStorage.getItem('local_attendance_sessions') || '[]');
    const sess = sessions.find(s => s.sessionId === body.sessionId);
    if (sess) {
      sess.lastHeartbeat = now.toISOString();
      sess.leaveTime = now.toISOString();
      sess.durationSeconds = Math.max(0, Math.floor((new Date(sess.leaveTime) - new Date(sess.joinTime)) / 1000));
      localStorage.setItem('local_attendance_sessions', JSON.stringify(sessions));
    }
  },

  async endAttendance(meetingId, body, credentials) {
    try {
      const authVal = `Bearer ${credentials.username}:${credentials.role}`;
      await fetch(`${BASE_URL}/meetings/${meetingId}/attendance/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authVal
        },
        body: JSON.stringify(body)
      });
      return;
    } catch (e) {
      // ignore
    }

    const now = new Date();
    const sessions = JSON.parse(localStorage.getItem('local_attendance_sessions') || '[]');
    const sess = sessions.find(s => s.sessionId === body.sessionId);
    if (sess) {
      sess.status = 'Completed';
      sess.leaveTime = now.toISOString();
      sess.durationSeconds = Math.max(0, Math.floor((new Date(sess.leaveTime) - new Date(sess.joinTime)) / 1000));
      localStorage.setItem('local_attendance_sessions', JSON.stringify(sessions));
    }
  },

  async getMeetingAttendance(meetingId, credentials) {
    try {
      const authVal = `Bearer ${credentials.username}:${credentials.role}`;
      const res = await fetch(`${BASE_URL}/meetings/${meetingId}/attendance`, {
        headers: { 'Authorization': authVal }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend offline. Generating mock/local attendance details.");
    }

    // Default mock data seeds
    const defaultData = [];
    if (meetingId === 'meet-001') {
      defaultData.push(
        {
          userId: 'p-001',
          name: 'Dr. Anil Sahasrabudhe',
          role: 'Chairman',
          sessionsCount: 1,
          totalDurationSeconds: 5700,
          status: 'Offline',
          sessions: [{ joinTime: '2026-08-05T10:00:00.000Z', leaveTime: '2026-08-05T11:35:00.000Z', durationSeconds: 5700, status: 'Completed' }]
        },
        {
          userId: 'p-002',
          name: 'Prof. Rajive Kumar',
          role: 'Member Secretary',
          sessionsCount: 1,
          totalDurationSeconds: 5520,
          status: 'Offline',
          sessions: [{ joinTime: '2026-08-05T10:02:00.000Z', leaveTime: '2026-08-05T11:34:00.000Z', durationSeconds: 5520, status: 'Completed' }]
        },
        {
          userId: 'student_rahul',
          name: 'Rahul Patel',
          role: 'Student',
          sessionsCount: 3,
          totalDurationSeconds: 2700,
          status: 'Offline',
          sessions: [
            { joinTime: '2026-08-05T10:00:00.000Z', leaveTime: '2026-08-05T10:20:00.000Z', durationSeconds: 1200, status: 'Completed' },
            { joinTime: '2026-08-05T10:30:00.000Z', leaveTime: '2026-08-05T10:45:00.000Z', durationSeconds: 900, status: 'Completed' },
            { joinTime: '2026-08-05T11:00:00.000Z', leaveTime: '2026-08-05T11:10:00.000Z', durationSeconds: 600, status: 'Completed' }
          ]
        }
      );
    } else {
      defaultData.push(
        {
          userId: 'student_rahul',
          name: 'Rahul Patel',
          role: 'Student',
          sessionsCount: 2,
          totalDurationSeconds: 3120,
          status: 'Offline',
          sessions: [
            { joinTime: '2026-08-06T14:00:00.000Z', leaveTime: '2026-08-06T14:40:00.000Z', durationSeconds: 2400, status: 'Completed' },
            { joinTime: '2026-08-06T15:00:00.000Z', leaveTime: '2026-08-06T15:12:00.000Z', durationSeconds: 720, status: 'Completed' }
          ]
        },
        {
          userId: 'admin_aicte',
          name: 'Dr. Abhay Jere',
          role: 'Admin',
          sessionsCount: 1,
          totalDurationSeconds: 9300,
          status: 'Offline',
          sessions: [{ joinTime: '2026-08-06T13:55:00.000Z', leaveTime: '2026-08-06T16:30:00.000Z', durationSeconds: 9300, status: 'Completed' }]
        }
      );
    }

    const localSess = JSON.parse(localStorage.getItem('local_attendance_sessions') || '[]');
    const currentMeetingSessions = localSess.filter(s => s.meetingId === meetingId);
    
    currentMeetingSessions.forEach(ls => {
      let group = defaultData.find(d => d.userId === ls.userId);
      if (!group) {
        group = {
          userId: ls.userId,
          name: ls.name,
          role: ls.role,
          sessionsCount: 0,
          totalDurationSeconds: 0,
          status: 'Offline',
          sessions: []
        };
        defaultData.push(group);
      }
      
      if (!group.sessions.some(s => s.joinTime === ls.joinTime)) {
        group.sessionsCount++;
        group.totalDurationSeconds += ls.durationSeconds;
        group.sessions.unshift({
          joinTime: ls.joinTime,
          leaveTime: ls.leaveTime,
          durationSeconds: ls.durationSeconds,
          status: ls.status
        });
        if (ls.status === 'Active') {
          group.status = 'Online';
        }
      }
    });

    return defaultData;
  },

  async getUserMeetingAttendance(meetingId, userId, credentials) {
    try {
      const authVal = `Bearer ${credentials.username}:${credentials.role}`;
      const res = await fetch(`${BASE_URL}/meetings/${meetingId}/attendance/${userId}`, {
        headers: { 'Authorization': authVal }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // ignore
    }

    const list = await this.getMeetingAttendance(meetingId, credentials);
    const userSess = list.find(l => l.userId === userId);
    if (userSess) return userSess;

    return {
      userId,
      name: credentials.username === 'student_rahul' ? 'Rahul Patel' : 'Dr. Abhay Jere',
      email: credentials.username === 'student_rahul' ? 'rahul.patel@sih.gov.in' : 'abhay.jere@aicte-india.org',
      role: credentials.role,
      totalDurationSeconds: 0,
      sessionsCount: 0,
      status: 'Offline',
      sessions: []
    };
  },

  async endMeeting(meetingId, credentials) {
    try {
      const authVal = `Bearer ${credentials.username}:${credentials.role}`;
      const res = await fetch(`${BASE_URL}/meetings/${meetingId}/end`, {
        method: 'POST',
        headers: { 'Authorization': authVal }
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend offline. Simulating endMeeting locally.");
    }
    
    const localSess = JSON.parse(localStorage.getItem('local_attendance_sessions') || '[]');
    const now = new Date();
    localSess.forEach(s => {
      if (s.meetingId === meetingId && s.status === 'Active') {
        s.status = 'Completed';
        s.leaveTime = now.toISOString();
        s.durationSeconds = Math.max(0, Math.floor((new Date(s.leaveTime) - new Date(s.joinTime)) / 1000));
      }
    });
    localStorage.setItem('local_attendance_sessions', JSON.stringify(localSess));
    return { success: true };
  }
};
