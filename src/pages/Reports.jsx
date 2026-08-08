import React, { useState } from 'react';
import { 
  FileText, 
  Settings, 
  Play, 
  Download, 
  FileSpreadsheet, 
  Eye, 
  CheckCircle,
  FileCode,
  Link as LinkIcon
} from 'lucide-react';
import { mockMeetings, mockAuditLogs, mockSecurityEvents } from '../utils/mockData';

export default function Reports() {
  const [reportType, setReportType] = useState('attendance');
  const [selectedMeetingId, setSelectedMeetingId] = useState(mockMeetings[0].id);
  const [dateRange, setDateRange] = useState({ start: '2026-08-01', end: '2026-08-08' });
  const [isCompiling, setIsCompiling] = useState(false);
  const [compiledReport, setCompiledReport] = useState(null);

  const reportOptions = [
    { id: 'attendance', name: 'Meeting Attendance Report', description: 'Detailed registry of participants, durations, late entries, and absences.' },
    { id: 'activity', name: 'Meeting Activity Report', description: 'Breakdown of governance categories, session lengths, and creation logs.' },
    { id: 'security', name: 'Security Audit Report', description: 'Registry of failed logins, unauthorized access triggers, and remediation logs.' },
    { id: 'participant', name: 'Participant Report', description: 'Logs focusing on individual board members and their overall attendance records.' },
    { id: 'decision', name: 'Decision/Action Report', description: 'Decisions verified with blockchain signature references.' }
  ];

  const handleCompile = () => {
    setIsCompiling(true);
    setTimeout(() => {
      // Pick data based on selected meeting
      const meeting = mockMeetings.find(m => m.id === selectedMeetingId) || mockMeetings[0];
      
      let data = {};
      if (reportType === 'attendance') {
        data = {
          title: `Attendance Audit: ${meeting.name}`,
          meta: [
            { label: 'Meeting Date', value: meeting.date },
            { label: 'Total Invitees', value: meeting.totalParticipants },
            { label: 'Attended Present', value: meeting.present },
            { label: 'Late Arrivals', value: meeting.late },
            { label: 'Absent Attendees', value: meeting.absent }
          ],
          rows: meeting.participants.map(p => ({
            col1: p.name,
            col2: p.role,
            col3: p.joinTime,
            col4: p.leaveTime,
            col5: p.status
          })),
          headers: ['Participant Name', 'Governance Role', 'Join Timestamp', 'Leave Timestamp', 'Attendance Status']
        };
      } else if (reportType === 'security') {
        data = {
          title: `Security System Audit Report`,
          meta: [
            { label: 'Audit Range', value: `${dateRange.start} to ${dateRange.end}` },
            { label: 'Critical Threat Alerts', value: mockSecurityEvents.filter(e => e.severity === 'CRITICAL').length },
            { label: 'Warnings Flagged', value: mockSecurityEvents.filter(e => e.severity === 'WARNING').length },
            { label: 'Remediation Status', value: '100% Resolved / Shield Active' }
          ],
          rows: mockSecurityEvents.map(e => ({
            col1: e.timestamp,
            col2: e.title,
            col3: e.severity,
            col4: e.status,
            col5: e.details.substring(0, 45) + '...'
          })),
          headers: ['Event Date', 'Security Threat Detected', 'Severity', 'Current Status', 'Mitigation/Action Logs']
        };
      } else {
        // Fallback or Decison Report
        data = {
          title: `Governance Decisions Summary & Ledger Hash List`,
          meta: [
            { label: 'Compliance Index', value: 'ISO 27001 / SIH Gov standard' },
            { label: 'Consensus Rate', value: '100% Board Agreement' },
            { label: 'Blockchain Sync Status', value: 'Decentralized Commits Verified' }
          ],
          rows: mockMeetings.map(m => ({
            col1: m.name,
            col2: m.date,
            col3: 'Consensus Approved',
            col4: '0x3af8...92bc',
            col5: 'Verified Ledger'
          })),
          headers: ['Meeting Target', 'Resolution Date', 'Decision Consensus', 'Blockchain Reference Block', 'Ledger Integrity']
        };
      }

      setCompiledReport({
        id: `REP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleString(),
        type: reportType,
        details: data
      });
      setIsCompiling(false);
    }, 1000);
  };

  const handleCSVExport = () => {
    if (!compiledReport) return;
    const details = compiledReport.details;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += details.headers.join(",") + "\n";
    details.rows.forEach(row => {
      csvContent += [row.col1, row.col2, row.col3, row.col4, row.col5].map(v => `"${v}"`).join(",") + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${compiledReport.id}_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start animate-fade-in">
      
      {/* Configuration Panel */}
      <div className="gov-card space-y-6 xl:col-span-1">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-gov-primaryLight" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gov-text">Report Parameters</h3>
        </div>

        <div className="space-y-4 text-xs">
          {/* Report Type */}
          <div className="space-y-1.5">
            <label className="text-gov-muted font-semibold uppercase">Report Template</label>
            <div className="space-y-2">
              {reportOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setReportType(opt.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                    reportType === opt.id 
                      ? 'border-gov-primary bg-gov-primary bg-opacity-10 text-gov-primaryLight' 
                      : 'border-gov-border hover:bg-slate-800 text-gov-muted'
                  }`}
                >
                  <span className="font-bold block text-gov-text">{opt.name}</span>
                  <p className="text-[10px] mt-0.5 leading-snug">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Meeting Selection (Only for meeting-level reports) */}
          {(reportType === 'attendance' || reportType === 'participant') && (
            <div className="space-y-1.5">
              <label className="text-gov-muted font-semibold uppercase">Target Meeting</label>
              <select
                value={selectedMeetingId}
                onChange={(e) => setSelectedMeetingId(e.target.value)}
                className="w-full bg-gov-dark border border-gov-border rounded px-3 py-2 text-gov-text focus:outline-none focus:border-gov-primary"
              >
                {mockMeetings.map(meet => (
                  <option key={meet.id} value={meet.id}>{meet.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Date range selection */}
          <div className="space-y-1.5">
            <label className="text-gov-muted font-semibold uppercase">Compilation Audit Period</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="bg-gov-dark border border-gov-border rounded px-3 py-2 text-gov-text focus:outline-none focus:border-gov-primary"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="bg-gov-dark border border-gov-border rounded px-3 py-2 text-gov-text focus:outline-none focus:border-gov-primary"
              />
            </div>
          </div>

          {/* Compile Button */}
          <button
            onClick={handleCompile}
            disabled={isCompiling}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded bg-gov-primary text-white hover:bg-opacity-95 font-semibold transition shadow-glow-primary disabled:opacity-50"
          >
            {isCompiling ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>Compile Audit Report</span>
          </button>
        </div>
      </div>

      {/* PDF Document Preview Canvas */}
      <div className="xl:col-span-2 space-y-4">
        
        {/* Actions panel */}
        <div className="gov-card flex items-center justify-between py-4 bg-opacity-40">
          <span className="text-xs text-gov-muted font-medium">Document Engine Preview Canvas</span>
          
          <div className="flex gap-2">
            <button
              onClick={handleCSVExport}
              disabled={!compiledReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gov-border text-gov-muted hover:text-gov-text disabled:opacity-50 text-xs font-semibold"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              disabled={!compiledReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-gov-primary text-white hover:bg-opacity-90 disabled:opacity-50 text-xs font-semibold shadow-glow-primary"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF / Print</span>
            </button>
          </div>
        </div>

        {/* Live Preview Sheet */}
        {compiledReport ? (
          <div className="bg-white text-slate-800 rounded-xl p-8 shadow-2xl space-y-8 min-h-[600px] border border-slate-300 relative overflow-hidden animate-slide-up">
            
            {/* National Emblem & AICTE Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-6">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-900">AICTE Security & Governance Council</h2>
                <p className="text-[10px] text-slate-600 font-semibold tracking-wider">COMPLIANCE REPORTING & AUDITS ENGINE (M6)</p>
              </div>
              <div className="text-right text-xs">
                <span className="font-mono font-bold block text-slate-900">{compiledReport.id}</span>
                <span className="text-[9px] text-slate-500 block">{compiledReport.timestamp}</span>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center space-y-1">
              <h1 className="text-lg font-black uppercase text-slate-900">{compiledReport.details.title}</h1>
              <p className="text-xs text-slate-500 font-semibold">Under governance framework AICTE-SEC-2026</p>
            </div>

            {/* Report Metadata */}
            <div className="grid grid-cols-2 gap-4 bg-slate-100 p-4 rounded border border-slate-300 text-xs">
              {compiledReport.details.meta.map((m, idx) => (
                <div key={idx} className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500 font-bold">{m.label}:</span>
                  <span className="text-slate-800 font-semibold font-mono">{m.value}</span>
                </div>
              ))}
            </div>

            {/* Main Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase">Compiled Session Audits Records</h3>
              <table className="w-full text-left text-[10px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-200 border-b border-slate-300 text-slate-700 font-bold uppercase">
                    {compiledReport.details.headers.map((h, idx) => (
                      <th key={idx} className="py-2 px-3 border border-slate-300">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {compiledReport.details.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 text-slate-800">
                      <td className="py-2.5 px-3 border border-slate-300 font-bold">{row.col1}</td>
                      <td className="py-2.5 px-3 border border-slate-300">{row.col2}</td>
                      <td className="py-2.5 px-3 border border-slate-300 font-mono">{row.col3}</td>
                      <td className="py-2.5 px-3 border border-slate-300 font-mono">{row.col4}</td>
                      <td className="py-2.5 px-3 border border-slate-300 text-center font-bold">{row.col5}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Blockchain Sync Signature & Signatures */}
            <div className="pt-8 border-t border-slate-200 flex justify-between items-end">
              <div className="space-y-2 text-[9px] text-slate-500 font-medium max-w-sm">
                <div className="flex items-center gap-1 text-slate-800 font-bold">
                  <LinkIcon className="w-3 h-3" />
                  <span>Ledger Integrity Lock</span>
                </div>
                <p className="leading-snug">
                  This report's digital signature hash was committed to the AICTE Governance Blockchain (M4). 
                  Transaction hash: <span className="font-mono text-slate-700 font-bold">0x8a92fbcd9a928ef782bcf9287cba1192e8bf77a8</span>
                </p>
              </div>

              <div className="text-right text-[10px] space-y-12">
                <div className="w-40 border-b border-slate-400 mx-auto"></div>
                <div>
                  <span className="font-bold block text-slate-900">Compliance Officer</span>
                  <span className="text-[8px] text-slate-500 block uppercase">Audit & Governance cell</span>
                </div>
              </div>
            </div>

            {/* Decorative Ribbon */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-900 transform translate-x-16 -translate-y-16 rotate-45 border border-slate-700 pointer-events-none" />

          </div>
        ) : (
          <div className="bg-gov-card border border-gov-border rounded-xl p-8 min-h-[500px] flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 rounded-full bg-gov-border text-gov-muted">
              <FileCode className="w-12 h-12" />
            </div>
            <div>
              <h4 className="text-md font-bold text-gov-text">Compliance Reporting Engine Idle</h4>
              <p className="text-xs text-gov-muted max-w-sm mt-1 mx-auto leading-relaxed">
                Choose a template type on the left panel, configure the required date filters, and click "Compile Audit Report" to build the ledger preview.
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
