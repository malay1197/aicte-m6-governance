import { 
  LayoutDashboard, 
  UserCheck, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  Settings as SettingsIcon,
  Shield,
  Video,
  FolderOpen,
  Cpu,
  Link as LinkIcon,
  X,
  Film
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, unreadCount, criticalCount, isOpen, onClose }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'meetings', label: 'Meetings Portal', icon: Video },
    { id: 'recordings', label: 'Meeting Recordings', icon: Film },
    { id: 'files', label: 'Secure Files', icon: FolderOpen },
    { id: 'aimeeting', label: 'AI Intelligence', icon: Cpu },
    { id: 'blockchain', label: 'Ledger Verification', icon: LinkIcon },
    { id: 'attendance', label: 'Attendance Logs', icon: UserCheck },
    { id: 'audit', label: 'Audit Logs', icon: FileSpreadsheet, badge: criticalCount, badgeColor: 'bg-gov-danger' },
    { id: 'reports', label: 'Reports Engine', icon: FileText },
    { id: 'memory', label: 'Memory Search', icon: Search },
    { id: 'settings', label: 'Configurations', icon: SettingsIcon }
  ];

  return (
    <>
      {/* Mobile Sidebar overlay overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black bg-opacity-60 z-50 lg:hidden transition-opacity"
        />
      )}

      <aside className={`w-72 bg-gov-card border-r border-gov-border flex flex-col h-screen fixed lg:sticky top-0 z-50 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Brand Header */}
        <div className="p-6 border-b border-gov-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-gov-primary bg-opacity-20 p-2.5 rounded-lg text-gov-primaryLight ring-1 ring-gov-primary ring-opacity-30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black text-gov-text leading-tight tracking-wider uppercase">AICTE Portal</h1>
              <p className="text-[10px] text-gov-muted">M6 Audit & Governance</p>
            </div>
          </div>
          
          {/* Close button for Mobile drawers */}
          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 rounded hover:bg-gov-border text-gov-muted hover:text-gov-text transition cursor-pointer"
            title="Close Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="text-[9px] font-extrabold text-gov-muted uppercase tracking-wider px-3 mb-3">
            M6 Compliance Modules
          </div>
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onClose) onClose(); // Auto-close drawer on mobile tap
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-gov-primary bg-opacity-15 text-gov-primaryLight border-l-4 border-gov-primary shadow-glow-primary'
                    : 'text-gov-muted hover:bg-gov-border hover:text-gov-text'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gov-primaryLight' : 'text-gov-muted'}`} />
                  <span>{item.label}</span>
                </div>
                
                {item.badge > 0 && (
                  <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full text-white animate-pulse ${
                    item.badgeColor || 'bg-gov-primary'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-4 border-t border-gov-border bg-gov-dark bg-opacity-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gov-secondary flex items-center justify-center text-xs font-bold text-white shadow-glow-success">
              M6
            </div>
            <div>
              <p className="text-xs font-bold text-gov-text">Member 6 System</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gov-success animate-ping"></span>
                <span className="text-[9px] text-gov-success font-semibold">Ledger Anchors Synced</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
