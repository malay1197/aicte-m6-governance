import React from 'react';
import { 
  Settings as SettingsIcon, 
  RefreshCw, 
  ShieldAlert, 
  Database, 
  CheckCircle,
  FileCode,
  Link as LinkIcon,
  Cpu
} from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Sync configuration panel */}
      <div className="gov-card space-y-6">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-5 h-5 text-gov-primaryLight" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gov-text">Compliance Cell Sync Configurations</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* M1 Auth Sync */}
          <div className="p-4 rounded-xl border border-gov-border bg-gov-dark bg-opacity-40 space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-gov-muted uppercase font-bold">M1 Authentication Shield</span>
              <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-gov-success text-white">ACTIVE</span>
            </div>
            <p className="text-xs text-gov-text leading-snug">
              Syncing user roles, authorization keys, and multi-factor session validation metadata.
            </p>
            <div className="text-[10px] text-gov-muted font-mono bg-gov-card p-2 rounded">
              Endpoint: /api/auth/verify-role
            </div>
          </div>

          {/* M4 Blockchain Sync */}
          <div className="p-4 rounded-xl border border-gov-border bg-gov-dark bg-opacity-40 space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-gov-muted uppercase font-bold">M4 Blockchain Ledger Link</span>
              <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-gov-success text-white">CONNECTED</span>
            </div>
            <p className="text-xs text-gov-text leading-snug">
              Anchoring audit compliance hashes and governance decisions to decentralized consensus blocks.
            </p>
            <div className="text-[10px] text-gov-muted font-mono bg-gov-card p-2 rounded">
              Node IP: 192.168.12.24:8545
            </div>
          </div>

          {/* M5 AI Sync */}
          <div className="p-4 rounded-xl border border-gov-border bg-gov-dark bg-opacity-40 space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-gov-muted uppercase font-bold">M5 AI Analyzer Engine</span>
              <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-gov-primary text-white">STANDBY</span>
            </div>
            <p className="text-xs text-gov-text leading-snug">
              Ingesting automated meeting transcript summaries, decision highlights, and compliance keywords.
            </p>
            <div className="text-[10px] text-gov-muted font-mono bg-gov-card p-2 rounded">
              GPU Pool: cluster-ai-node-3
            </div>
          </div>
        </div>
      </div>

      {/* Retention policies & Security configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Retention policies */}
        <div className="gov-card space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gov-text">Audit Log Archiving Policies</h3>
          <div className="space-y-4 text-xs text-gov-muted">
            <div className="flex justify-between items-center py-2 border-b border-gov-border border-opacity-35">
              <span>Log Retention Period</span>
              <span className="text-gov-text font-bold">365 Days (1 Year)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gov-border border-opacity-35">
              <span>Blockchain Anchoring Cycle</span>
              <span className="text-gov-text font-bold">Every Saturday 18:00 UTC</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gov-border border-opacity-35">
              <span>Emergency Log Quarantine Threshold</span>
              <span className="text-gov-text font-bold">5 critical alarms/min</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>Audit Hash Signature Standard</span>
              <span className="text-gov-text font-bold">SHA-256 / Ed25519</span>
            </div>
          </div>
        </div>

        {/* Security parameters */}
        <div className="gov-card space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gov-text">Security Admin Credentials</h3>
          <div className="space-y-4 text-xs text-gov-muted">
            <div className="flex justify-between items-center py-2 border-b border-gov-border border-opacity-35">
              <span>Active Compliance Officer ID</span>
              <span className="text-gov-text font-mono font-bold">admin_aicte</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gov-border border-opacity-35">
              <span>Security Access Key Fingerprint</span>
              <span className="text-gov-text font-mono">ED25519-8b43f9a7...10bc</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gov-border border-opacity-35">
              <span>MFA Encryption Protocol</span>
              <span className="text-gov-text font-bold">AES-256-GCM / TOTP</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>Gateway Node Integrity</span>
              <span className="text-gov-success font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> SECURE MATCH
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
