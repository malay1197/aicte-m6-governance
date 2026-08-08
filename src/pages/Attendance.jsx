import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { mockMeetings } from '../utils/mockData';

export default function Attendance({ selectMeetingId, setSelectMeetingId, setActiveTab }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  // Selected meeting logic
  const selectedMeeting = mockMeetings.find(m => m.id === selectMeetingId) || mockMeetings[0];

  // Filtering participants of the selected meeting
  const filteredParticipants = selectedMeeting.participants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-gov-success bg-opacity-10 text-gov-success border-gov-success border-opacity-30';
      case 'Late':
        return 'bg-gov-warning bg-opacity-10 text-gov-warning border-gov-warning border-opacity-30';
      case 'Left Early':
        return 'bg-gov-danger bg-opacity-10 text-gov-danger border-gov-danger border-opacity-30';
      case 'Absent':
        return 'bg-gov-muted bg-opacity-15 text-gov-muted border-gov-border';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  const handleExportClick = () => {
    setActiveTab('reports');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Meeting Selection Cards */}
      <div>
        <h3 className="text-xs font-semibold text-gov-muted uppercase tracking-wider mb-4">Select Governance Meeting</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockMeetings.map((meet) => {
            const isSelected = meet.id === selectedMeeting.id;
            return (
              <button
                key={meet.id}
                onClick={() => setSelectMeetingId(meet.id)}
                className={`gov-card text-left transition-all relative overflow-hidden ${
                  isSelected 
                    ? 'border-gov-primary border-opacity-60 shadow-glow-primary bg-opacity-80' 
                    : 'hover:border-gov-border hover:bg-opacity-85'
                }`}
              >
                <div className="flex flex-col h-full justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-gov-muted font-mono">{meet.date}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        meet.status === 'Completed' ? 'bg-gov-success bg-opacity-15 text-gov-success' : 'bg-gov-warning bg-opacity-15 text-gov-warning'
                      }`}>
                        {meet.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-gov-text line-clamp-2 leading-snug">{meet.name}</h4>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-gov-border border-opacity-30 pt-3 text-center text-xs">
                    <div>
                      <span className="text-gov-muted text-[10px] block">Total</span>
                      <span className="font-semibold text-gov-text">{meet.totalParticipants}</span>
                    </div>
                    <div>
                      <span className="text-gov-success text-[10px] block">Present</span>
                      <span className="font-semibold text-gov-success">{meet.present}</span>
                    </div>
                    <div>
                      <span className="text-gov-danger text-[10px] block">Absent</span>
                      <span className="font-semibold text-gov-danger">{meet.absent}</span>
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute right-0 top-0 w-2.5 h-full bg-gov-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Meeting Summary Panel */}
      <div className="gov-card flex flex-col md:flex-row md:items-center justify-between gap-6 bg-opacity-40">
        <div className="space-y-1">
          <span className="text-xs text-gov-primaryLight font-semibold uppercase tracking-wide">Currently Selected</span>
          <h3 className="text-md font-bold text-gov-text">{selectedMeeting.name}</h3>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gov-muted pt-1">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{selectedMeeting.date}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{selectedMeeting.startTime} - {selectedMeeting.endTime}</span>
            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{selectedMeeting.present} of {selectedMeeting.totalParticipants} Attended</span>
          </div>
        </div>

        <div>
          <button 
            onClick={handleExportClick}
            className="flex items-center gap-2 px-4 py-2 rounded bg-gov-primary text-white hover:bg-opacity-90 font-semibold text-xs transition shadow-glow-primary"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Report & Audits</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Table */}
      <div className="gov-card p-0 overflow-hidden">
        {/* Table Filters Header */}
        <div className="p-6 border-b border-gov-border flex flex-col md:flex-row gap-4 items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gov-text">Participant Attendance Log</h3>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-gov-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-gov-dark border border-gov-border rounded text-xs text-gov-text focus:outline-none focus:border-gov-primary transition"
              />
            </div>

            {/* Filter by Attendance Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gov-dark border border-gov-border rounded text-xs text-gov-text px-3 py-1.5 focus:outline-none focus:border-gov-primary"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Left Early">Left Early</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>

        {/* Participant Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gov-dark bg-opacity-50 text-gov-muted font-bold border-b border-gov-border">
                <th className="py-4 px-6">Participant</th>
                <th className="py-4 px-6">Official Role</th>
                <th className="py-4 px-6">Join Time</th>
                <th className="py-4 px-6">Leave Time</th>
                <th className="py-4 px-6">Duration</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gov-border divide-opacity-35">
              {filteredParticipants.length > 0 ? (
                filteredParticipants.map((p) => (
                  <tr key={p.id} className="hover:bg-gov-border hover:bg-opacity-10 transition-colors">
                    <td className="py-4 px-6 font-semibold text-gov-text">{p.name}</td>
                    <td className="py-4 px-6 text-gov-muted font-medium">{p.role}</td>
                    <td className="py-4 px-6 font-mono">{p.joinTime}</td>
                    <td className="py-4 px-6 font-mono">{p.leaveTime}</td>
                    <td className="py-4 px-6 font-medium text-gov-muted">{p.duration}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-semibold border ${getStatusStyle(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gov-muted font-medium">
                    No participants matched the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
