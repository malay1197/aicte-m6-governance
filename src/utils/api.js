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
  }
};
