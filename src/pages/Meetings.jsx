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
  Sliders,
  CheckCircle2,
  FileText,
  AlertTriangle,
  History,
  Copy,
  Check
} from 'lucide-react';
import { mockMeetings } from '../utils/mockData';
import { api } from '../utils/api';

export default function Meetings({ user }) {
  const [meetings, setMeetings] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activeCallMeeting, setActiveCallMeeting] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedMeetingId, setCopiedMeetingId] = useState(null);
  
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

  // Student dashboard attendance records
  const [studentAttendance, setStudentAttendance] = useState({});
  const [selectedMeetingForStats, setSelectedMeetingForStats] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-08-12');
  const [startTime, setStartTime] = useState('11:00 AM');
  const [endTime, setEndTime] = useState('12:30 PM');
  const [sensitivity, setSensitivity] = useState('HIGH');
  const [agenda, setAgenda] = useState('');

  const jitsiApiRef = useRef(null);
  const currentSessionIdRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load meetings on component mount
  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const allMeetings = await api.getAttendance(); // Fetch from server
      setMeetings(allMeetings);
      
      // Auto-join meeting if meetingId query parameter is present
      const params = new URLSearchParams(window.location.search);
      const urlMeetingId = params.get('meetingId');
      if (urlMeetingId) {
        const match = allMeetings.find(m => m.id === urlMeetingId);
        if (match && !activeCallMeeting) {
          startMeetingSecure(match);
        }
      }

      if (allMeetings.length > 0) {
        setSelectedMeetingForStats(allMeetings[0]);
      }
    } catch (err) {
      console.warn("Failed to load meetings from server. Loading mock data.");
      setMeetings(mockMeetings);
      
      // Auto-join fallback
      const params = new URLSearchParams(window.location.search);
      const urlMeetingId = params.get('meetingId');
      if (urlMeetingId) {
        const match = mockMeetings.find(m => m.id === urlMeetingId);
        if (match && !activeCallMeeting) {
          startMeetingSecure(match);
        }
      }

      if (mockMeetings.length > 0) {
        setSelectedMeetingForStats(mockMeetings[0]);
      }
    }
  };

  // Fetch student attendance when meetings or user details change
  useEffect(() => {
    if (user && user.role === 'Student' && meetings.length > 0) {
      meetings.forEach(async (m) => {
        try {
          const stats = await api.getUserMeetingAttendance(m.id, user.username, user);
          if (stats) {
            setStudentAttendance(prev => ({
              ...prev,
              [m.id]: stats
            }));
          }
        } catch (err) {
          console.error(`Failed to load student attendance stats for meeting ${m.id}:`, err);
        }
      });
    }
  }, [meetings, user]);

  // Jitsi meeting frame lifecycle managers
  useEffect(() => {
    if (!activeCallMeeting || mode !== 'jitsi') {
      cleanupSession();
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
        const container = document.getElementById('jitsi-container');
        if (container) container.innerHTML = '';

        const domain = 'meet.jit.si';
        const options = {
          roomName: `AICTE-Sec-Governance-Room-${activeCallMeeting.id}`,
          width: '100%',
          height: 480,
          parentNode: container,
          userInfo: {
            displayName: user ? `${user.name} (${user.role})` : 'admin_aicte (Compliance Officer)'
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

        const apiInstance = new window.JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = apiInstance;

        // Hook Jitsi joined/left events to trigger real-time backend updates
        apiInstance.addEventListener('videoConferenceJoined', async (event) => {
          console.log('Jitsi conference joined successfully:', event);
          try {
            const startRes = await api.startAttendance(activeCallMeeting.id, {
              userId: user ? user.username : 'admin_aicte',
              name: user ? `${user.name} (${user.role})` : 'admin_aicte (Compliance Officer)',
              email: user ? user.email : 'abhay.jere@aicte-india.org',
              jitsiRoomName: options.roomName
            }, user || { username: 'admin_aicte', role: 'Admin' });

            if (startRes && startRes.sessionId) {
              currentSessionIdRef.current = startRes.sessionId;
              
              // Start heartbeat loop (every 10 seconds)
              if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
              heartbeatIntervalRef.current = setInterval(async () => {
                if (currentSessionIdRef.current) {
                  try {
                    await api.heartbeatAttendance(activeCallMeeting.id, {
                      sessionId: currentSessionIdRef.current
                    }, user || { username: 'admin_aicte', role: 'Admin' });
                  } catch (err) {
                    console.error('Heartbeat sync failed:', err);
                  }
                }
              }, 10000);
              console.log('Attendance active logs initialized:', startRes.sessionId);
            }
          } catch (err) {
            console.error('Attendance initialization rejected:', err);
          }
        });

        apiInstance.addEventListener('videoConferenceLeft', async () => {
          console.log('Jitsi conference left. Finalizing session logs.');
          await cleanupSession();
          setActiveCallMeeting(null);
        });

        apiInstance.addEventListener('displayNameChange', async (event) => {
          if (event.id === 'local') {
            console.log('Jitsi display name changed to:', event.displayname);
            try {
              await api.updateAttendanceName(activeCallMeeting.id, {
                userId: user ? user.username : 'admin_aicte',
                name: event.displayname
              }, user || { username: 'admin_aicte', role: 'Admin' });
            } catch (err) {
              console.error('Failed to sync display name change to backend:', err);
            }
          }
        });

      } catch (err) {
        console.error("Failed to mount Jitsi Meet Frame API:", err);
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => initJitsi();
      document.body.appendChild(script);
    } else {
      if (window.JitsiMeetExternalAPI) {
        initJitsi();
      }
    }

    // Register beforeunload to seal session cleanly on browser/tab close
    const handleBeforeUnload = () => {
      if (currentSessionIdRef.current) {
        const url = `http://localhost:5000/api/meetings/${activeCallMeeting.id}/attendance/end`;
        const payload = JSON.stringify({ sessionId: currentSessionIdRef.current });
        
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
        } else {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', url, false);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.setRequestHeader('Authorization', `Bearer ${user ? user.username : 'admin_aicte'}:${user ? user.role : 'Admin'}`);
          sendBeaconPolyfill(url, payload);
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanupSession();
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [activeCallMeeting, mode]);

  const sendBeaconPolyfill = (url, payload) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, false);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', `Bearer ${user ? user.username : 'admin_aicte'}:${user ? user.role : 'Admin'}`);
      xhr.send(payload);
    } catch(e) {}
  };

  const cleanupSession = async () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (currentSessionIdRef.current) {
      try {
        await api.endAttendance(activeCallMeeting.id, {
          sessionId: currentSessionIdRef.current
        }, user || { username: 'admin_aicte', role: 'Admin' });
      } catch (err) {
        console.error('Attendance completion failed to send:', err);
      }
      currentSessionIdRef.current = null;
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    const meetingUuid = crypto.randomUUID();
    const newMeeting = {
      id: meetingUuid,
      name: title,
      date,
      startTime,
      endTime,
      totalParticipants: 0,
      present: 0,
      absent: 0,
      late: 0,
      status: 'Scheduled',
      sensitivity,
      description: agenda,
      participants: []
    };

    try {
      await api.createMeeting(newMeeting, user || { username: 'admin_aicte', role: 'Admin' });
      await api.generateReport('Meeting Created', newMeeting.id, newMeeting.date);
    } catch(err) {
      console.warn("Saving scheduled meeting failed, falling back.", err);
    }

    await fetchMeetings();
    setShowScheduleModal(false);
    
    // Reset Form Fields
    setTitle('');
    setAgenda('');
    setSensitivity('HIGH');
  };

  const startMeetingSecure = async (meeting) => {
    setErrorMsg('');
    try {
      const checkRes = await api.joinMeeting(meeting.id, user || { username: 'admin_aicte', role: 'Admin' });
      if (checkRes.success) {
        setActiveCallMeeting(meeting);
        setMode('jitsi');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Jitsi Gatekeeper rejected join request. Access Unauthorized.');
      setTimeout(() => setErrorMsg(''), 5000);
    }
  };

  const leaveMeeting = async () => {
    await cleanupSession();
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
    setActiveCallMeeting(null);
    fetchMeetings(); // reload stats
  };

  const copyShareableLink = (meetingId) => {
    const link = `${window.location.origin}${window.location.pathname}?meetingId=${meetingId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedMeetingId(meetingId);
      setTimeout(() => setCopiedMeetingId(null), 2000);
    });
  };

  const getSensitivityBadge = (level) => {
    switch (level) {
      case 'TOP SECRET':
        return 'bg-gov-danger/20 border-gov-danger text-gov-danger';
      case 'HIGH':
        return 'bg-gov-warning/20 border-gov-warning text-gov-warning';
      case 'MEDIUM':
        return 'bg-gov-primary/20 border-gov-primary text-gov-primaryLight';
      case 'LOW':
      default:
        return 'bg-gov-secondary/20 border-gov-secondary text-gov-success';
    }
  };

  const formatSeconds = (totalSec) => {
    if (!totalSec) return '0 min';
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    
    let result = '';
    if (hrs > 0) result += `${hrs} hr `;
    if (mins > 0) result += `${mins} min `;
    if (secs > 0 || result === '') result += `${secs} sec`;
    return result;
  };

  // --- Student Dashboard Render Block ---
  if (user && user.role === 'Student') {
    const activeMeetId = selectedMeetingForStats ? selectedMeetingForStats.id : null;
    const activeStats = activeMeetId ? studentAttendance[activeMeetId] : null;
    
    let liveDurationSeconds = 0;
    if (activeStats) {
      liveDurationSeconds = activeStats.totalDurationSeconds || 0;
      if (activeStats.status === 'Online' && activeStats.sessions) {
        const activeSess = activeStats.sessions.find(s => s.status === 'Active');
        if (activeSess) {
          const liveAdditional = Math.max(0, Math.floor((Date.now() - new Date(activeSess.joinTime)) / 1000));
          liveDurationSeconds += liveAdditional;
        }
      }
    }

    const meetingDurationMinutes = 60;
    const attendancePercentage = activeStats 
      ? Math.min(100, Math.round((liveDurationSeconds / (meetingDurationMinutes * 60)) * 100))
      : 0;

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="gov-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-md font-bold text-gov-text">Student Attendance Dashboard</h3>
            <p className="text-xs text-gov-muted mt-0.5">
              Secure WebRTC Classrooms & Live Log Audits. Authenticated as: <span className="text-gov-primaryLight font-bold">{user.name}</span>
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-lg bg-gov-danger/10 border border-gov-danger/25 text-xs text-gov-danger flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Jitsi Video Frame Panel */}
        {activeCallMeeting ? (
          <div className="gov-card border-gov-primary/40 p-0 overflow-hidden relative shadow-glow-primary">
            <div className="bg-gov-dark p-4 flex items-center justify-between border-b border-gov-border">
              <div className="flex items-center gap-3">
                <span className="text-[9px] px-2.5 py-0.5 rounded font-extrabold bg-gov-success/20 border-gov-success text-gov-success uppercase">
                  Connected
                </span>
                <h4 className="text-xs font-bold text-gov-text">{activeCallMeeting.name}</h4>
              </div>
              <div className="flex items-center gap-2 text-xs text-gov-success bg-gov-success/10 border border-gov-success/20 px-3 py-1 rounded-full">
                <Lock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">AES-256 SECURED SESSION</span>
              </div>
            </div>
            
            <div className="relative bg-[#0c1224] min-h-[480px]">
              <div id="jitsi-container" className="w-full min-h-[480px]" />
            </div>

            <div className="bg-gov-card p-4 flex items-center justify-between border-t border-gov-border">
              <span className="text-xs text-gov-danger font-semibold uppercase animate-pulse">
                🔴 Live Attendance session is recording...
              </span>
              <button
                onClick={leaveMeeting}
                className="flex items-center gap-2 px-5 py-2.5 bg-gov-danger hover:bg-opacity-90 rounded-lg text-xs font-bold text-white transition shadow-glow-danger cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect Call</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            {/* Left Column: Available lectures */}
            <div className="xl:col-span-2 space-y-4">
              <h4 className="text-xs font-bold text-gov-text uppercase tracking-wider block">Available Lectures & Meetings</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {meetings.map((meet) => {
                  const isStatsActive = meet.id === activeMeetId;
                  const isCopied = copiedMeetingId === meet.id;
                  return (
                    <div 
                      key={meet.id} 
                      onClick={() => setSelectedMeetingForStats(meet)}
                      className={`gov-card text-left cursor-pointer transition-all relative flex flex-col justify-between space-y-4 ${
                        isStatsActive ? 'border-gov-primary/60 shadow-glow-primary bg-opacity-90' : 'hover:border-gov-border'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-gov-muted font-mono">{meet.date}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold border ${getSensitivityBadge(meet.sensitivity || 'HIGH')}`}>
                            {meet.sensitivity || 'HIGH'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-gov-text line-clamp-2 leading-snug">{meet.name}</h4>
                        <div className="flex items-center gap-4 text-xs text-gov-muted pt-1">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{meet.startTime} - {meet.endTime}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-gov-border/30 pt-3 gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          meet.status === 'Completed' ? 'bg-gov-success/15 text-gov-success' : 'bg-gov-warning/15 text-gov-warning animate-pulse'
                        }`}>
                          {meet.status === 'Completed' ? 'COMPLETED' : 'LIVE'}
                        </span>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyShareableLink(meet.id);
                            }}
                            className="p-1.5 bg-gov-dark border border-gov-border text-gov-muted hover:text-gov-text rounded transition cursor-pointer"
                            title="Copy Shareable Link"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-gov-success" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          
                          {meet.status !== 'Completed' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startMeetingSecure(meet);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-gov-primary text-white hover:bg-opacity-95 rounded font-semibold text-xs transition shadow-glow-primary cursor-pointer"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Join Meeting</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Attendance Ratios */}
            <div className="xl:col-span-1 space-y-4">
              <h4 className="text-xs font-bold text-gov-text uppercase tracking-wider block">Attendance Analysis</h4>
              
              {selectedMeetingForStats ? (
                <div className="gov-card space-y-6">
                  <div>
                    <span className="text-[10px] text-gov-muted uppercase font-bold tracking-wider">Target Course</span>
                    <h4 className="text-xs font-bold text-gov-text mt-1">{selectedMeetingForStats.name}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gov-dark p-3 rounded-lg border border-gov-border text-center">
                      <span className="text-[10px] text-gov-muted block font-semibold uppercase">Total Attendance</span>
                      <span className="text-md font-bold text-gov-primaryLight mt-1 block">
                        {activeStats ? formatSeconds(liveDurationSeconds) : '0 sec'}
                      </span>
                    </div>

                    <div className="bg-gov-dark p-3 rounded-lg border border-gov-border text-center">
                      <span className="text-[10px] text-gov-muted block font-semibold uppercase">Join Sessions</span>
                      <span className="text-md font-bold text-gov-success mt-1 block">
                        {activeStats ? activeStats.sessionsCount : 0}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gov-text">Compliance Percent</span>
                      <span className="font-bold text-gov-primaryLight">{attendancePercentage}%</span>
                    </div>
                    <div className="w-full bg-gov-dark h-2 rounded-full overflow-hidden border border-gov-border">
                      <div 
                        className="bg-gov-primary h-full transition-all duration-500" 
                        style={{ width: `${attendancePercentage}%` }} 
                      />
                    </div>
                    <p className="text-[9px] text-gov-muted leading-snug">
                      Required percentage for compliance certification is 75%. Meeting target duration: 60 mins.
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-gov-border/30">
                    <span className="text-[10px] text-gov-text font-bold uppercase flex items-center gap-1.5">
                      <History className="w-4 h-4 text-gov-primaryLight" /> Session logs
                    </span>

                    {activeStats && activeStats.sessions && activeStats.sessions.length > 0 ? (
                      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                        {activeStats.sessions.map((sess, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[10px] p-2 bg-gov-dark border border-gov-border rounded">
                            <div>
                              <span className="font-semibold text-gov-text">Session {activeStats.sessions.length - idx}</span>
                              <p className="text-gov-muted mt-0.5 font-mono">
                                {new Date(sess.joinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} - {
                                  sess.leaveTime 
                                    ? new Date(sess.leaveTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                    : 'Active...'
                                }
                              </p>
                            </div>
                            <span className="font-bold text-gov-primaryLight font-mono">
                              {formatSeconds(sess.durationSeconds)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-gov-muted italic text-center py-2">
                        No join sessions detected. Please enter Jitsi using the Secure Join button.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="gov-card text-center py-8 text-xs text-gov-muted">
                  No lecture selected.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Teacher/Officer Default Dashboard Render Block ---
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="gov-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-md font-bold text-gov-text">Secured Governance Meetings & Conferencing</h3>
          <p className="text-xs text-gov-muted mt-0.5">
            Conduct official reviews and evaluations. Secured via Jitsi WebRTC frame and M6 secure gatekeeper checking.
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

      {errorMsg && (
        <div className="p-4 rounded-lg bg-gov-danger/10 border border-gov-danger/25 text-xs text-gov-danger flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Jitsi call panel */}
      {activeCallMeeting ? (
        <div className="gov-card border-gov-primary/40 p-0 overflow-hidden relative shadow-glow-primary">
          <div className="bg-gov-dark p-4 flex flex-wrap items-center justify-between border-b border-gov-border gap-4">
            <div className="flex items-center gap-3">
              <span className={`text-[9px] px-2.5 py-0.5 rounded font-extrabold border ${getSensitivityBadge(activeCallMeeting.sensitivity || 'HIGH')}`}>
                {activeCallMeeting.sensitivity || 'HIGH'} SECURITY LEVEL
              </span>
              <h4 className="text-xs font-bold text-gov-text">{activeCallMeeting.name}</h4>
            </div>

            <div className="flex items-center gap-3">
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

              <div className="flex items-center gap-2 text-xs text-gov-success bg-gov-success/10 border border-gov-success/20 px-3 py-1 rounded-full">
                <Lock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">AES-256 E2EE ACTIVE</span>
              </div>
            </div>
          </div>

          <div className="relative bg-[#0c1224] min-h-[480px]">
            {mode === 'jitsi' && (
              <div id="jitsi-container" className="w-full min-h-[480px]" />
            )}

            {mode === 'simulation' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[480px]">
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
                        <div className="absolute top-4 left-4 bg-black/65 px-2.5 py-1 rounded text-[10px] text-gov-text font-bold z-10">
                          Active Stream: admin_aicte (You)
                        </div>
                        <div className="w-full h-full bg-gradient-to-tr from-slate-950 via-gov-dark to-slate-900 flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <Video className="w-12 h-12 text-gov-primaryLight opacity-20 animate-pulse" />
                            <p className="text-[10px] text-gov-muted">Secure Local Video Node Active</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4 h-24">
                    <div className="bg-[#11182c] border border-gov-border/40 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <span className="absolute bottom-1 left-2 text-[9px] text-gov-text font-bold bg-black/40 px-1 rounded">Dr. Anil S.</span>
                      <div className="w-8 h-8 rounded-full bg-gov-primary/20 flex items-center justify-center text-xs text-gov-primaryLight">AS</div>
                    </div>
                    <div className="bg-[#11182c] border border-gov-border/40 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <span className="absolute bottom-1 left-2 text-[9px] text-gov-text font-bold bg-black/40 px-1 rounded">Prof. Rajive K.</span>
                      <div className="w-8 h-8 rounded-full bg-gov-secondary/20 flex items-center justify-center text-xs text-gov-success">RK</div>
                    </div>
                    <div className="bg-[#11182c] border border-gov-border/40 rounded-lg flex items-center justify-center relative overflow-hidden">
                      <span className="absolute bottom-1 left-2 text-[9px] text-gov-text font-bold bg-black/40 px-1 rounded">Dr. Abhay J.</span>
                      <div className="w-8 h-8 rounded-full bg-gov-warning/20 flex items-center justify-center text-xs text-gov-warning">AJ</div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1 border-l border-gov-border bg-gov-dark/40 p-4 flex flex-col justify-between">
                  <div>
                    <h5 className="text-[10px] text-gov-muted uppercase font-bold tracking-wider mb-3">Participants ({simulatedParticipants.length + 1})</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs p-2 bg-gov-primary/10 rounded border border-gov-primary/20">
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

          {/* Call Controls Bar */}
          <div className="bg-gov-card p-4 flex flex-wrap items-center justify-between border-t border-gov-border gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-gov-danger animate-ping" />
              <span className="text-xs text-gov-danger font-semibold uppercase">Live Recording Active (M6 Audit Log)</span>
            </div>

            {mode === 'simulation' && (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-full border transition cursor-pointer ${
                    isMuted ? 'bg-gov-danger/25 border-gov-danger text-gov-danger' : 'bg-gov-dark border-gov-border text-gov-text hover:bg-slate-800'
                  }`}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button 
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`p-3 rounded-full border transition cursor-pointer ${
                    isVideoOff ? 'bg-gov-danger/25 border-gov-danger text-gov-danger' : 'bg-gov-dark border-gov-border text-gov-text hover:bg-slate-800'
                  }`}
                >
                  {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </button>

                <button 
                  onClick={() => setIsSharingScreen(!isSharingScreen)}
                  className={`p-3 rounded-full border transition cursor-pointer ${
                    isSharingScreen ? 'bg-gov-success/25 border-gov-success text-gov-success' : 'bg-gov-dark border-gov-border text-gov-text hover:bg-slate-800'
                  }`}
                >
                  <Tv className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex gap-2">
              {user && user.role !== 'Student' && (
                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to end this meeting for all participants? This will terminate all active attendee log sessions.')) {
                      await api.endMeeting(activeCallMeeting.id, user || { username: 'admin_aicte', role: 'Admin' });
                      await leaveMeeting();
                    }
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gov-danger hover:bg-opacity-90 rounded-lg text-xs font-bold text-white transition shadow-glow-danger cursor-pointer animate-pulse"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>End Meeting (For All)</span>
                </button>
              )}
              
              <button
                onClick={leaveMeeting}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-650 rounded-lg text-xs font-bold text-white transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect Call</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Officer Meeting List View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {meetings.map((meet) => {
            const isCopied = copiedMeetingId === meet.id;
            return (
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

                <div className="flex items-center justify-between border-t border-gov-border/30 pt-4 gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    meet.status === 'Completed' ? 'bg-gov-success/15 text-gov-success' : 'bg-gov-warning/15 text-gov-warning animate-pulse'
                  }`}>
                    {meet.status === 'Completed' ? 'ARCHIVED' : 'LIVE BOARD'}
                  </span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyShareableLink(meet.id);
                      }}
                      className="p-2 bg-gov-dark border border-gov-border text-gov-muted hover:text-gov-text rounded-lg transition cursor-pointer"
                      title="Copy Shareable Link"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-gov-success" /> : <Copy className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={() => startMeetingSecure(meet)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gov-primary text-white hover:bg-opacity-95 rounded font-semibold text-xs transition shadow-glow-primary cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Secure Join Call</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleScheduleSubmit} className="bg-gov-card border border-gov-border rounded-xl w-full max-w-lg overflow-hidden animate-slide-up shadow-glow-primary">
            <div className="p-6 bg-gov-border/40 border-b border-gov-border flex justify-between items-center">
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
                  placeholder="Summarize the topics that will be discussed..."
                  rows="3"
                  className="w-full px-3 py-2 bg-gov-dark border border-gov-border rounded text-gov-text focus:outline-none focus:border-gov-primary"
                />
              </div>
            </div>

            <div className="p-6 bg-gov-dark/50 border-t border-gov-border flex justify-end gap-3">
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
