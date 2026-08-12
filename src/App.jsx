import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Meetings from './pages/Meetings';
import VideoArchive from './pages/VideoArchive';
import Files from './pages/Files';
import AIMeeting from './pages/AIMeeting';
import Blockchain from './pages/Blockchain';
import Attendance from './pages/Attendance';
import AuditLogs from './pages/AuditLogs';
import Reports from './pages/Reports';
import Memory from './pages/Memory';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import { api } from './utils/api';

import { 
  mockNotifications as initialNotifications, 
  mockSecurityEvents as initialSecurityEvents 
} from './utils/mockData';

export default function App() {
  // Global states
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved : 'light';
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectMeetingId, setSelectMeetingId] = useState('meet-001');
  const [notifications, setNotifications] = useState(initialNotifications);
  const [securityEvents, setSecurityEvents] = useState(initialSecurityEvents);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlMeetingId = params.get('meetingId');
    if (urlMeetingId) {
      setSelectMeetingId(urlMeetingId);
      setActiveTab('meetings');
    }
  }, []);

  // Sync theme class to root html tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load data from persistent database on component mount or login
  useEffect(() => {
    if (user) {
      api.getNotifications().then(data => setNotifications(data));
      api.getSecurityEvents().then(data => setSecurityEvents(data));
    }
  }, [user]);

  // Compute live unread stats for header badges
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const criticalThreatsCount = securityEvents.filter(e => e.status === 'Active' && e.severity === 'CRITICAL').length;

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            setActiveTab={setActiveTab}
            setSelectMeetingId={setSelectMeetingId}
            securityEvents={securityEvents}
            setSecurityEvents={setSecurityEvents}
          />
        );
      case 'meetings':
        return <Meetings user={user} />;
      case 'recordings':
        return <VideoArchive />;
      case 'files':
        return <Files />;
      case 'aimeeting':
        return <AIMeeting />;
      case 'blockchain':
        return <Blockchain />;
      case 'attendance':
        return (
          <Attendance 
            selectMeetingId={selectMeetingId}
            setSelectMeetingId={setSelectMeetingId}
            setActiveTab={setActiveTab}
            user={user}
          />
        );
      case 'audit':
        return <AuditLogs />;
      case 'reports':
        return <Reports />;
      case 'memory':
        return <Memory />;
      case 'notifications':
        return (
          <Notifications 
            notifications={notifications} 
            setNotifications={setNotifications} 
          />
        );
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  // If user is not logged in, render the login page wall
  if (!user) {
    return (
      <div className="bg-gov-dark min-h-screen text-gov-text relative transition-colors duration-300">
        {/* Floating Theme Switcher on Login Page */}
        <div className="absolute top-6 right-6">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg bg-gov-card border border-gov-border text-gov-muted hover:text-gov-text transition duration-300 cursor-pointer"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <span className="text-amber-400 font-bold text-xs uppercase flex items-center gap-1.5">☀️ Light</span>
            ) : (
              <span className="text-indigo-600 font-bold text-xs uppercase flex items-center gap-1.5">🌙 Dark</span>
            )}
          </button>
        </div>
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="flex bg-gov-dark min-h-screen text-gov-text relative pb-8 transition-colors duration-300">
      
      {/* 1. Sidebar Nav Panel */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        unreadCount={unreadNotificationsCount}
        criticalCount={criticalThreatsCount}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. Main Right Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          activeTab={activeTab} 
          criticalCount={criticalThreatsCount}
          theme={theme}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
          onOpenSecurityPanel={() => {
            setActiveTab('dashboard');
          }}
          onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
        />
        
        {/* Scrollable View Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}
