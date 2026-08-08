import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ShieldAlert, 
  Terminal, 
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { mockAuditLogs } from '../utils/mockData';

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All');
  
  const [selectedLog, setSelectedLog] = useState(null);

  // Extract unique modules and users for dropdowns
  const uniqueModules = ['All', ...new Set(mockAuditLogs.map(log => log.module))];
  const uniqueUsers = ['All', ...new Set(mockAuditLogs.map(log => log.user))];

  // Filtering logic
  const filteredLogs = mockAuditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.includes(searchTerm);
    
    const matchesSeverity = severityFilter === 'All' || log.severity === severityFilter;
    const matchesModule = moduleFilter === 'All' || log.module === moduleFilter;
    const matchesUser = userFilter === 'All' || log.user === userFilter;

    return matchesSearch && matchesSeverity && matchesModule && matchesUser;
  });

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-gov-danger text-white border-gov-danger border-opacity-40 animate-pulse font-bold shadow-glow-danger';
      case 'WARNING':
        return 'bg-gov-warning text-gov-dark border-gov-warning border-opacity-40 font-bold';
      case 'INFO':
      default:
        return 'bg-gov-primary bg-opacity-20 text-gov-primaryLight border-gov-primary border-opacity-30';
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Success' || status === 'Resolved') {
      return 'text-gov-success bg-gov-success bg-opacity-10 border border-gov-success border-opacity-25';
    } else if (status === 'Failed' || status === 'Triggered') {
      return 'text-gov-danger bg-gov-danger bg-opacity-10 border border-gov-danger border-opacity-25';
    }
    return 'text-gov-warning bg-gov-warning bg-opacity-10 border border-gov-warning border-opacity-25';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Search and Advanced Filters Card */}
      <div className="gov-card space-y-4">
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-5 h-5 text-gov-primaryLight" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gov-text">Audit Log Filter Panel</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gov-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search actions, IPs, details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gov-dark border border-gov-border rounded text-xs text-gov-text focus:outline-none focus:border-gov-primary transition"
            />
          </div>

          {/* Severity filter */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full bg-gov-dark border border-gov-border rounded text-xs text-gov-text px-3 py-2 focus:outline-none focus:border-gov-primary"
            >
              <option value="All">All Severities</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          {/* Module filter */}
          <div>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full bg-gov-dark border border-gov-border rounded text-xs text-gov-text px-3 py-2 focus:outline-none focus:border-gov-primary"
            >
              <option value="All">All Modules</option>
              {uniqueModules.filter(m => m !== 'All').map(mod => (
                <option key={mod} value={mod}>{mod}</option>
              ))}
            </select>
          </div>

          {/* User filter */}
          <div>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full bg-gov-dark border border-gov-border rounded text-xs text-gov-text px-3 py-2 focus:outline-none focus:border-gov-primary"
            >
              <option value="All">All Users</option>
              {uniqueUsers.filter(u => u !== 'All').map(usr => (
                <option key={usr} value={usr}>{usr}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="gov-card p-0 overflow-hidden">
        <div className="p-6 border-b border-gov-border flex justify-between items-center bg-gov-card">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-gov-muted" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gov-text">System Audits Ledger</h3>
          </div>
          <span className="text-xs text-gov-muted font-medium">Showing {filteredLogs.length} matching event records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gov-dark bg-opacity-50 text-gov-muted font-bold border-b border-gov-border">
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Logged Action</th>
                <th className="py-4 px-6">System Module</th>
                <th className="py-4 px-6">IP / Terminal</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-center">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gov-border divide-opacity-35">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-gov-border hover:bg-opacity-15 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-6 font-mono text-gov-muted">{log.timestamp}</td>
                    <td className="py-4 px-6 font-semibold text-gov-text">{log.user}</td>
                    <td className="py-4 px-6 text-gov-text">
                      <span className="font-medium">{log.action}</span>
                      <p className="text-[10px] text-gov-muted mt-0.5 line-clamp-1">{log.details}</p>
                    </td>
                    <td className="py-4 px-6 font-mono text-gov-muted">{log.module}</td>
                    <td className="py-4 px-6 font-mono">{log.ip}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold ${getStatusBadge(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-3 py-1 rounded text-[10px] border ${getSeverityBadge(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gov-muted font-medium">
                    No matching activity logs discovered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gov-card border border-gov-border rounded-xl w-full max-w-lg overflow-hidden animate-slide-up shadow-glow-primary">
            
            {/* Modal Header */}
            <div className="p-6 bg-gov-border bg-opacity-40 border-b border-gov-border flex items-center gap-3">
              <Terminal className="w-5 h-5 text-gov-primaryLight" />
              <div>
                <h4 className="font-bold text-sm text-gov-text uppercase tracking-wide">Audit Log Registry Details</h4>
                <p className="text-[10px] text-gov-muted">Event Reference: {selectedLog.id}</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs text-gov-muted block font-semibold uppercase">Action Performed</span>
                <p className="text-xs text-gov-text font-bold mt-1 bg-gov-dark p-2.5 rounded border border-gov-border">
                  {selectedLog.action}
                </p>
              </div>

              <div>
                <span className="text-xs text-gov-muted block font-semibold uppercase">System Message & Context</span>
                <p className="text-xs text-gov-text mt-1 leading-relaxed bg-gov-dark p-3 rounded border border-gov-border font-mono text-opacity-90">
                  {selectedLog.details}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gov-muted font-semibold block uppercase">Timestamp</span>
                  <span className="text-gov-text font-mono block mt-0.5">{selectedLog.timestamp}</span>
                </div>
                <div>
                  <span className="text-gov-muted font-semibold block uppercase">Initiating User</span>
                  <span className="text-gov-text font-bold block mt-0.5">{selectedLog.user}</span>
                </div>
                <div>
                  <span className="text-gov-muted font-semibold block uppercase">Origin Terminal IP</span>
                  <span className="text-gov-text font-mono block mt-0.5">{selectedLog.ip}</span>
                </div>
                <div>
                  <span className="text-gov-muted font-semibold block uppercase">Target Module</span>
                  <span className="text-gov-text font-mono block mt-0.5">{selectedLog.module}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 bg-gov-dark bg-opacity-50 border-t border-gov-border flex justify-end">
              <button 
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded bg-gov-primary text-white hover:bg-opacity-95 text-xs font-semibold shadow-glow-primary"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
