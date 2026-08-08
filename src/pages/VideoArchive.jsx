import React, { useState, useRef, useEffect } from 'react';
import { 
  Film, 
  UploadCloud, 
  Search, 
  Play, 
  Pause, 
  Volume2, 
  Maximize, 
  Lock, 
  ShieldCheck, 
  Trash2, 
  Info,
  Clock,
  Layers,
  CheckCircle,
  FileVideo,
  AlertTriangle,
  FileText
} from 'lucide-react';

export default function VideoArchive() {
  const [recordings, setRecordings] = useState([
    {
      id: 'rec-001',
      name: 'AICTE_Q3_Budget_Council_Briefing.mp4',
      size: '24.5 MB',
      duration: '02:15',
      uploadedAt: '2026-08-05 11:35 AM',
      hash: '0x8a92fbcd9a928ef782bcf9287cba1192e8bf77a8',
      encryption: 'AES-256-CBC Streamed',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      authorizedRoles: ['Admin', 'Chairman', 'CIO']
    },
    {
      id: 'rec-002',
      name: 'SIH_Incubation_Escrow_Escalation.mp4',
      size: '48.2 MB',
      duration: '04:50',
      uploadedAt: '2026-08-06 03:00 PM',
      hash: '0xc8821a9980d28711e9a2bc91e772153c3d2890fb910892e8bf723da890fb91',
      encryption: 'AES-256-CBC Streamed',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      authorizedRoles: ['Admin', 'CIO']
    }
  ]);

  const [selectedRecording, setSelectedRecording] = useState(recordings[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadError, setUploadError] = useState('');

  // HTML5 Video Player references & custom states
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [selectedRecording]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(e => console.log("Playback error:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
  };

  const handleMaximize = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  // Video File Processing & Object URL conversion
  const processVideoUpload = (file) => {
    setUploadError('');
    if (!file.type.startsWith('video/')) {
      setUploadError('Invalid format. Only MP4, WebM or official video recording formats are supported.');
      return;
    }

    const maxBytes = 100 * 1024 * 1024; // 100MB
    if (file.size > maxBytes) {
      setUploadError('Size limit exceeded. Max video upload allowed is 100MB.');
      return;
    }

    // Simulate hashing & storage upload
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Create local Object URL
          const localUrl = URL.createObjectURL(file);
          
          const newRecording = {
            id: `rec-${Date.now()}`,
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            duration: '01:00', // Mock initial duration
            uploadedAt: new Date().toLocaleString(),
            hash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
            encryption: 'AES-256-CBC Streamed',
            url: localUrl,
            authorizedRoles: ['Admin', 'Chairman']
          };

          setRecordings(prevRecs => [newRecording, ...prevRecs]);
          setSelectedRecording(newRecording);
          setUploadProgress(null);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to permanently purge this meeting recording?')) {
      const remaining = recordings.filter(r => r.id !== id);
      setRecordings(remaining);
      if (selectedRecording.id === id) {
        setSelectedRecording(remaining[0] || null);
      }
    }
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredRecordings = recordings.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Portal Banner */}
      <div className="gov-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-md font-bold text-gov-text">Compliance Council Meeting Recordings</h3>
          <p className="text-xs text-gov-muted mt-0.5">
            Decipher and view secure video archives of governing boards. Integrates object streaming, watermarks, and encryption logs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-gov-success animate-ping"></span>
          <span className="text-xs text-gov-success font-bold uppercase">Recording Node Secure</span>
        </div>
      </div>

      {/* 2. Main Page Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Playlist & Video Upload Zone */}
        <div className="space-y-4 xl:col-span-1">
          {/* Video drag-and-drop */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); processVideoUpload(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current.click()}
            className={`gov-card border-dashed border-2 py-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging ? 'border-gov-primary bg-gov-primary bg-opacity-10 scale-[1.01]' : 'border-gov-border hover:border-gov-primary hover:bg-opacity-5'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={(e) => processVideoUpload(e.target.files[0])} 
              className="hidden" 
              accept="video/*" 
            />
            <UploadCloud className="w-8 h-8 text-gov-primaryLight mb-2" />
            <span className="text-xs font-bold text-gov-text">Upload Council Video Recording</span>
            <p className="text-[9px] text-gov-muted mt-1 leading-normal max-w-xs px-4">
              Drag & drop meeting MP4 or WebM files. Auto-encrypts and signs hashes upon loading.
            </p>
          </div>

          {/* Progress loader */}
          {uploadProgress !== null && (
            <div className="gov-card p-4 space-y-2 border border-gov-primary border-opacity-30">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gov-primaryLight">Encrypting video stream...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gov-dark h-2 rounded-full overflow-hidden border border-gov-border">
                <div className="bg-gov-primary h-full transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {uploadError && (
            <div className="p-3 bg-gov-danger bg-opacity-10 border border-gov-danger border-opacity-30 rounded-lg flex items-center gap-2 text-xs text-gov-danger">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Search bar playlist */}
          <div className="relative">
            <Search className="w-4 h-4 text-gov-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search recordings playlist..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gov-dark border border-gov-border rounded-lg text-xs text-gov-text focus:outline-none focus:border-gov-primary"
            />
          </div>

          {/* Playlist listing cards */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {filteredRecordings.map((rec) => {
              const isSelected = rec.id === selectedRecording?.id;
              return (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecording(rec)}
                  className={`p-3 rounded-lg border text-xs flex justify-between items-center cursor-pointer transition-all ${
                    isSelected ? 'border-gov-primary bg-gov-primary bg-opacity-10' : 'border-gov-border hover:bg-gov-border hover:bg-opacity-20'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileVideo className={`w-4 h-4 shrink-0 ${isSelected ? 'text-gov-primaryLight' : 'text-gov-muted'}`} />
                    <div className="truncate">
                      <span className={`block font-bold truncate ${isSelected ? 'text-gov-primaryLight' : 'text-gov-text'}`}>{rec.name}</span>
                      <span className="text-[10px] text-gov-muted block font-mono mt-0.5">{rec.size} • {rec.duration}</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleDelete(rec.id, e)}
                    className="p-1 rounded text-gov-muted hover:text-gov-danger hover:bg-gov-danger hover:bg-opacity-10 transition"
                    title="Purge Video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Custom Video Player Canvas & Security Logs */}
        <div className="xl:col-span-2 space-y-6">
          {selectedRecording ? (
            <div className="space-y-4">
              
              {/* Premium Styled HTML5 Video Player container */}
              <div className="relative bg-[#070b15] border border-gov-border rounded-xl overflow-hidden shadow-2xl group">
                
                {/* Real-time HTML5 video streaming */}
                <video
                  ref={videoRef}
                  src={selectedRecording.url}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onClick={togglePlay}
                  className="w-full h-auto aspect-video cursor-pointer"
                />

                {/* Secure Watermark Overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none select-none z-10 opacity-35">
                  <div className="text-[10px] font-mono font-bold text-gov-text bg-black bg-opacity-40 px-2 py-0.5 rounded self-start border border-gov-border border-opacity-30">
                    SECURE STREAM WATERMARK - AICTE COUNCIL
                  </div>
                  <div className="text-[12px] font-mono font-bold text-gov-text tracking-widest text-center rotate-12 opacity-40">
                    CONFIDENTIAL - admin_aicte - {new Date().toLocaleDateString()}
                  </div>
                  <div className="text-[9px] font-mono text-gov-text bg-black bg-opacity-40 px-2 py-0.5 rounded self-end border border-gov-border border-opacity-30">
                    HASH SEAL: {selectedRecording.hash.substring(0, 16)}...
                  </div>
                </div>

                {/* Custom media player controls bar overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 z-20">
                  {/* Slider Progress Bar */}
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="0" 
                      max={duration || 100} 
                      value={currentTime} 
                      onChange={handleSeek}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-gov-primary"
                    />
                  </div>

                  {/* Buttons controls row */}
                  <div className="flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-4">
                      {/* Play Pause */}
                      <button 
                        onClick={togglePlay} 
                        className="p-1 rounded hover:bg-slate-800 text-gov-primaryLight cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-5 h-5 fill-gov-primaryLight" /> : <Play className="w-5 h-5 fill-gov-primaryLight" />}
                      </button>

                      {/* Time Indicators */}
                      <span className="font-mono text-[10px] text-slate-400">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Volume */}
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-slate-400" />
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.1" 
                          value={volume} 
                          onChange={handleVolumeChange}
                          className="w-16 h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-gov-primary"
                        />
                      </div>

                      {/* Maximize */}
                      <button 
                        onClick={handleMaximize} 
                        className="p-1 rounded hover:bg-slate-800 cursor-pointer"
                        title="Fullscreen"
                      >
                        <Maximize className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Secure video log details */}
              <div className="gov-card grid grid-cols-1 md:grid-cols-2 gap-6 bg-opacity-40">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gov-text uppercase border-b border-gov-border border-opacity-35 pb-1">Cryptographic Ledger Seals</h4>
                  
                  <div className="space-y-3 font-mono text-[10px] text-gov-muted">
                    <div>
                      <span className="text-gov-text font-bold block uppercase text-[9px]">SHA-256 Hash Anchoring Stamp</span>
                      <span className="block bg-gov-dark p-2 rounded border border-gov-border break-all leading-tight text-gov-primaryLight mt-0.5 select-all">
                        {selectedRecording.hash}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                      <div>
                        <span className="text-gov-muted block uppercase text-[9px]">File Size</span>
                        <span className="text-gov-text font-bold block mt-0.5">{selectedRecording.size}</span>
                      </div>
                      <div>
                        <span className="text-gov-muted block uppercase text-[9px]">Stream Encryption</span>
                        <span className="text-gov-success font-semibold flex items-center gap-1 mt-0.5">
                          <Lock className="w-3 h-3" /> {selectedRecording.encryption}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gov-text uppercase border-b border-gov-border border-opacity-35 pb-1">Access Clearances</h4>
                  <div className="p-3 bg-gov-primary bg-opacity-5 border border-gov-primary border-opacity-20 rounded-lg text-xs leading-relaxed text-gov-muted">
                    <p className="text-[10px]">
                      This recording remains sealed under compliance codes (M6 audit trails). Only the following authorized governance roles may access:
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedRecording.authorizedRoles.map(role => (
                        <span key={role} className="px-2 py-0.5 rounded bg-gov-dark border border-gov-border text-[9px] font-mono text-gov-text">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="gov-card p-20 text-center text-gov-muted flex flex-col items-center justify-center space-y-4 min-h-[400px]">
              <Film className="w-12 h-12 text-gov-muted opacity-40 animate-pulse" />
              <div>
                <h4 className="text-xs font-bold text-gov-text">Playlist Empty</h4>
                <p className="text-[10px] text-gov-muted mt-1">Upload a recording on the left panel to begin streaming.</p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
