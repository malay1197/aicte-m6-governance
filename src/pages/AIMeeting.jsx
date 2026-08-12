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
  Award,
  RefreshCw,
  Sparkles,
  Edit3
} from 'lucide-react';
import { mockMeetings } from '../utils/mockData';
import { api } from '../utils/api';

export default function AIMeeting() {
  const [selectedMeetingId, setSelectedMeetingId] = useState(mockMeetings[0].id);
  const [approvalState, setApprovalState] = useState('AI-Generated'); // 'AI-Generated' | 'Human-Approved' | 'Final-Record'
  const [approvedBy, setApprovedBy] = useState('');
  
  const [activeLeftTab, setActiveLeftTab] = useState('feed'); // 'feed' | 'editor'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiError, setApiError] = useState('');
  const [analysisSource, setAnalysisSource] = useState('Static Prototype Draft');

  // Initial mock transcript
  const transcriptSegments = [
    { speaker: 'Dr. Anil Sahasrabudhe', time: '10:02 AM', text: 'Good morning committee. Let us begin our review of technical modernizations and SIH incubation funding. First on the agenda is allocation dispersal metrics.' },
    { speaker: 'Dr. Abhay Jere', time: '10:08 AM', text: 'Yes, Chairman. The Innovation Cell proposes a seed grant allocation of INR 2 Lakhs directly to gold-rated SIH prototype teams. We can use secure escrow to ensure compliance.' },
    { speaker: 'Prof. Rajive Kumar', time: '10:15 AM', text: 'I agree with Dr. Jere. We need to verify that each team completes KYC and registers their digital intellectual property before dispersal. This will keep the process highly transparent.' },
    { speaker: 'Prof. M.P. Poonia', time: '10:22 AM', text: 'Exactly. Let us also increase overall innovation cell lab funds by 15% to support pre-incubation environments across tier-3 colleges.' }
  ];

  const defaultRawText = transcriptSegments.map(seg => `${seg.speaker}: ${seg.text}`).join('\n\n');
  const [rawTranscript, setRawTranscript] = useState(defaultRawText);

  // Dynamic MoM States
  const [meetingGoalSummary, setMeetingGoalSummary] = useState(
    "AICTE administrative council convened review of technical modernization funds and SIH incubation initiatives. Gold-rated hackathon prototype approvals were debated."
  );
  const [governanceDecisions, setGovernanceDecisions] = useState([
    "Formally sanctioned INR 12.5 Crores Q3 Technical modernization pool.",
    "Approved direct escrow payouts of INR 2 Lakhs to gold-tier hackathon winners.",
    "Mandated IP registration check and KYC compliance prior to escrow dispersal."
  ]);
  const [actionItems, setActionItems] = useState([
    { task: "Finalize SIH Dispersal Metrics", assignee: "Dr. Abhay Jere", deadline: "Aug 20, 2026", status: "PENDING" },
    { task: "Decentralized Escrow Verification", assignee: "System Admin", deadline: "Aug 15, 2026", status: "STANDBY" },
    { task: "Draft Gazette Regulation Notification", assignee: "Shri R.K. Soni", deadline: "Aug 18, 2026", status: "APPROVED" }
  ]);

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

  const handleRunAnalysis = async () => {
    if (!rawTranscript.trim()) return;
    setIsAnalyzing(true);
    setApiError('');

    try {
      const result = await api.analyzeTranscript(rawTranscript);
      if (result.goalSummary) setMeetingGoalSummary(result.goalSummary);
      if (result.decisions) setGovernanceDecisions(result.decisions);
      if (result.actionItems) {
        setActionItems(result.actionItems.map(item => ({
          task: item.task,
          assignee: item.assignee,
          deadline: item.deadline,
          status: 'PENDING'
        })));
      }
      setAnalysisSource('Gemini Live API');
      setApprovalState('AI-Generated');
    } catch (err) {
      console.error(err);
      setApiError(err.message || 'Failed to call Gemini API.');
    } finally {
      setIsAnalyzing(false);
    }
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
          title: 'Draft Minutes (Review Required)',
          desc: 'Draft minutes captured by transcription node. Requires compliance officer review and sign-off.',
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
          <div className="flex items-center gap-2">
            <h3 className="text-md font-bold text-gov-text">Meeting Minutes & Transcripts Compiler</h3>
            <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase font-mono ${
              analysisSource === 'Gemini Live API' ? 'bg-gov-success bg-opacity-20 text-gov-success border border-gov-success border-opacity-30' : 'bg-gov-border text-gov-muted'
            }`}>
              {analysisSource}
            </span>
          </div>
          <p className="text-xs text-gov-muted">
            Compile meeting dialogue, record decisions, and log official action items.
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
        
        {/* Left Col: Transcript stream + Editor */}
        <div className="xl:col-span-1 gov-card space-y-4">
          <div className="flex justify-between items-center border-b border-gov-border border-opacity-35 pb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gov-primaryLight" />
              <h4 className="text-xs font-bold text-gov-text uppercase">Transcripts Manager</h4>
            </div>

            {/* Toggle tabs */}
            <div className="flex gap-1 bg-gov-dark p-0.5 rounded border border-gov-border">
              <button
                onClick={() => setActiveLeftTab('feed')}
                className={`px-2 py-1 rounded text-[9px] font-bold cursor-pointer transition ${
                  activeLeftTab === 'feed' ? 'bg-gov-primary text-white' : 'text-gov-muted hover:text-gov-text'
                }`}
              >
                Feed bubbles
              </button>
              <button
                onClick={() => setActiveLeftTab('editor')}
                className={`px-2 py-1 rounded text-[9px] font-bold cursor-pointer transition ${
                  activeLeftTab === 'editor' ? 'bg-gov-primary text-white' : 'text-gov-muted hover:text-gov-text'
                }`}
              >
                Raw Editor
              </button>
            </div>
          </div>

          {activeLeftTab === 'feed' ? (
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
          ) : (
            <div className="space-y-3">
              <textarea
                value={rawTranscript}
                onChange={(e) => setRawTranscript(e.target.value)}
                rows={11}
                className="w-full p-3 bg-gov-dark border border-gov-border rounded-lg text-xs text-gov-text focus:outline-none focus:border-gov-primary font-medium font-mono leading-relaxed"
                placeholder="Type or paste meeting transcript here..."
              />
              
              {/* Trigger Analysis Button */}
              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing || !rawTranscript.trim()}
                className="w-full py-2.5 bg-gov-primary hover:bg-opacity-95 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-glow-primary cursor-pointer"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Run Decision Analysis (Gemini)</span>
              </button>

              {/* Configurations warning */}
              {!localStorage.getItem('gemini_api_key') && (
                <p className="text-[9px] text-gov-warning text-center font-medium leading-normal bg-gov-warning bg-opacity-10 p-2 rounded border border-gov-warning border-opacity-25 mt-1">
                  ⚠️ Save your Gemini API Key in the Configurations tab to run live transcript analysis.
                </p>
              )}

              {/* API error alert */}
              {apiError && (
                <div className="p-3 rounded-lg bg-gov-danger bg-opacity-10 border border-gov-danger border-opacity-35 text-[10px] text-gov-danger leading-relaxed">
                  {apiError}
                </div>
              )}
            </div>
          )}
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
                  {meetingGoalSummary}
                </p>
              </div>
              
              <div>
                <span className="font-semibold text-gov-text block">2. Approved Governance Decisions:</span>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gov-text font-medium">
                  {governanceDecisions.map((dec, idx) => (
                    <li key={idx}>{dec}</li>
                  ))}
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
                  {actionItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-4 font-semibold text-gov-text">{item.task}</td>
                      <td className="py-3 px-4 text-gov-muted font-medium">{item.assignee}</td>
                      <td className="py-3 px-4 font-mono">{item.deadline}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                          item.status === 'APPROVED' 
                            ? 'bg-gov-success bg-opacity-15 text-gov-success border-gov-success border-opacity-30'
                            : item.status === 'STANDBY'
                              ? 'bg-gov-primary bg-opacity-15 text-gov-primaryLight border-gov-primary border-opacity-30'
                              : 'bg-gov-warning bg-opacity-15 text-gov-warning border-gov-warning border-opacity-30'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
