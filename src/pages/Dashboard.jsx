import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Percent, 
  ShieldAlert, 
  Clock, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Shield,
  Eye,
  Info
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { mockDashboardStats, mockMeetings, mockSecurityEvents } from '../utils/mockData';
import { api } from '../utils/api';

export default function Dashboard({ setActiveTab, setSelectMeetingId, securityEvents, setSecurityEvents }) {
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Statistics cards data
  const stats = [
    { title: 'Total Meetings Logged', value: mockDashboardStats.totalMeetings, icon: Calendar, color: 'text-gov-primaryLight', bg: 'bg-gov-primary bg-opacity-10' },
    { title: 'Total Governance Members', value: mockDashboardStats.totalParticipants, icon: Users, color: 'text-gov-secondaryLight', bg: 'bg-gov-secondary bg-opacity-10' },
    { title: 'Avg. Attendance Rate', value: mockDashboardStats.attendanceRate, icon: Percent, color: 'text-gov-success', bg: 'bg-gov-success bg-opacity-10' },
    { title: 'Active Security Events', value: securityEvents.filter(e => e.status === 'Active').length, icon: ShieldAlert, color: 'text-gov-danger', bg: 'bg-gov-danger bg-opacity-10' },
    { title: 'Pending Actions', value: mockDashboardStats.pendingActions, icon: Clock, color: 'text-gov-warning', bg: 'bg-gov-warning bg-opacity-10' }
  ];

  // Recharts Attendance Trend Data
  const attendanceTrendData = mockMeetings.map(m => ({
    name: m.name.split(' - ')[0],
    rate: Math.round((m.present / m.totalParticipants) * 100)
  }));

  // Recharts Category Data
  const categoryData = [
    { name: 'Review', value: 8 },
    { name: 'Evaluation', value: 12 },
    { name: 'Governance', value: 4 },
    { name: 'Welfare', value: 2 },
  ];

  // Recharts Alert Severity Pie Data
  const activeEventsCount = securityEvents.filter(e => e.status === 'Active').length;
  const resolvedEventsCount = securityEvents.filter(e => e.status === 'Resolved').length;
  const criticalCount = securityEvents.filter(e => e.severity === 'CRITICAL').length;
  const warningCount = securityEvents.filter(e => e.severity === 'WARNING').length;

  const severityPieData = [
    { name: 'Critical Alerts', value: criticalCount, color: '#ef4444' },
    { name: 'Warnings', value: warningCount, color: '#f59e0b' },
    { name: 'Info / Audit', value: securityEvents.filter(e => e.severity === 'INFO').length, color: '#3b82f6' }
  ];

  const handleResolveEvent = async (id) => {
    try {
      await api.resolveSecurityEvent(id);
    } catch(err) {
      console.error(err);
    }
    setSecurityEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'Resolved' } : e));
    setSelectedEvent(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="gov-card flex flex-col justify-between hover:border-gov-primary hover:border-opacity-35 transition-all">
              <div className="flex justify-between items-start">
                <span className="text-xs text-gov-muted font-medium uppercase tracking-wider">{item.title}</span>
                <div className={`p-2 rounded-lg ${item.bg}`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-gov-text">{item.value}</span>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-gov-success font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+4.2% from last month</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meeting Attendance Chart (Line) */}
        <div className="gov-card lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gov-text mb-4">Meeting Attendance Trends (%)</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e294b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#131c31', borderColor: '#1e294b', color: '#f8fafc' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }} 
                />
                <Line type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} name="Attendance %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Security Severity Distribution (Pie) */}
        <div className="gov-card">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gov-text mb-4">Alert Severity Distribution</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#131c31', borderColor: '#1e294b', color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around mt-2 text-xs">
            {severityPieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-gov-muted font-medium">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Security Operations Centre & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Security Events Overview Panel */}
        <div className="gov-card">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gov-text">Security Operations Centre</h3>
              <p className="text-xs text-gov-muted mt-0.5">Realtime threats monitoring dashboard (M6)</p>
            </div>
            <Shield className="w-5 h-5 text-gov-danger animate-pulse" />
          </div>

          {/* Severity Category Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-gov-danger bg-opacity-10 border border-gov-danger border-opacity-20 text-center">
              <span className="text-xs text-gov-muted block">Critical Events</span>
              <span className="text-xl font-bold text-gov-danger mt-1 block">{criticalCount}</span>
            </div>
            <div className="p-4 rounded-lg bg-gov-warning bg-opacity-10 border border-gov-warning border-opacity-20 text-center">
              <span className="text-xs text-gov-muted block">Warnings</span>
              <span className="text-xl font-bold text-gov-warning mt-1 block">{warningCount}</span>
            </div>
            <div className="p-4 rounded-lg bg-gov-primary bg-opacity-10 border border-gov-primary border-opacity-20 text-center">
              <span className="text-xs text-gov-muted block">Active Events</span>
              <span className="text-xl font-bold text-gov-primaryLight mt-1 block">{activeEventsCount}</span>
            </div>
            <div className="p-4 rounded-lg bg-gov-secondary bg-opacity-10 border border-gov-secondary border-opacity-20 text-center">
              <span className="text-xs text-gov-muted block">Resolved</span>
              <span className="text-xl font-bold text-gov-success mt-1 block">{resolvedEventsCount}</span>
            </div>
          </div>

          {/* Quick Threat Logs */}
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {securityEvents.map((evt) => (
              <div 
                key={evt.id} 
                className={`p-3 rounded-lg border flex justify-between items-center transition-all ${
                  evt.status === 'Active' 
                    ? evt.severity === 'CRITICAL' 
                      ? 'bg-gov-danger bg-opacity-5 border-gov-danger border-opacity-30 glow-red' 
                      : 'bg-gov-warning bg-opacity-5 border-gov-warning border-opacity-30'
                    : 'bg-gov-dark bg-opacity-40 border-gov-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  {evt.status === 'Active' ? (
                    <AlertTriangle className={`w-4 h-4 mt-0.5 ${evt.severity === 'CRITICAL' ? 'text-gov-danger' : 'text-gov-warning'}`} />
                  ) : (
                    <CheckCircle className="w-4 h-4 mt-0.5 text-gov-success" />
                  )}
                  <div>
                    <span className="text-xs font-semibold text-gov-text">{evt.title}</span>
                    <p className="text-[10px] text-gov-muted mt-0.5 line-clamp-1">{evt.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                    evt.status === 'Active' ? 'bg-gov-danger text-white' : 'bg-gov-success text-white'
                  }`}>
                    {evt.status}
                  </span>
                  <button 
                    onClick={() => setSelectedEvent(evt)}
                    className="p-1 rounded bg-gov-border text-gov-muted hover:text-gov-text hover:bg-slate-700"
                    title="View details & logs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="gov-card">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gov-text">Compliance Audit Stream</h3>
              <p className="text-xs text-gov-muted mt-0.5">M6 Audit and Compliance events logs</p>
            </div>
            <button 
              onClick={() => setActiveTab('audit')} 
              className="text-xs text-gov-primaryLight hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Full Audit Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {mockDashboardStats.recentActivities.map((act, idx) => (
              <div key={idx} className="flex gap-4 items-start p-2 rounded hover:bg-gov-border hover:bg-opacity-30 transition-all">
                <div className="w-2 h-2 rounded-full mt-2 bg-gov-primaryLight animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gov-text">{act.text}</p>
                  <span className="text-[10px] text-gov-muted block mt-0.5">{act.time}</span>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase bg-gov-border text-gov-muted`}>
                  {act.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gov-card border border-gov-border rounded-xl w-full max-w-lg overflow-hidden animate-slide-up shadow-glow-primary">
            
            {/* Modal Header */}
            <div className={`p-6 flex items-center gap-3 text-white ${
              selectedEvent.severity === 'CRITICAL' ? 'bg-gov-danger bg-opacity-20 border-b border-gov-danger border-opacity-30' : 'bg-gov-warning bg-opacity-20 border-b border-gov-warning border-opacity-30'
            }`}>
              <AlertTriangle className="w-5 h-5 text-gov-danger" />
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wide">Threat Mitigation & Details</h4>
                <p className="text-[10px] text-gov-muted">Incident Event ID: {selectedEvent.id}</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs text-gov-muted block font-semibold uppercase">Incident Description</span>
                <p className="text-xs text-gov-text mt-1 bg-gov-dark p-3 rounded border border-gov-border leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>

              <div>
                <span className="text-xs text-gov-muted block font-semibold uppercase">Remediation Status</span>
                <p className="text-xs text-gov-text mt-1 leading-relaxed">
                  {selectedEvent.details}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gov-muted font-semibold block uppercase">Timestamp</span>
                  <span className="text-gov-text font-mono block mt-0.5">{selectedEvent.timestamp}</span>
                </div>
                <div>
                  <span className="text-gov-muted font-semibold block uppercase">Severity Level</span>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    selectedEvent.severity === 'CRITICAL' ? 'bg-gov-danger text-white' : 'bg-gov-warning text-white'
                  }`}>
                    {selectedEvent.severity}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 bg-gov-dark bg-opacity-50 border-t border-gov-border flex justify-end gap-3">
              <button 
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded bg-gov-border text-gov-muted hover:bg-slate-700 hover:text-gov-text text-xs font-semibold"
              >
                Close Window
              </button>
              {selectedEvent.status === 'Active' && (
                <button 
                  onClick={() => handleResolveEvent(selectedEvent.id)}
                  className="px-4 py-2 rounded bg-gov-success text-white hover:bg-opacity-95 text-xs font-semibold shadow-glow-success"
                >
                  Mark as Resolved & Commit Hash
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
