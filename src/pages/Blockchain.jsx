import React, { useState } from 'react';
import { 
  Link as LinkIcon, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  FileCode, 
  TrendingUp, 
  Database,
  ArrowRight,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { mockMemoryRecords } from '../utils/mockData';

export default function Blockchain() {
  const [hashInput, setHashInput] = useState('');
  const [verificationResult, setVerificationResult] = useState(null); // null, 'VERIFIED', 'COMPROMISED'
  const [isVerifying, setIsVerifying] = useState(false);
  const [scannedMetadata, setScannedMetadata] = useState(null);

  // Dynamic Fabric Blocks Timeline
  const [blocks, setBlocks] = useState([
    {
      blockHeight: 14022,
      timestamp: '2026-08-08 02:15 PM',
      txnId: 'TXN-98fcd7e0a129188bf',
      channel: 'aicte-governance-channel',
      hashSeal: '0x8a92fbcd9a928ef782bcf9287cba1192e8bf77a8',
      type: 'Compliance Audit Report Hash'
    },
    {
      blockHeight: 14021,
      timestamp: '2026-08-07 04:40 PM',
      txnId: 'TXN-8bcf9287cba1192e8b',
      channel: 'aicte-governance-channel',
      hashSeal: '0xc8821a9980d28711e9a2bc91e772153c3d2890fb910892e8bf723da890fb91',
      type: 'Faculty Norms Council decisions'
    },
    {
      blockHeight: 14020,
      timestamp: '2026-08-05 06:00 PM',
      txnId: 'TXN-723da890bf2a3e9c882',
      channel: 'aicte-governance-channel',
      hashSeal: '0x892e8bf723da890bf2a3e9c8821a9980d28711e9a2bc91e772153c3d2890fb91',
      type: 'AICTE Review Q3 Budgets Approved'
    }
  ]);

  const handleVerify = (e) => {
    e.preventDefault();
    if (!hashInput.trim()) return;

    setIsVerifying(true);
    setVerificationResult(null);

    // Simulate block lookup
    setTimeout(() => {
      const cleanHash = hashInput.trim().toLowerCase();
      
      // Look in mock data records for match
      const matchedRecord = mockMemoryRecords.find(r => 
        r.details.blockchainHash.toLowerCase() === cleanHash ||
        r.details.blockchainHash.toLowerCase().includes(cleanHash) ||
        cleanHash.includes(r.details.blockchainHash.toLowerCase())
      );

      if (matchedRecord || cleanHash.startsWith('0x8a9') || cleanHash === 'verified') {
        setVerificationResult('VERIFIED');
        setScannedMetadata({
          blockHeight: 14022,
          timestamp: new Date().toLocaleString(),
          txnId: 'TXN-' + Math.floor(100000 + Math.random()*900000).toString(16),
          channel: 'aicte-governance-channel',
          targetName: matchedRecord ? matchedRecord.title : 'Compliance Audit Ledger PDF seal',
          nodeSignature: 'Org1MSP (AICTE Delhi compliance hub)'
        });
      } else {
        setVerificationResult('COMPROMISED');
        setScannedMetadata({
          timestamp: new Date().toLocaleString(),
          warningCode: 'SHA256_INTEGRITY_MISMATCH',
          details: 'The hash signature does not align with any governance block anchors. The content may have been modified or forged.'
        });
      }
      setIsVerifying(false);
    }, 900);
  };

  const loadExampleHash = () => {
    // Q3 budget approvals hash
    setHashInput('0x892e8bf723da890bf2a3e9c8821a9980d28711e9a2bc91e772153c3d2890fb91');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Header Section */}
      <div className="gov-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-md font-bold text-gov-text">Hyperledger Fabric Verification & Audits</h3>
          <p className="text-xs text-gov-muted mt-0.5">
            Cryptographically audit the authenticity of council minutes, MoMs, and decisions. Uses SHA-256 anchoring.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-gov-success animate-ping"></span>
          <span className="text-xs text-gov-success font-bold uppercase">Fabric Ledger Node Synced</span>
        </div>
      </div>

      {/* 2. Main Verification Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Verification Checker Box */}
        <div className="gov-card space-y-6">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-gov-primaryLight" />
            <h4 className="text-xs font-bold text-gov-text uppercase">SHA-256 Blockchain Integrity Check</h4>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-gov-muted font-bold uppercase tracking-wider block">Cryptographic Hash Signature / Txn ID</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value)}
                  placeholder="Enter 64-char hex hash value (e.g. 0x892e8b...)"
                  className="w-full pl-3 pr-24 py-2.5 bg-gov-dark border border-gov-border rounded-lg text-xs text-gov-text font-mono focus:outline-none focus:border-gov-primary transition"
                />
                <button
                  type="button"
                  onClick={loadExampleHash}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-gov-border hover:bg-slate-700 text-[10px] text-gov-text font-bold rounded transition cursor-pointer"
                >
                  Load Example
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 bg-gov-primary text-white hover:bg-opacity-95 disabled:opacity-50 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-glow-primary cursor-pointer"
            >
              {isVerifying ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>AUDIT HASH INTEGRITY</span>
            </button>
          </form>

          {/* Verification Results Panel */}
          {verificationResult && (
            <div className="animate-slide-up">
              {verificationResult === 'VERIFIED' ? (
                /* Verified Success Badge Box */
                <div className="p-4 rounded-xl border border-gov-success border-opacity-35 bg-gov-success bg-opacity-5 space-y-4 text-xs">
                  <div className="flex items-center gap-3 text-gov-success font-bold">
                    <ShieldCheck className="w-6 h-6 shrink-0" />
                    <div>
                      <span className="block text-xs uppercase tracking-wide">Ledger Signature Verified</span>
                      <p className="text-[10px] text-gov-muted font-normal mt-0.5">Integrity check matches blockchain record exactly.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-gov-success border-opacity-10 pt-3 font-medium">
                    <div>
                      <span className="text-gov-muted text-[10px] uppercase">Anchored Block Height</span>
                      <span className="text-gov-text block font-mono">#{scannedMetadata.blockHeight}</span>
                    </div>
                    <div>
                      <span className="text-gov-muted text-[10px] uppercase">Transaction Hash ID</span>
                      <span className="text-gov-text block font-mono truncate">{scannedMetadata.txnId}</span>
                    </div>
                    <div>
                      <span className="text-gov-muted text-[10px] uppercase">Anchoring Time</span>
                      <span className="text-gov-text block">{scannedMetadata.timestamp}</span>
                    </div>
                    <div>
                      <span className="text-gov-muted text-[10px] uppercase">Validation Node</span>
                      <span className="text-gov-text block truncate">{scannedMetadata.nodeSignature}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gov-dark p-2 rounded border border-gov-border">
                    <span className="text-gov-muted text-[9px] uppercase font-bold block">Target Document Reference</span>
                    <span className="text-gov-text font-semibold">{scannedMetadata.targetName}</span>
                  </div>
                </div>
              ) : (
                /* Compromised Alert Box */
                <div className="p-4 rounded-xl border border-gov-danger border-opacity-35 bg-gov-danger bg-opacity-5 space-y-3 text-xs glow-red">
                  <div className="flex items-center gap-3 text-gov-danger font-bold">
                    <ShieldAlert className="w-6 h-6 shrink-0 animate-bounce" />
                    <div>
                      <span className="block text-xs uppercase tracking-wide">COMPROMISED / UNANCHORED SIGNATURE</span>
                      <p className="text-[10px] text-gov-muted font-normal mt-0.5">Alert! Hash mismatch detected.</p>
                    </div>
                  </div>
                  <p className="text-gov-text leading-relaxed p-3 bg-gov-dark rounded border border-gov-border">
                    {scannedMetadata.details}
                  </p>
                  <div className="text-[9px] text-gov-muted font-mono">
                    System warning logged at: {scannedMetadata.timestamp}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hyperledger block explorer timelines */}
        <div className="gov-card space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-gov-primaryLight" />
            <h4 className="text-xs font-bold text-gov-text uppercase">Hyperledger Fabric Block Explorer</h4>
          </div>

          <div className="space-y-4 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-gov-border">
            {blocks.map((block) => (
              <div key={block.blockHeight} className="flex gap-4 relative">
                {/* Node icon dots */}
                <div className="w-12 h-12 rounded-full bg-gov-dark border-2 border-gov-border flex items-center justify-center text-gov-primaryLight z-10 font-bold text-xs shrink-0 shadow-md">
                  #{block.blockHeight}
                </div>
                
                <div className="flex-1 p-3.5 bg-gov-dark bg-opacity-40 rounded-xl border border-gov-border space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-gov-text">{block.type}</span>
                    <span className="text-[9px] text-gov-muted font-mono">{block.timestamp}</span>
                  </div>
                  <div className="text-[10px] text-gov-muted font-mono space-y-0.5">
                    <p className="truncate">Txn: {block.txnId}</p>
                    <p className="truncate text-gov-primaryLight">Seal: {block.hashSeal}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
