import React from 'react';
import { api } from '../utils/api';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  UserCheck, 
  Info 
} from 'lucide-react';

export default function Notifications({ notifications, setNotifications }) {
  
  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
    } catch(err) {
      console.error(err);
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Find all unread and commit read status
      const unreadList = notifications.filter(n => !n.read);
      for (let n of unreadList) {
        await api.markNotificationRead(n.id);
      }
    } catch(err) {
      console.error(err);
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getPriorityStyle = (priority, isRead) => {
    if (isRead) return 'border-gov-border bg-gov-dark/30 opacity-60';
    switch (priority) {
      case 'CRITICAL':
        return 'border-gov-danger bg-gov-danger/5 glow-red';
      case 'HIGH':
        return 'border-gov-warning bg-gov-warning/5';
      case 'MEDIUM':
      default:
        return 'border-gov-primary/40 bg-gov-primary/5';
    }
  };

  const getPriorityLabelColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-gov-danger text-white';
      case 'HIGH': return 'bg-gov-warning text-gov-dark';
      case 'MEDIUM': return 'bg-gov-primary text-white';
      default: return 'bg-gov-border text-gov-muted';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'security':
        return <AlertTriangle className="w-5 h-5 text-gov-danger" />;
      case 'reminder':
        return <Calendar className="w-5 h-5 text-gov-warning" />;
      case 'action':
        return <Check className="w-5 h-5 text-gov-primaryLight" />;
      case 'report':
        return <FileText className="w-5 h-5 text-gov-success" />;
      case 'attendance':
        return <UserCheck className="w-5 h-5 text-gov-muted" />;
      default:
        return <Info className="w-5 h-5 text-gov-muted" />;
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Control Actions Header */}
      <div className="gov-card flex justify-between items-center py-4 bg-opacity-40">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-gov-primaryLight" />
          <span className="text-xs text-gov-muted font-semibold uppercase tracking-wider">
            {unreadNotifications.length} Unread Notifications
          </span>
        </div>

        {unreadNotifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1 text-xs text-gov-primaryLight hover:underline font-semibold"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border flex justify-between items-center gap-4 transition-all ${getPriorityStyle(
                notif.priority,
                notif.read
              )}`}
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-gov-dark border border-gov-border">
                  {getNotificationIcon(notif.type)}
                </div>
                
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${getPriorityLabelColor(notif.priority)}`}>
                      {notif.priority}
                    </span>
                    <span className="text-[10px] text-gov-muted font-mono">{notif.timestamp}</span>
                  </div>
                  <p className={`text-xs text-gov-text leading-relaxed ${notif.read ? 'line-through text-opacity-50' : 'font-semibold'}`}>
                    {notif.message}
                  </p>
                </div>
              </div>

              {!notif.read && (
                <button
                  onClick={() => handleMarkAsRead(notif.id)}
                  className="p-2 rounded bg-gov-border text-gov-muted hover:text-gov-text hover:bg-slate-700 transition"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="gov-card p-12 text-center text-gov-muted">
            <p className="text-xs font-medium">All notifications have been resolved.</p>
          </div>
        )}
      </div>

    </div>
  );
}
