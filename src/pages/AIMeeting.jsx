import React, { useState } from 'react';
import { 
  Cpu, 
  User, 
  Clock, 
  CheckSquare, 
  MessageSquare, 
  FileText, 
  ThumbsUp, 
  ShieldCheck, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { mockMeetings } from '../utils/mockData';

export default function AIMeeting() {
  const [selectedMeetingId, setSelectedMeetingId] = useState(mockMeetings[0].id);
  const [approvalState, setApprovalState] = useState('AI-Generated'); // 'AI-Generated' | 'Human-Approved' | 'Final-Record'
  const [approvedBy, setApprovedBy] = useState('');
  
  // Custom mock transcript segments matching meet-001
  const transcriptSegments = [
    { speaker: 'Dr. Anil Sahasrabudhe', time: '10:02 AM', text: 'Good morning committee. Let us begin our review of technical modernizations and SIH incubation funding. First on the agenda is allocation dispersal metrics.' },
    { speaker: 'Dr. Abhay Jere', time: '10:08 AM', text: 'Yes, Chairman. The Innovation Cell proposes a seed grant allocation of INR 2 Lakhs directly to gold-rated SIH prototype teams. We can use secure escrow to ensure compliance.' },
    { speaker: 'Prof. Rajive Kumar', time: '10:15 AM', text: 'I agree with Dr. Jere. We need to verify that each team completes KYC and registers their digital intellectual property before dispersal. This will keep the process highly transparent.' },
    { speaker: 'Prof. M.P. Poonia', time: '10:22 AM', text: 'Exactly. Let us also increase overall innovation cell lab funds by 15% to support pre-incubation environments across tier-3 colleges.' }
  ];

  const handleApprovalToggle = () => {
    if (approvalState === 'AI-Generated') {
      setApprovalState('Human-Approved');
      setApprovedBy('admin_aicte (System Compliance Officer)');
    } else if (approvalState === 'Human-Approved') {
      setApprovalState('Final-Record');
    }
  };

  const resetApproval = () => {
    setApprovalState('AI-Generated');
    setApprovedBy('');
  };

  const getStatusBanner = () => {
    switch (approvalState) {
      case 'Final-Record':
        return {
          bg: 'bg-gov-success bg-opacity-15 border-gov-success border-opacity-35 text-gov-success',
          title: 'Final Signed Governance Record',
          desc: 'Verified by human officers and locked. Cryptographic signatures synced to Blockchain node Org1.',
          icon: ShieldCheck
        };
      case 'Human-Approved':
        return {
          bg: 'bg-gov-primary bg-opacity-15 border-gov-primary border-opacity-35 text-gov-primaryLight',
          title: 'Human Approved (Pending Ledger Commit)',
          desc: `Approved by Compliance Officer: ${approvedBy || 'admin_aicte'}. Ready to seal.`,
          icon: ThumbsUp
        };
      case 'AI-Generated':
      default:
        return {
          bg: 'bg-gov-warning bg-opacity-15 border-gov-warning border-opacity-35 text-gov-warning',
          title: 'AI-Generated Draft (Review Required)',
          desc: 'Automated minutes compiled by AI model. Requires compliance officer review and sign-off.',
          icon: AlertTriangle
        };
    }
  };

  const Banner = getStatusBanner();
  const BannerIcon = Banner.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Header selection bar */}
      <div className="gov-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-md font-bold text-gov-text">AI Meeting Intelligence Engine</h3>
          <p className="text-xs text-gov-muted">
            Transcribe, compile decisions, and track action items automatically using LLM models.
          </p>
        </div>
        
        {/* Select Target Meeting */}
        <select
          value={selectedMeetingId}
          onChange={(e) => {
            setSelectedMeetingId(e.target.value);
            resetApproval(); // Reset approval on meeting change
          }}
          className="bg-gov-dark border border-gov-border rounded text-xs text-gov-text px-3 py-2 focus:outline-none focus:border-gov-primary font-medium"
        >
          {mockMeetings.map(meet => (
            <option key={meet.id} value={meet.id}>{meet.name}</option>
          ))}
        </select>
      </div>

      {/* 2. Interactive Approval Workflow Indicator */}
      <div className={`gov-card p-4 border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${Banner.bg}`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-gov-dark border border-gov-border shrink-0">
            <BannerIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider">{Banner.title}</h4>
            <p className="text-[10px] text-gov-muted mt-0.5 leading-relaxed">{Banner.desc}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {approvalState !== 'Final-Record' ? (
            <button
              onClick={handleApprovalToggle}
              className={`px-4 py-2 rounded text-xs font-bold text-white transition-all shadow-md cursor-pointer ${
                approvalState === 'AI-Generated' 
                  ? 'bg-gov-primary hover:bg-opacity-95 shadow-glow-primary' 
                  : 'bg-gov-success hover:bg-opacity-95 shadow-glow-success'
              }`}
            >
              {approvalState === 'AI-Generated' ? 'Approve MoM Minutes' : 'Commit Ledger Seal'}
            </button>
          ) : (
            <button
              onClick={resetApproval}
              className="px-3 py-1.5 bg-gov-border hover:bg-slate-700 rounded text-[10px] text-gov-text font-bold transition cursor-pointer"
            >
              Reset Review Flow
            </button>
          )}
        </div>
      </div>

      {/* 3. Main Data Content Rows */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Left Col: Live transcript stream */}
        <div className="xl:col-span-1 gov-card space-y-4">
          <div className="flex items-center gap-2 border-b border-gov-border border-opacity-35 pb-2">
            <MessageSquare className="w-4 h-4 text-gov-primaryLight" />
            <h4 className="text-xs font-bold text-gov-text uppercase">Meeting Transcripts Feed</h4>
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {transcriptSegments.map((seg, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-gov-primaryLight">{seg.speaker}</span>
                  <span className="text-gov-muted font-mono flex items-center gap-1"><Clock className="w-3 h-3" />{seg.time}</span>
                </div>
                <p className="text-xs text-gov-text leading-relaxed bg-gov-dark p-2.5 rounded border border-gov-border">
                  {seg.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Cols: MoMs, Decisions & Action Items list */}
        <div className="xl:col-span-2 space-y-6">
          {/* Executive MoM Summary */}
          <div className="gov-card space-y-4 bg-opacity-40">
            <div className="flex items-center gap-2 border-b border-gov-border border-opacity-35 pb-2">
              <FileText className="w-4 h-4 text-gov-primaryLight" />
              <h4 className="text-xs font-bold text-gov-text uppercase">Executive Minutes of Meeting (MoM)</h4>
            </div>

            <div className="text-xs space-y-3 leading-relaxed text-gov-muted">
              <div>
                <span className="font-semibold text-gov-text block">1. Meeting Goal Summary:</span>
                <p className="mt-0.5">
                  AICTE administrative council convened review of technical modernization funds and SIH incubation initiatives. Gold-rated hackathon prototype approvals were debated.
                </p>
              </div>
              
              <div>
                <span className="font-semibold text-gov-text block">2. Approved Governance Decisions:</span>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gov-text font-medium">
                  <li>Formally sanctioned INR 12.5 Crores Q3 Technical modernization pool.</li>
                  <li>Approved direct escrow payouts of INR 2 Lakhs to gold-tier hackathon winners.</li>
                  <li>Mandated IP registration check and KYC compliance prior to escrow dispersal.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Items List Table */}
          <div className="gov-card p-0 overflow-hidden">
            <div className="p-4 border-b border-gov-border flex items-center gap-2 bg-gov-card">
              <CheckSquare className="w-4 h-4 text-gov-muted" />
              <h4 className="text-xs font-bold text-gov-text uppercase">Compliance Action Items</h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gov-dark bg-opacity-50 text-gov-muted font-bold border-b border-gov-border">
                    <th className="py-3 px-4">Action Item</th>
                    <th className="py-3 px-4">Assignee Officer</th>
                    <th className="py-3 px-4">Deadline</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gov-border divide-opacity-35">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-gov-text">Finalize SIH Dispersal Metrics</td>
                    <td className="py-3 px-4 text-gov-muted font-medium">Dr. Abhay Jere</td>
                    <td className="py-3 px-4 font-mono">Aug 20, 2026</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-gov-warning bg-opacity-15 text-gov-warning border border-gov-warning border-opacity-30">PENDING</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-gov-text">Decentralized Escrow Verification</td>
                    <td className="py-3 px-4 text-gov-muted font-medium">System Admin</td>
                    <td className="py-3 px-4 font-mono">Aug 15, 2026</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-gov-primary bg-opacity-15 text-gov-primaryLight border border-gov-primary border-opacity-30">STANDBY</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-gov-text">Draft Gazette Regulation Notification</td>
                    <td className="py-3 px-4 text-gov-muted font-medium">Shri R.K. Soni</td>
                    <td className="py-3 px-4 font-mono">Aug 18, 2026</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-gov-success bg-opacity-15 text-gov-success border border-gov-success border-opacity-30">APPROVED</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
