import React from 'react';
import { Play, ChevronRight, ChevronLeft, RotateCcw, Award } from 'lucide-react';

export default function DemoController({ 
  currentStep, 
  setCurrentStep, 
  setActiveTab, 
  setSelectMeetingId,
  setNotifications,
  setSecurityEvents
}) {
  const steps = [
    {
      title: "1. M6 Admin Dashboard",
      desc: "Observe the core M6 statistics cards: Meetings, Participants, Attendance Rate, Security Events, and charts representing monthly activity.",
      action: () => {
        setActiveTab('dashboard');
      }
    },
    {
      title: "2. Secure Council Meetings",
      desc: "Navigate to the Meetings Portal. Observe scheduled council panels and sensitivity indicators. Select 'Secure Join Call' to test WebRTC.",
      action: () => {
        setActiveTab('meetings');
      }
    },
    {
      title: "3. Compliance Video Archives",
      desc: "Go to Meeting Recordings. Drag and drop any video recording to convert to an Object URL for instant streaming with watermarks and SHA-256 hashes.",
      action: () => {
        setActiveTab('recordings');
      }
    },
    {
      title: "4. Encrypted S3 Files",
      desc: "Go to Secure Files. Drop administrative sheets to verify upload progression, AES-256 encryption seals, and permission metadata.",
      action: () => {
        setActiveTab('files');
      }
    },
    {
      title: "5. AI Meeting Intelligence",
      desc: "Check AI-generated transcripts split by speaker, compiled decisions, and draft MoMs. Try approving the minutes to seal them.",
      action: () => {
        setActiveTab('aimeeting');
      }
    },
    {
      title: "6. Blockchain Verification Ledger",
      desc: "Verify cryptographic signatures. Try checking a custom hash signature or look up anchored block explorer indices.",
      action: () => {
        setActiveTab('blockchain');
      }
    },
    {
      title: "7. Attendance Tracker Logs",
      desc: "Navigate to the Attendance tracker. Notice the general summary statistics, list of official meetings, and member lists.",
      action: () => {
        setActiveTab('attendance');
        setSelectMeetingId('meet-001');
      }
    },
    {
      title: "8. Explore System Audits",
      desc: "Access the system activity ledger. Real-time actions matching modules Auth, Meeting, Files, Ledger are logged here.",
      action: () => {
        setActiveTab('audit');
      }
    },
    {
      title: "9. SOC Threat Remediation",
      desc: "Return to the Dashboard's Security Operations Centre. Look at the active CRITICAL events. We will inspect the 'failed login attempts' alert.",
      action: () => {
        setActiveTab('dashboard');
      }
    },
    {
      title: "10. Compile Analytics Report",
      desc: "Select parameters on the Reports engine, click compile, and preview the compiled PDF sheet. Export or print directly.",
      action: () => {
        setActiveTab('reports');
      }
    },
    {
      title: "11. Institutional Memory Search",
      desc: "Go to the search portal. Try searching for 'budget decision' to run pgvector/FTS relevance matches.",
      action: () => {
        setActiveTab('memory');
      }
    },
    {
      title: "12. Verify M4 + M5 Security Seals",
      desc: "Click on the search result. Inspect the digital block hash (M4 Blockchain integration) and transcripts segment (M5 AI integration).",
      action: () => {
        setActiveTab('memory');
      }
    },
    {
      title: "13. Notifications Center",
      desc: "Review the system alert box. Click the check mark on the critical alert to mark it as read and decrement the dashboard warning counter.",
      action: () => {
        setActiveTab('notifications');
      }
    }
  ];

  const handleNext = () => {
    const nextStep = currentStep + 1;
    if (nextStep < steps.length) {
      setCurrentStep(nextStep);
      steps[nextStep].action();
    }
  };

  const handlePrev = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= 0) {
      setCurrentStep(prevStep);
      steps[prevStep].action();
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    steps[0].action();
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl bg-slate-900 border border-gov-primary/65 rounded-xl shadow-glow-primary p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start gap-3 flex-1">
        <div className="p-2 bg-gov-primary/20 rounded-lg text-gov-primaryLight shrink-0">
          <Award className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] text-gov-primaryLight uppercase font-extrabold tracking-wider">
            Governance Platform Guided Tour
          </span>
          <h4 className="text-xs font-bold text-gov-text">{steps[currentStep].title}</h4>
          <p className="text-[10px] text-gov-muted leading-relaxed">
            {steps[currentStep].desc}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 justify-end">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="p-1.5 rounded bg-gov-card border border-gov-border hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
          title="Previous Step"
        >
          <ChevronLeft className="w-4 h-4 text-gov-text" />
        </button>
        <span className="text-[10px] text-gov-muted font-bold font-mono">
          {currentStep + 1} / {steps.length}
        </span>
        <button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className="p-1.5 rounded bg-gov-primary hover:bg-opacity-90 disabled:opacity-30 shadow-glow-primary cursor-pointer"
          title="Next Step"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
        <div className="w-px h-6 bg-gov-border mx-1" />
        <button
          onClick={handleReset}
          className="p-1.5 rounded bg-gov-card border border-gov-border hover:bg-slate-800 text-gov-muted hover:text-gov-text cursor-pointer"
          title="Restart Demo"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
