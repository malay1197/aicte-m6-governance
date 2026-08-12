import React, { useState } from 'react';
import { 
  Database, 
  Cpu, 
  Link as LinkIcon, 
  User, 
  Activity,
  AlertTriangle,
  Sun,
  Moon,
  LogOut,
  Menu
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  criticalCount, 
  onOpenSecurityPanel, 
  theme, 
  toggleTheme, 
  onLogout,
  onMobileMenuToggle 
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Human readable title mapping
  const titleMap = {
    dashboard: 'Executive Overview & Audits',
    meetings: 'Secure Video Conferencing & Jitsi',
    recordings: 'Compliance Council Video Archives',
    files: 'Encrypted S3 Document Storage',
    aimeeting: 'Meeting Transcripts & Minutes',
    blockchain: 'Blockchain Integrity Ledger',
    attendance: 'Meeting Attendance Tracker',
    audit: 'System Activity logs',
    reports: 'Compliance & Analytics Reports',
    memory: 'Institutional Memory Search',
    settings: 'Security & Sync Configuration'
  };

  return (
    <header className="h-20 bg-gov-card border-b border-gov-border px-6 md:px-8 flex items-center justify-between sticky top-0 z-40 transition-colors duration-300">
      
      {/* Mobile Menu Trigger & Page Title */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onMobileMenuToggle} 
          className="lg:hidden p-2 rounded hover:bg-gov-border text-gov-muted hover:text-gov-text transition cursor-pointer"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm md:text-lg font-bold text-gov-text transition-colors">{titleMap[activeTab] || 'Secure AICTE Hub'}</h2>
          <p className="text-[10px] md:text-xs text-gov-muted mt-0.5">Government of India - Technical Education Council</p>
        </div>
      </div>

      {/* Sync Status Indicators */}
      <div className="hidden xl:flex items-center gap-5">
        {/* M1 Status */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-gov-dark/40 border border-gov-border">
          <User className="w-3.5 h-3.5 text-gov-success" />
          <span className="text-[9px] text-gov-muted uppercase font-extrabold">M1: Auth</span>
          <span className="text-[9px] text-gov-success font-extrabold">MFA ENFORCED</span>
        </div>

        {/* M4 Blockchain Status */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-gov-dark/40 border border-gov-border">
          <LinkIcon className="w-3.5 h-3.5 text-gov-success" />
          <span className="text-[9px] text-gov-muted uppercase font-extrabold">M4: Ledger</span>
          <span className="text-[9px] text-gov-success font-extrabold">SYNCED</span>
        </div>

        {/* M5 AI Analyzer Status */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-gov-dark/40 border border-gov-border">
          <Cpu className="w-3.5 h-3.5 text-gov-primaryLight" />
          <span className="text-[9px] text-gov-muted uppercase font-extrabold">M5: AI Engine</span>
          <span className="text-[9px] text-gov-primaryLight font-extrabold">ACTIVE</span>
        </div>

        {/* Critical Alerts Trigger */}
        {criticalCount > 0 && (
          <button 
            onClick={onOpenSecurityPanel}
            className="flex items-center gap-2 px-3 py-1 rounded bg-gov-danger/15 border border-gov-danger text-gov-danger hover:bg-opacity-25 animate-pulse transition-all cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">Threat Alerts ({criticalCount})</span>
          </button>
        )}
      </div>

      {/* Interactive Controls & Profile */}
      <div className="flex items-center gap-4">
        {/* Polished Theme Toggle Toggler */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-lg bg-gov-dark/40 border border-gov-border text-gov-muted hover:text-gov-text hover:border-gov-primary transition duration-300 relative overflow-hidden group cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          <div className="relative w-5 h-5 flex items-center justify-center transition-transform duration-500 rotate-0 group-hover:rotate-45">
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400 fill-amber-400 group-hover:scale-110 transition duration-300" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600 fill-indigo-600 group-hover:scale-110 transition duration-300" />
            )}
          </div>
        </button>

        {/* Admin Profile Details Dropdown */}
        <div className="flex items-center gap-3 pl-4 border-l border-gov-border relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 text-left focus:outline-none cursor-pointer"
            title="Profile details"
          >
            <div className="hidden md:block">
              <p className="text-xs font-bold text-gov-text">admin_aicte</p>
              <p className="text-[9px] text-gov-muted font-medium">Compliance Officer</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-gov-primary/10 border border-gov-primary/30 flex items-center justify-center text-gov-primaryLight hover:bg-opacity-25 transition">
              <User className="w-4 h-4" />
            </div>
          </button>

          {/* Quick Dropdown menu */}
          {showProfileMenu && (
            <div className="absolute right-0 top-12 w-44 bg-gov-card border border-gov-border rounded-lg shadow-lg py-1.5 z-50 animate-slide-up">
              <div className="px-4 py-2 border-b border-gov-border/35 md:hidden">
                <p className="text-xs font-bold text-gov-text">admin_aicte</p>
                <p className="text-[9px] text-gov-muted font-medium">Compliance Officer</p>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogout();
                }}
                className="w-full text-left px-4 py-2 hover:bg-gov-border text-gov-danger hover:text-gov-danger flex items-center gap-2 text-xs font-bold transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>SIGN OUT PORTAL</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
