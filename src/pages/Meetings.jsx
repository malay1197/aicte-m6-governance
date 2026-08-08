import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  Plus, 
  Shield, 
  ShieldAlert,
  Info, 
  UserPlus, 
  X, 
  Lock, 
  Mic, 
  MicOff, 
  VideoOff, 
  Tv, 
  LogOut, 
  RefreshCw,
  Sliders
} from 'lucide-react';
import { mockMeetings } from '../utils/mockData';

export default function Meetings() {
  const [meetings, setMeetings] = useState(mockMeetings);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activeCallMeeting, setActiveCallMeeting] = useState(null);
  
  // Choose between live Jitsi frame and visual simulation
  const [mode, setMode] = useState('jitsi'); // 'jitsi' | 'simulation'
  
  // Call simulation states
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [simulatedParticipants, setSimulatedParticipants] = useState([
    { name: 'Dr. Anil Sahasrabudhe (Chairman)', role: 'Host', active: true },
    { name: 'Prof. Rajive Kumar (Secretary)', role: 'Speaker', active: false },
    { name: 'Dr. Abhay Jere (CIO)', role: 'Speaker', active: true },
    { name: 'Smt. Mamta R. Agarwal (Adviser)', role: 'Listener', active: false }
  ]);

  // Form Fields
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-08-09');
  const [startTime, setStartTime] = useState('11:00 AM');
  const [endTime, setEndTime] = useState('12:30 PM');
  const [sensitivity, setSensitivity] = useState('HIGH');
  const [agenda, setAgenda] = useState('');

  const jitsiApiRef = useRef(null);

  // Load and clean Jitsi API frame
  useEffect(() => {
    if (!activeCallMeeting || mode !== 'jitsi') {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
      return;
    }

    const scriptId = 'jitsi-external-api';
    let script = document.getElementById(scriptId);

    const initJitsi = () => {
      try {
        // Clear container first
        const container = document.getElementById('jitsi-container');
        if (container) container.innerHTML = '';

        const domain = 'meet.jit.si';
        const options = {
          roomName: `AICTE-Sec-Governance-Room-${activeCallMeeting.id}`,
          width: '100%',
          height: 480,
          parentNode: container,
          userInfo: {
            displayName: 'admin_aicte (Compliance Officer)'
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
              'sharedvideo', 'settings', 'raisehand', 'videoquality', 'filmstrip',
              'tileview', 'videobackgroundblur'
            ]
          },
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: false,
            prejoinPageEnabled: false
          }
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = api;

        api.addEventListener('videoConferenceLeft', () => {
          api.dispose();
          jitsiApiRef.current = null;
          setActiveCallMeeting(null);
        });

      } catch (err) {
        console.error("Failed to load Jitsi Meet Frame API:", err);
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => {
        initJitsi();
      };
      document.body.appendChild(script);
    } else {
      if (window.JitsiMeetExternalAPI) {
        initJitsi();
      }
    }

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [activeCallMeeting, mode]);

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    const newMeeting = {
      id: `meet-${Date.now()}`,
      name: title,
      date,
      startTime,
      endTime,
      totalParticipants: 4,
      present: 0,
      absent: 0,
      late: 0,
      status: 'Scheduled',
      sensitivity,
      participants: [
        { id: 'p-1', name: 'admin_aicte', role: 'System Admin', status: 'Present' }
      ]
    };
    setMeetings([newMeeting, ...meetings]);
    setShowScheduleModal(false);
    
    // Reset Form Fields
    setTitle('');
    setAgenda('');
    setSensitivity('HIGH');
  };

  const getSensitivityBadge = (level) => {
    switch (level) {
      case 'TOP SECRET':
        return 'bg-gov-danger bg-opacity-20 border-gov-danger text-gov-danger';
      case 'HIGH':
        return 'bg-gov-warning bg-opacity-20 border-gov-warning text-gov-warning';
      case 'MEDIUM':
        return 'bg-gov-primary bg-opacity-20 border-gov-primary text-gov-primaryLight';
      case 'LOW':
      default:
        return 'bg-gov-secondary bg-opacity-20 border-gov-secondary text-gov-success';
    }
  };

  const startMeeting = (meeting) => {
    setActiveCallMeeting(meeting);
    setMode('jitsi'); // Default to full WebRTC video frame
  };

  const leaveMeeting = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
    setActiveCallMeeting(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Header Banner */}
      <div className="gov-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-md font-bold text-gov-text">Secured Governance Meetings & Conferencing</h3>
          <p className="text-xs text-gov-muted mt-0.5">
            Conduct official reviews and evaluations. Secured via Hyperledger seals and WebRTC Jitsi integration.
          </p>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gov-primary text-white hover:bg-opacity-95 rounded-lg text-xs font-bold transition shadow-glow-primary self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Council Meeting</span>
        </button>
      </div>

      {/* 2. Main Live Meeting Call View */}
      {activeCallMeeting ? (
        <div className="gov-card border-gov-primary border-opacity-40 p-0 overflow-hidden relative shadow-glow-primary">
          {/* Call Header */}
          <div className="bg-gov-dark p-4 flex flex-wrap items-center justify-between border-b border-gov-border gap-4">
            <div className="flex items-center gap-3">
              <span className={`text-[9px] px-2.5 py-0.5 rounded font-extrabold border ${getSensitivityBadge(activeCallMeeting.sensitivity || 'HIGH')}`}>
                {activeCallMeeting.sensitivity || 'HIGH'} SECURITY LEVEL
              </span>
              <h4 className="text-xs font-bold text-gov-text">{activeCallMeeting.name}</h4>
            </div>

            <div className="flex items-center gap-3">
              {/* Toggle Mode */}
              <div className="flex bg-gov-dark border border-gov-border rounded-lg p-0.5 text-[10px]">
                <button
                  onClick={() => setMode('jitsi')}
                  className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                    mode === 'jitsi' ? 'bg-gov-primary text-white' : 'text-gov-muted'
                  }`}
                >
                  Jitsi WebRTC
                </button>
                <button
                  onClick={() => setMode('simulation')}
                  className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                    mode === 'simulation' ? 'bg-gov-primary text-white' : 'text-gov-muted'
                  }`}
                >
                  Security Details
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-gov-success bg-gov-success bg-opacity-10 border border-gov-success border-opacity-20 px-3 py-1 rounded-full">
                <Lock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">AES-256 E2EE ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Jitsi/WebRTC Active Call Canvas */}
          <div className="relative bg-[#0c1224] min-h-[480px]">
            {mode === 'jitsi' && (
              <div id="jitsi-container" className="w-full min-h-[480px]">
                {/* Jitsi Meet iframe is injected here */}
              </div>
            )}

            {mode === 'simulation' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[480px]">
                {/* Main Video Stream Simulator */}
                <div className="lg:col-span-3 p-6 flex flex-col justify-between relative">
                  <div className="flex-1 flex items-center justify-center relative bg-[#131b33] border border-gov-border rounded-xl overflow-hidden shadow-inner">
                    {isVideoOff ? (
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-lg font-bold text-gov-muted">
                          AD
                        </div>
                        <span className="text-xs text-gov-muted font-bold">Your camera stream is paused</span>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center relative">
                        <div className="absolute top-4 left-4 bg-black bg-opacity-65 px-2.5 py-1 rounded text-[10px] text-gov-text font-bold z-10">
                          Active Stream: admin_aicte (You)
                        </div>
                        {/* Simulated Visual Stream grid background */}
                        <div className="w-full h-full bg-gradient-to-tr from-slate-950 via-gov-dark to-slate-900 flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <Video className="w-12 h-12 text-gov-primaryLight opacity-20 animate-pulse animate-pulse-slow" />
                            <p className="text-[10px] text-gov-muted">Secure Local Video Node Active</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Micro participants list cards */}
                  <div className="grid grid-cols-3 gap-4 mt-4 h-24">
                    <div className="bg-[#11182c] border border-gov-border border-opacity-40 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <span className="absolute bottom-1 left-2 text-[9px] text-gov-text font-bold bg-black bg-opacity-40 px-1 rounded">Dr. Anil S.</span>
                      <div className="w-8 h-8 rounded-full bg-gov-primary bg-opacity-20 flex items-center justify-center text-xs text-gov-primaryLight">AS</div>
                    </div>
                    <div className="bg-[#11182c] border border-gov-border border-opacity-40 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <span className="absolute bottom-1 left-2 text-[9px] text-gov-text font-bold bg-black bg-opacity-40 px-1 rounded">Prof. Rajive K.</span>
                      <div className="w-8 h-8 rounded-full bg-gov-secondary bg-opacity-20 flex items-center justify-center text-xs text-gov-success">RK</div>
                    </div>
                    <div className="bg-[#11182c] border border-gov-border border-opacity-40 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <span className="absolute bottom-1 left-2 text-[9px] text-gov-text font-bold bg-black bg-opacity-40 px-1 rounded">Dr. Abhay J.</span>
                      <div className="w-8 h-8 rounded-full bg-gov-warning bg-opacity-20 flex items-center justify-center text-xs text-gov-warning">AJ</div>
                    </div>
                  </div>
                </div>

                {/* Right sidebar details */}
                <div className="lg:col-span-1 border-l border-gov-border bg-gov-dark bg-opacity-40 p-4 flex flex-col justify-between">
                  <div>
                    <h5 className="text-[10px] text-gov-muted uppercase font-bold tracking-wider mb-3">Participants ({simulatedParticipants.length + 1})</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs p-2 bg-gov-primary bg-opacity-10 rounded border border-gov-primary border-opacity-20">
                        <span className="font-semibold text-gov-text">admin_aicte (You)</span>
                        <span className="text-[8px] bg-gov-primary text-white px-1.5 py-0.5 rounded font-bold">HOST</span>
                      </div>
                      {simulatedParticipants.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs p-2 bg-gov-card rounded border border-gov-border">
                          <span className="font-semibold text-gov-muted">{p.name}</span>
                          <span className="text-[8px] bg-gov-border text-gov-muted px-1.5 py-0.5 rounded font-bold">{p.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-gov-card border border-gov-border rounded-lg space-y-1.5 mt-4">
                    <span className="text-[9px] text-gov-muted block font-semibold uppercase">Conference Signature Seal</span>
                    <span className="text-[9px] font-mono text-gov-primaryLight block break-all leading-tight select-all">
                      SHA256: 8a92fbcd9a928ef782bcf9287cba1192e8bf77a8
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Video Control Bar Dashboard */}
          <div className="bg-gov-card p-4 flex flex-wrap items-center justify-between border-t border-gov-border gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-gov-danger animate-ping"></span>
              <span className="text-xs text-gov-danger font-semibold uppercase">Live Recording Active (M6 Audit Log)</span>
            </div>

            {mode === 'simulation' && (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-full border transition cursor-pointer ${
                    isMuted ? 'bg-gov-danger bg-opacity-25 border-gov-danger text-gov-danger' : 'bg-gov-dark border-gov-border text-gov-text hover:bg-slate-800'
                  }`}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button 
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`p-3 rounded-full border transition cursor-pointer ${
                    isVideoOff ? 'bg-gov-danger bg-opacity-25 border-gov-danger text-gov-danger' : 'bg-gov-dark border-gov-border text-gov-text hover:bg-slate-800'
                  }`}
                >
                  {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </button>

                <button 
                  onClick={() => setIsSharingScreen(!isSharingScreen)}
                  className={`p-3 rounded-full border transition cursor-pointer ${
                    isSharingScreen ? 'bg-gov-success bg-opacity-25 border-gov-success text-gov-success' : 'bg-gov-dark border-gov-border text-gov-text hover:bg-slate-800'
                  }`}
                >
                  <Tv className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={leaveMeeting}
              className="flex items-center gap-2 px-5 py-2.5 bg-gov-danger hover:bg-opacity-90 rounded-lg text-xs font-bold text-white transition shadow-glow-danger cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Terminate Session</span>
            </button>
          </div>
        </div>
      ) : (
        /* 3. Meetings List Grid Card view */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {meetings.map((meet) => (
            <div key={meet.id} className="gov-card flex flex-col justify-between space-y-4 hover:border-gov-primary hover:border-opacity-35 transition-all">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gov-muted font-mono">{meet.date}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold border ${getSensitivityBadge(meet.sensitivity || 'HIGH')}`}>
                    {meet.sensitivity || 'HIGH'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gov-text leading-snug">{meet.name}</h4>
                <div className="flex items-center gap-4 text-xs text-gov-muted pt-1">
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{meet.startTime} - {meet.endTime}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{meet.totalParticipants} Members</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gov-border border-opacity-30 pt-4 gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                  meet.status === 'Completed' ? 'bg-gov-success bg-opacity-15 text-gov-success' : 'bg-gov-warning bg-opacity-15 text-gov-warning animate-pulse'
                }`}>
                  {meet.status === 'Completed' ? 'ARCHIVED' : 'LIVE BOARD'}
                </span>
                
                <button
                  onClick={() => startMeeting(meet)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gov-primary text-white hover:bg-opacity-95 rounded font-semibold text-xs transition shadow-glow-primary cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Secure Join Call</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Schedule Meeting Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleScheduleSubmit} className="bg-gov-card border border-gov-border rounded-xl w-full max-w-lg overflow-hidden animate-slide-up shadow-glow-primary">
            {/* Modal Header */}
            <div className="p-6 bg-gov-border bg-opacity-40 border-b border-gov-border flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-gov-primaryLight" />
                <h4 className="font-bold text-sm text-gov-text uppercase tracking-wide">Schedule Council Meeting</h4>
              </div>
              <button 
                type="button" 
                onClick={() => setShowScheduleModal(false)}
                className="text-gov-muted hover:text-gov-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Fields Form body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-gov-muted font-semibold uppercase">Meeting Title / Council Name</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Committee Review on AI CTE Incubation Grants"
                  className="w-full px-3 py-2 bg-gov-dark border border-gov-border rounded text-gov-text focus:outline-none focus:border-gov-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gov-muted font-semibold uppercase">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gov-dark border border-gov-border rounded text-gov-text focus:outline-none focus:border-gov-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gov-muted font-semibold uppercase">Security Sensitivity</label>
                  <select
                    value={sensitivity}
                    onChange={(e) => setSensitivity(e.target.value)}
                    className="w-full bg-gov-dark border border-gov-border rounded px-3 py-2 text-gov-text focus:outline-none focus:border-gov-primary"
                  >
                    <option value="LOW">LOW (General Briefing)</option>
                    <option value="MEDIUM">MEDIUM (Advisory Audit)</option>
                    <option value="HIGH">HIGH (Secure Policy Norms)</option>
                    <option value="TOP SECRET">TOP SECRET (Directives & Funding)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gov-muted font-semibold uppercase">Start Time</label>
                  <input
                    type="text"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gov-dark border border-gov-border rounded text-gov-text focus:outline-none focus:border-gov-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gov-muted font-semibold uppercase">End Time</label>
                  <input
                    type="text"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gov-dark border border-gov-border rounded text-gov-text focus:outline-none focus:border-gov-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gov-muted font-semibold uppercase">Council Agenda / Directives</label>
                <textarea
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="Summarize the core topics and decisions that will be committed to the blockchain database..."
                  rows="3"
                  className="w-full px-3 py-2 bg-gov-dark border border-gov-border rounded text-gov-text focus:outline-none focus:border-gov-primary"
                />
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 bg-gov-dark bg-opacity-50 border-t border-gov-border flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 rounded bg-gov-border text-gov-muted hover:bg-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 rounded bg-gov-primary text-white hover:bg-opacity-95 text-xs font-semibold shadow-glow-primary"
              >
                Schedule & Broadcast
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
