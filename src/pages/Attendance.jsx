import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Activity,
  History,
  X,
  ArrowUpDown
} from 'lucide-react';
import { mockMeetings } from '../utils/mockData';
import { api } from '../utils/api';

export default function Attendance({ selectMeetingId, setSelectMeetingId, setActiveTab, user }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState(null);
  
  // Real-time ticking state to force 1-second dynamic UI duration updates
  const [tick, setTick] = useState(0);

  // Selected meeting logic
  const selectedMeeting = mockMeetings.find(m => m.id === selectMeetingId) || mockMeetings[0];

  // Fetch attendance from server/local fallback
  useEffect(() => {
    fetchLogs();
    
    // Near real-time updates: poll logs every 2 seconds
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, [selectMeetingId]);

  // Dynamic counting updates every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchLogs = async () => {
    try {
      const list = await api.getMeetingAttendance(selectMeetingId, user || { username: 'admin_aicte', role: 'Admin' });
      setAttendanceList(list);
    } catch (err) {
      console.error("Failed to load attendance logs:", err);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Online':
        return 'bg-gov-success bg-opacity-20 text-gov-success border-gov-success border-opacity-30 animate-pulse';
      case 'Offline':
      case 'Present':
        return 'bg-gov-primary bg-opacity-15 text-gov-primaryLight border-gov-primary border-opacity-20';
      case 'Absent':
      default:
        return 'bg-slate-700/20 text-slate-400 border-slate-700/30';
    }
  };

  const formatSeconds = (totalSec) => {
    if (!totalSec) return '0 min';
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    
    let result = '';
    if (hrs > 0) result += `${hrs}h `;
    if (mins > 0) result += `${mins}m `;
    if (secs > 0 || result === '') result += `${secs}s`;
    return result;
  };

  // Helper to calculate live ticking seconds for online participants
  const getLiveDurationSeconds = (student) => {
    let secs = student.totalDurationSeconds || 0;
    if (student.status === 'Online' && student.sessions) {
      const activeSess = student.sessions.find(s => s.status === 'Active');
      if (activeSess) {
        const joinTime = new Date(activeSess.joinTime);
        const liveSecs = Math.max(0, Math.floor((Date.now() - joinTime) / 1000));
        secs += liveSecs;
      }
    }
    return secs;
  };

  // Determine meeting target duration in minutes
  const meetingDurationMinutes = selectedMeeting.id === 'meet-001' ? 90 : 150;

  // Filter & Search logic
  const filteredList = attendanceList.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          student.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || 
                         (statusFilter === 'Online' && student.status === 'Online') ||
                         (statusFilter === 'Offline' && student.status === 'Offline');

    return matchesSearch && matchesStatus;
  });

  // Sort logic (by live ticking duration)
  const sortedList = [...filteredList].sort((a, b) => {
    const durA = getLiveDurationSeconds(a);
    const durB = getLiveDurationSeconds(b);
    return sortDirection === 'asc' 
      ? durA - durB
      : durB - durA;
  });

  const toggleSort = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleExportClick = () => {
    setActiveTab('reports');
  };

  // Count currently online participants
  const onlineCount = attendanceList.filter(s => s.status === 'Online').length;
  const uniqueParticipantsCount = attendanceList.length;
  
  const avgAttendancePct = attendanceList.length > 0
    ? Math.round(attendanceList.reduce((acc, curr) => {
        const liveSecs = getLiveDurationSeconds(curr);
        const pct = Math.min(100, Math.round((liveSecs / (meetingDurationMinutes * 60)) * 100));
        return acc + pct;
      }, 0) / attendanceList.length)
    : 0;

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
                    ? 'border-gov-primary/60 shadow-glow-primary bg-opacity-80' 
                    : 'hover:border-gov-border hover:bg-opacity-85'
                }`}
              >
                <div className="flex flex-col h-full justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-gov-muted font-mono">{meet.date}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        meet.status === 'Completed' ? 'bg-gov-success/15 text-gov-success' : 'bg-gov-warning/15 text-gov-warning animate-pulse'
                      }`}>
                        {meet.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-gov-text line-clamp-2 leading-snug">{meet.name}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-gov-border/30 pt-3 text-center text-xs">
                    <div>
                      <span className="text-gov-muted text-[10px] block">Duration</span>
                      <span className="font-semibold text-gov-text">{meet.id === 'meet-001' ? '90 mins' : '150 mins'}</span>
                    </div>
                    <div>
                      <span className="text-gov-primaryLight text-[10px] block">Participants</span>
                      <span className="font-semibold text-gov-primaryLight">{meet.totalParticipants}</span>
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
            <span className="flex items-center gap-1.5 text-gov-success font-semibold">
              <Activity className="w-3.5 h-3.5" /> Currently Online: {onlineCount}
            </span>
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

      {/* Meeting-level Cumulative Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="gov-card p-4 text-center border-gov-border/60">
          <span className="text-[10px] text-gov-muted block uppercase font-bold tracking-wider">Meeting Duration</span>
          <span className="text-sm font-bold text-gov-text mt-1.5 block">{meetingDurationMinutes} minutes</span>
        </div>
        <div className="gov-card p-4 text-center border-gov-border/60">
          <span className="text-[10px] text-gov-muted block uppercase font-bold tracking-wider">Total Participants</span>
          <span className="text-sm font-bold text-gov-primaryLight mt-1.5 block">{attendanceList.length}</span>
        </div>
        <div className="gov-card p-4 text-center border-gov-border/60">
          <span className="text-[10px] text-gov-muted block uppercase font-bold tracking-wider">Unique Participants</span>
          <span className="text-sm font-bold text-gov-success mt-1.5 block">{uniqueParticipantsCount}</span>
        </div>
        <div className="gov-card p-4 text-center border-gov-border/60">
          <span className="text-[10px] text-gov-muted block uppercase font-bold tracking-wider">Average Attendance</span>
          <span className="text-sm font-bold text-gov-warning mt-1.5 block">{avgAttendancePct}%</span>
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
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gov-dark/50 text-gov-muted font-bold border-b border-gov-border">
                <th className="py-4 px-6">Participant</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 cursor-pointer select-none" onClick={toggleSort}>
                  <div className="flex items-center gap-1 justify-end">
                    <span>Total Time</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-gov-muted" />
                  </div>
                </th>
                <th className="py-4 px-6 text-right">Attendance %</th>
                <th className="py-4 px-6 text-center">Join Sessions</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gov-border/30">
              {sortedList.length > 0 ? (
                sortedList.map((student) => {
                  const liveSecs = getLiveDurationSeconds(student);
                  const pct = Math.min(100, Math.round((liveSecs / (meetingDurationMinutes * 60)) * 100));
                  return (
                    <tr key={student.userId} className="hover:bg-gov-dark/20 transition-colors">
                      <td className="py-4 px-6 font-semibold text-gov-text">{student.name}</td>
                      <td className="py-4 px-6 text-gov-muted">{student.role}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusStyle(student.status)}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-semibold text-gov-primaryLight">
                        {formatSeconds(liveSecs)}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-gov-text">
                        {pct}%
                      </td>
                      <td className="py-4 px-6 text-center font-semibold text-gov-muted">
                        {student.sessionsCount} sessions
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => setSelectedStudentForHistory(student)}
                          className="px-3 py-1 bg-gov-dark border border-gov-border rounded hover:bg-slate-700 text-gov-text text-[10px] font-bold uppercase transition flex items-center gap-1 mx-auto"
                        >
                          <History className="w-3 h-3" />
                          <span>Logs</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gov-muted italic">
                    No matching attendance logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session History details Modal */}
      {selectedStudentForHistory && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gov-card border border-gov-border rounded-xl w-full max-w-lg overflow-hidden animate-slide-up shadow-glow-primary">
            <div className="p-6 bg-gov-border/40 border-b border-gov-border flex justify-between items-center">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-gov-primaryLight" />
                <h4 className="font-bold text-sm text-gov-text uppercase tracking-wide">
                  Session History: {selectedStudentForHistory.name}
                </h4>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedStudentForHistory(null)}
                className="text-gov-muted hover:text-gov-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[300px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gov-border/30 text-xs">
                <div>
                  <span className="text-gov-muted block uppercase font-bold text-[9px]">Total Time</span>
                  <span className="text-md font-bold text-gov-primaryLight">
                    {formatSeconds(getLiveDurationSeconds(selectedStudentForHistory))}
                  </span>
                </div>
                <div>
                  <span className="text-gov-muted block uppercase font-bold text-[9px]">Total Sessions</span>
                  <span className="text-md font-bold text-gov-success">
                    {selectedStudentForHistory.sessionsCount} sessions
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {selectedStudentForHistory.sessions && selectedStudentForHistory.sessions.length > 0 ? (
                  selectedStudentForHistory.sessions.map((sess, idx) => {
                    let duration = sess.durationSeconds || 0;
                    if (sess.status === 'Active') {
                      duration = Math.max(0, Math.floor((Date.now() - new Date(sess.joinTime)) / 1000));
                    }
                    return (
                      <div key={idx} className="flex justify-between items-center text-xs p-3 bg-gov-dark border border-gov-border rounded">
                        <div>
                          <span className="font-bold text-gov-text">Session {selectedStudentForHistory.sessions.length - idx}</span>
                          <p className="text-[10px] text-gov-muted mt-0.5 font-mono">
                            Join: {new Date(sess.joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            <br />
                            Leave: {sess.leaveTime ? new Date(sess.leaveTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Active...'}
                          </p>
                        </div>
                        <span className="font-bold text-gov-primaryLight font-mono">
                          {formatSeconds(duration)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-gov-muted italic text-center py-4">No sessions logged.</p>
                )}
              </div>
            </div>

            <div className="p-4 bg-gov-dark/50 border-t border-gov-border flex justify-end">
              <button
                onClick={() => setSelectedStudentForHistory(null)}
                className="px-4 py-2 rounded bg-gov-border text-gov-muted hover:bg-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
