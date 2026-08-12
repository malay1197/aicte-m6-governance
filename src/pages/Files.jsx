import React, { useState, useRef } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Lock, 
  CheckCircle, 
  AlertTriangle,
  FolderOpen,
  Info,
  Clock,
  Layers,
  ChevronDown,
  UserCheck,
  X
} from 'lucide-react';

export default function Files() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [files, setFiles] = useState([
    {
      id: 'file-001',
      name: 'AICTE_Budget_2026_Q3.pdf',
      size: '4.2 MB',
      type: 'PDF',
      uploadedAt: '2026-08-05 11:30 AM',
      version: 'v2.1',
      encryption: 'AES-256-GCM',
      authorizedRoles: ['Admin', 'Chairman', 'CIO'],
      hash: '0x892e8bf723da890bf2a3e9c8821a9980d28711e9a2bc91e772153c3d2890fb91',
      storage: 'MinIO Bucket S3-Gov-1'
    },
    {
      id: 'file-002',
      name: 'SIH_Incubation_Grants_Final.xlsx',
      size: '12.5 MB',
      type: 'XLSX',
      uploadedAt: '2026-08-05 12:45 PM',
      version: 'v1.0',
      encryption: 'AES-256-GCM',
      authorizedRoles: ['Admin', 'CIO', 'Evaluator'],
      hash: '0xf3a890b7218d22e8bf287c8811e92bc9153c99e9c88e77c3d215bda90ab228fc',
      storage: 'MinIO Bucket S3-Gov-1'
    },
    {
      id: 'file-003',
      name: 'SIH_Hackathon_Evaluation_Guidelines.pdf',
      size: '2.8 MB',
      type: 'PDF',
      uploadedAt: '2026-08-06 01:58 PM',
      version: 'v1.4',
      encryption: 'AES-256-GCM',
      authorizedRoles: ['Admin', 'Evaluator', 'Chairman'],
      hash: '0xd87211e9980ab2bc91e772153f3a890bf723da890bf2a3e9c882128711e9a25b',
      storage: 'MinIO Bucket S3-Gov-2'
    }
  ]);

  // Upload States
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null); // null, 0-100
  const [uploadError, setUploadError] = useState('');
  const [selectedFileDetails, setSelectedFileDetails] = useState(null);
  
  const fileInputRef = useRef(null);

  // Drag and drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFileUpload(droppedFiles[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      processFileUpload(e.target.files[0]);
    }
  };

  const processFileUpload = (file) => {
    setUploadError('');
    
    // File validation limits
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    const maxSizeBytes = 20 * 1024 * 1024; // 20MB

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.xlsx')) {
      setUploadError('Invalid format. Only PDF and XLSX spreadsheets are authorized.');
      return;
    }

    if (file.size > maxSizeBytes) {
      setUploadError('Size limit exceeded. Maximum file size allowed is 20MB.');
      return;
    }

    // Simulate S3 upload with progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Add to files list
          const newFile = {
            id: `file-${Date.now()}`,
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            type: file.name.endsWith('.pdf') ? 'PDF' : 'XLSX',
            uploadedAt: new Date().toLocaleString(),
            version: 'v1.0',
            encryption: 'AES-256-GCM',
            authorizedRoles: ['Admin', 'Chairman'],
            hash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
            storage: 'MinIO Bucket S3-Gov-1'
          };
          
          setFiles(prevFiles => [newFile, ...prevFiles]);
          setUploadProgress(null);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  const handleDeleteFile = (id) => {
    if (window.confirm('Are you sure you want to securely purge this document from governance servers?')) {
      setFiles(files.filter(f => f.id !== id));
      if (selectedFileDetails?.id === id) {
        setSelectedFileDetails(null);
      }
    }
  };

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || f.authorizedRoles.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Header and S3 Status info */}
      <div className="gov-card flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-md font-bold text-gov-text">AES-256 Encrypted S3 Document Storage</h3>
          <p className="text-xs text-gov-muted mt-0.5">
            Manage administrative circulars, budget proposals, guidelines, and signed evaluation sheets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-gov-success animate-ping"></span>
          <span className="text-xs text-gov-success font-bold uppercase">MinIO S3 Cluster - Primary Connected</span>
        </div>
      </div>

      {/* 2. Upload and Files List Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Drag/Drop Upload Area */}
        <div className="space-y-4 xl:col-span-1">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            className={`gov-card border-dashed border-2 py-10 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer transition-all ${
              isDragging 
                ? 'border-gov-primary bg-gov-primary bg-opacity-10 scale-[1.02]' 
                : 'border-gov-border hover:border-gov-primary hover:bg-opacity-5'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileInputChange}
              className="hidden"
              accept=".pdf,.xlsx"
            />
            <div className="p-4 rounded-full bg-gov-dark border border-gov-border text-gov-primaryLight">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold text-gov-text block">Drag & Drop Secure Document</span>
              <p className="text-[10px] text-gov-muted mt-1 max-w-xs mx-auto leading-relaxed">
                Supports official PDF reports or XLSX spreadsheets. Max file size: 20MB. Automatically signs & encrypts on ingest.
              </p>
            </div>
          </div>

          {/* Dynamic Upload Progress */}
          {uploadProgress !== null && (
            <div className="gov-card space-y-2 p-4 border border-gov-primary border-opacity-35">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gov-primaryLight font-bold">Uploading document...</span>
                <span className="font-mono font-bold text-gov-text">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gov-dark rounded-full h-2.5 overflow-hidden border border-gov-border">
                <div 
                  className="bg-gov-primary h-full transition-all duration-150" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Errors */}
          {uploadError && (
            <div className="p-3.5 rounded-lg bg-gov-danger bg-opacity-10 border border-gov-danger border-opacity-35 flex items-start gap-2.5 text-xs text-gov-danger">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* Right Columns: Search, Filters & File List Grid */}
        <div className="xl:col-span-2 space-y-4">
          {/* Filters Bar */}
          <div className="gov-card flex flex-col md:flex-row gap-4 items-center justify-between p-4">
            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-gov-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search file name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-gov-dark border border-gov-border rounded text-xs text-gov-text focus:outline-none focus:border-gov-primary transition"
              />
            </div>

            {/* Filter by Roles */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full md:w-44 bg-gov-dark border border-gov-border rounded text-xs text-gov-text px-3 py-1.5 focus:outline-none focus:border-gov-primary"
            >
              <option value="All">All Permission Roles</option>
              <option value="Admin">Admin</option>
              <option value="Chairman">Chairman</option>
              <option value="CIO">CIO</option>
              <option value="Evaluator">Evaluator</option>
            </select>
          </div>

          {/* File Grid */}
          {filteredFiles.length > 0 ? (
            <div className="space-y-3">
              {filteredFiles.map((file) => (
                <div 
                  key={file.id}
                  className="gov-card flex flex-col md:flex-row justify-between items-start md:items-center p-4 gap-4 hover:border-gov-primary hover:border-opacity-30 transition-all cursor-pointer glass-hover"
                  onClick={() => setSelectedFileDetails(file)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded bg-gov-dark border border-gov-border text-gov-primaryLight">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gov-text block">{file.name}</span>
                      <div className="flex items-center gap-3 text-[10px] text-gov-muted mt-1 font-mono">
                        <span>Size: {file.size}</span>
                        <span>•</span>
                        <span>Ver: {file.version}</span>
                        <span>•</span>
                        <span className="text-gov-success font-semibold flex items-center gap-1">
                          <Lock className="w-3 h-3" /> {file.encryption}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-stretch md:self-auto justify-end border-t md:border-t-0 border-gov-border border-opacity-35 pt-3 md:pt-0">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Downloading ${file.name} locally from secure node...`);
                      }}
                      className="p-2 bg-gov-dark border border-gov-border rounded text-gov-muted hover:text-gov-text hover:bg-slate-800 transition"
                      title="Download file"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id);
                      }}
                      className="p-2 bg-gov-dark border border-gov-border rounded text-gov-danger hover:bg-gov-danger hover:bg-opacity-10 transition"
                      title="Delete file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="gov-card p-12 text-center text-gov-muted flex flex-col items-center justify-center space-y-3">
              <FolderOpen className="w-12 h-12 text-gov-muted opacity-40" />
              <div>
                <h4 className="text-xs font-bold text-gov-text">No Secure Files Discovered</h4>
                <p className="text-[10px] text-gov-muted mt-1">Upload a PDF or spreadsheet on the left pane to get started.</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* File Details Audit Inspector Modal */}
      {selectedFileDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gov-card border border-gov-border rounded-xl w-full max-w-xl overflow-hidden animate-slide-up shadow-glow-primary">
            
            {/* Header */}
            <div className="p-6 bg-gov-border bg-opacity-40 border-b border-gov-border flex justify-between items-center">
              <div className="flex items-center gap-2 text-gov-text">
                <Lock className="w-5 h-5 text-gov-success" />
                <h4 className="font-bold text-xs uppercase tracking-wider">Secure Document Audit Inspector</h4>
              </div>
              <button 
                onClick={() => setSelectedFileDetails(null)}
                className="text-gov-muted hover:text-gov-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gov-muted font-semibold block uppercase">Document Name</span>
                  <span className="text-gov-text font-bold block mt-1">{selectedFileDetails.name}</span>
                </div>
                <div>
                  <span className="text-gov-muted font-semibold block uppercase">Secure Storage Node</span>
                  <span className="text-gov-text block font-mono mt-1">{selectedFileDetails.storage}</span>
                </div>
              </div>

              <div>
                <span className="text-gov-muted font-semibold block uppercase mb-1">Cryptographic Hash Seal</span>
                <span className="text-gov-text font-mono block bg-gov-dark p-2.5 rounded border border-gov-border break-all leading-tight select-all">
                  {selectedFileDetails.hash}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-gov-muted font-semibold block uppercase">File Size</span>
                  <span className="text-gov-text font-semibold block mt-0.5">{selectedFileDetails.size}</span>
                </div>
                <div>
                  <span className="text-gov-muted font-semibold block uppercase">Active Version</span>
                  <span className="text-gov-text font-mono font-semibold block mt-0.5">{selectedFileDetails.version}</span>
                </div>
                <div>
                  <span className="text-gov-muted font-semibold block uppercase">Upload Stamp</span>
                  <span className="text-gov-text font-semibold block mt-0.5">{selectedFileDetails.uploadedAt}</span>
                </div>
              </div>

              <div className="p-3 rounded bg-gov-primary bg-opacity-5 border border-gov-primary border-opacity-20">
                <div className="flex items-center gap-2 text-gov-primaryLight font-bold mb-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>M1 RBAC Security Clearances</span>
                </div>
                <p className="text-[10px] text-gov-muted leading-relaxed">
                  Only compliance officers holding the following active governance credentials can decipher this file:
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedFileDetails.authorizedRoles.map(role => (
                    <span key={role} className="px-2 py-0.5 rounded bg-gov-dark border border-gov-border text-[9px] font-mono text-gov-text">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gov-dark bg-opacity-50 border-t border-gov-border flex justify-end gap-3">
              <button 
                onClick={() => setSelectedFileDetails(null)}
                className="px-4 py-2 rounded bg-gov-primary text-white hover:bg-opacity-95 text-xs font-semibold shadow-glow-primary"
              >
                Close Audit
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
