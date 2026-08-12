import React, { useState } from 'react';
import { 
  Search, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  ExternalLink, 
  TrendingUp, 
  UserCheck, 
  Layers,
  Link as LinkIcon,
  Cpu
} from 'lucide-react';
import { mockMemoryRecords } from '../utils/mockData';

export default function Memory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Filters category tabs
  const categories = ['All', 'Meetings', 'Decisions', 'Documents', 'Actions'];

  // Query processing and matching logic (FTS mock)
  const handleSearch = (record) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      record.title.toLowerCase().includes(query) ||
      record.details.summary.toLowerCase().includes(query) ||
      record.details.decision.toLowerCase().includes(query)
    );
  };

  const handleCategory = (record) => {
    return activeCategory === 'All' || record.category === activeCategory;
  };

  const filteredRecords = mockMemoryRecords.filter(r => handleSearch(r) && handleCategory(r));

  // Compute a dynamic mock relevance score if search query is present
  const getRelevance = (record) => {
    if (!searchQuery) return record.relevance;
    // Boost relevance score dynamically if keyword is a direct match
    const query = searchQuery.toLowerCase();
    if (record.title.toLowerCase().includes(query)) return 100;
    if (record.details.summary.toLowerCase().includes(query)) return 95;
    return record.relevance;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Search Header Banner */}
      <div className="gov-card bg-gradient-to-r from-gov-card to-gov-border bg-opacity-40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-md font-bold text-gov-text">Institutional Memory & Ledger Search</h3>
            <p className="text-xs text-gov-muted">
              Query past meeting minutes, executive decisions, board directives, and documents. Powered by M4 Ledger and M5 AI.
            </p>
          </div>

          {/* Secure indicator badge */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-gov-success/10 border border-gov-success/30 text-gov-success text-xs font-semibold max-w-max">
            <ShieldCheck className="w-4 h-4" />
            <div>
              <span>🔐 Authorized Search Enforced</span>
              <p className="text-[9px] text-gov-muted font-normal mt-0.5">Showing records accessible to your permission role.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Big Search Input & Category Filters */}
      <div className="gov-card space-y-4">
        {/* Large Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-gov-muted absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search meetings, decisions, documents and actions... (e.g. 'budget decision')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-gov-dark border border-gov-border rounded-lg text-sm text-gov-text focus:outline-none focus:border-gov-primary focus:ring-1 focus:ring-gov-primary transition font-medium"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex gap-2 border-b border-gov-border/35 pb-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-gov-primary/25 text-gov-primaryLight border border-gov-primary/40'
                  : 'text-gov-muted hover:text-gov-text hover:bg-gov-border hover:bg-opacity-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-4">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => {
            const score = getRelevance(record);
            return (
              <div 
                key={record.id}
                className="gov-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gov-primary hover:border-opacity-30 transition-all cursor-pointer glass-hover"
                onClick={() => setSelectedRecord(record)}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] px-2.5 py-0.5 rounded font-bold uppercase bg-gov-dark border border-gov-border text-gov-muted">
                      {record.category}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-gov-muted font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      {record.date}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-gov-text">{record.title}</h4>
                  <p className="text-xs text-gov-muted line-clamp-1 leading-relaxed">
                    {record.details.summary}
                  </p>
                </div>

                <div className="flex items-center gap-6 self-stretch md:self-auto border-t md:border-t-0 border-gov-border/30 pt-3 md:pt-0">
                  {/* FTS/Vector matching score */}
                  <div className="text-right">
                    <span className="text-[10px] text-gov-muted block font-semibold uppercase">FTS Match Score</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <TrendingUp className="w-3.5 h-3.5 text-gov-success" />
                      <span className="text-sm font-extrabold text-gov-success">{score}% Match</span>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-gov-border hover:bg-slate-700 rounded text-[10px] text-gov-text font-bold flex items-center gap-1">
                    <span>Inspect Ledger</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="gov-card p-12 text-center text-gov-muted">
            <p className="text-xs font-medium">No authorized ledger records match your query.</p>
          </div>
        )}
      </div>

      {/* Record Inspect Modal (M4 + M5 sync proof) */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gov-card border border-gov-border rounded-xl w-full max-w-2xl overflow-hidden animate-slide-up shadow-glow-primary">
            
            {/* Modal Header */}
            <div className="p-6 bg-gov-border/40 border-b border-gov-border flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gov-dark border border-gov-border text-gov-muted">
                  {selectedRecord.category}
                </span>
                <h4 className="font-bold text-sm text-gov-text uppercase tracking-wide">{selectedRecord.title}</h4>
              </div>
              <span className="text-xs font-mono font-bold text-gov-success bg-gov-success/10 px-2 py-1 rounded">
                Verified Compliance
              </span>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs max-h-[450px] overflow-y-auto">
              
              {/* Executive Summary */}
              <div>
                <span className="text-gov-muted font-bold block uppercase mb-1">Executive Summary</span>
                <p className="text-gov-text bg-gov-dark p-3 rounded border border-gov-border leading-relaxed">
                  {selectedRecord.details.summary}
                </p>
              </div>

              {/* Resolved Decision */}
              <div>
                <span className="text-gov-muted font-bold block uppercase mb-1">Approved Board Decision</span>
                <p className="text-gov-text bg-gov-dark p-3 rounded border border-gov-border leading-relaxed font-semibold">
                  {selectedRecord.details.decision}
                </p>
              </div>

              {/* Action items & docs grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gov-muted font-bold block uppercase mb-1">Action Items Assigned</span>
                  <div className="bg-gov-dark p-3 rounded border border-gov-border leading-relaxed text-gov-text font-mono">
                    {selectedRecord.details.actionItems}
                  </div>
                </div>
                <div>
                  <span className="text-gov-muted font-bold block uppercase mb-1">Attached Documents</span>
                  <div className="bg-gov-dark p-3 rounded border border-gov-border space-y-1">
                    {selectedRecord.details.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-gov-primaryLight hover:underline cursor-pointer">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* M1 authorization proof */}
              <div className="p-3.5 rounded-lg border border-gov-border bg-gov-dark/40">
                <div className="flex items-center gap-2 mb-2 text-gov-text font-bold">
                  <UserCheck className="w-4 h-4 text-gov-primaryLight" />
                  <span>M1 Access Control Authentication</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRecord.details.authorizedRoles.map(role => (
                    <span key={role} className="px-2 py-0.5 rounded bg-gov-border text-[9px] font-mono text-gov-muted">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* M4 Blockchain Sync Info */}
              <div className="p-3.5 rounded-lg border border-gov-success/20 bg-gov-success/5">
                <div className="flex items-center gap-2 mb-1.5 text-gov-success font-bold">
                  <LinkIcon className="w-4 h-4" />
                  <span>M4 Blockchain Ledger Verification</span>
                </div>
                <p className="text-[10px] text-gov-muted leading-relaxed">
                  Decisions and signatures sealed. Ledger Block Hash:
                  <span className="font-mono text-gov-text block font-semibold mt-0.5 select-all break-all">
                    {selectedRecord.details.blockchainHash}
                  </span>
                </p>
              </div>

              {/* M5 AI Analysis Info */}
              <div className="p-3.5 rounded-lg border border-gov-primary/20 bg-gov-primary/5">
                <div className="flex items-center gap-2 mb-1 text-gov-primaryLight font-bold">
                  <Cpu className="w-4 h-4" />
                  <span>M5 AI Transcription Summary</span>
                </div>
                <p className="text-[10px] text-gov-muted leading-relaxed">
                  {selectedRecord.details.aiHighlights}
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gov-dark/50 border-t border-gov-border flex justify-end">
              <button 
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2.5 rounded-lg bg-gov-primary text-white hover:bg-opacity-95 text-xs font-semibold shadow-glow-primary"
              >
                Close Audit Record
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
