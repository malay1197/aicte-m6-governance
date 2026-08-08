// AICTE Security & Governance Platform - M6 Mock Data System

export const mockMeetings = [
  {
    id: "meet-001",
    name: "AICTE Review Meeting - Budget Allocations Q3",
    date: "2026-08-05",
    startTime: "10:00 AM",
    endTime: "11:30 AM",
    totalParticipants: 12,
    present: 10,
    absent: 2,
    late: 3,
    status: "Completed",
    participants: [
      { id: "p-001", name: "Dr. Anil Sahasrabudhe", role: "Chairman", joinTime: "09:55 AM", leaveTime: "11:30 AM", duration: "95 min", status: "Present" },
      { id: "p-002", name: "Prof. Rajive Kumar", role: "Member Secretary", joinTime: "09:58 AM", leaveTime: "11:30 AM", duration: "92 min", status: "Present" },
      { id: "p-003", name: "Dr. Abhay Jere", role: "Chief Innovation Officer", joinTime: "10:05 AM", leaveTime: "11:28 AM", duration: "83 min", status: "Late" },
      { id: "p-004", name: "Shri Vineet Joshi", role: "Government Nominee", joinTime: "09:54 AM", leaveTime: "11:15 AM", duration: "81 min", status: "Left Early" },
      { id: "p-005", name: "Smt. Mamta R. Agarwal", role: "Adviser I", joinTime: "10:08 AM", leaveTime: "11:30 AM", duration: "82 min", status: "Late" },
      { id: "p-006", name: "Dr. Ramesh Unnikrishnan", role: "Advisor II", joinTime: "09:59 AM", leaveTime: "11:30 AM", duration: "91 min", status: "Present" },
      { id: "p-007", name: "Prof. M.P. Poonia", role: "Vice Chairman", joinTime: "09:57 AM", leaveTime: "11:30 AM", duration: "93 min", status: "Present" },
      { id: "p-008", name: "Shri Harish C. Rai", role: "Advisor (E&T)", joinTime: "10:15 AM", leaveTime: "11:30 AM", duration: "75 min", status: "Late" },
      { id: "p-009", name: "Dr. Amit Dutta", role: "Regional Officer", joinTime: "09:59 AM", leaveTime: "11:30 AM", duration: "91 min", status: "Present" },
      { id: "p-010", name: "Shri Sanjeev Kumar", role: "System Administrator", joinTime: "09:50 AM", leaveTime: "11:30 AM", duration: "100 min", status: "Present" },
      { id: "p-011", name: "Prof. K.K. Aggarwal", role: "NBA Chairman", joinTime: "--", leaveTime: "--", duration: "0 min", status: "Absent" },
      { id: "p-012", name: "Dr. K.P. Isaac", role: "External Expert", joinTime: "--", leaveTime: "--", duration: "0 min", status: "Absent" },
    ]
  },
  {
    id: "meet-002",
    name: "Project Evaluation Committee - Smart India Hackathon",
    date: "2026-08-06",
    startTime: "02:00 PM",
    endTime: "04:30 PM",
    totalParticipants: 8,
    present: 7,
    absent: 1,
    late: 1,
    status: "Completed",
    participants: [
      { id: "p-001", name: "Dr. Abhay Jere", role: "Chief Innovation Officer", joinTime: "01:55 PM", leaveTime: "04:30 PM", duration: "155 min", status: "Present" },
      { id: "p-013", name: "Mr. Malay Vyas", role: "SIH Evaluator (M6 Panel)", joinTime: "01:50 PM", leaveTime: "04:30 PM", duration: "160 min", status: "Present" },
      { id: "p-014", name: "Dr. Mohit Gambhir", role: "Innovation Director", joinTime: "02:03 PM", leaveTime: "04:28 PM", duration: "145 min", status: "Late" },
      { id: "p-015", name: "Smt. Vinita Singhal", role: "Industry Representative", joinTime: "01:58 PM", leaveTime: "04:30 PM", duration: "152 min", status: "Present" },
      { id: "p-016", name: "Prof. S. R. Patel", role: "Senior Academician", joinTime: "01:59 PM", leaveTime: "04:30 PM", duration: "151 min", status: "Present" },
      { id: "p-017", name: "Dr. Sunita Sharma", role: "DST Representative", joinTime: "01:57 PM", leaveTime: "04:10 PM", duration: "133 min", status: "Left Early" },
      { id: "p-018", name: "Shri Neeraj Saxena", role: "Advisor (RIFD)", joinTime: "01:54 PM", leaveTime: "04:30 PM", duration: "156 min", status: "Present" },
      { id: "p-019", name: "Dr. Nitin Kumar", role: "External Evaluator", joinTime: "--", leaveTime: "--", duration: "0 min", status: "Absent" },
    ]
  },
  {
    id: "meet-003",
    name: "Faculty Governance Meeting - National Level Norms",
    date: "2026-08-07",
    startTime: "11:00 AM",
    endTime: "01:00 PM",
    totalParticipants: 15,
    present: 13,
    absent: 2,
    late: 2,
    status: "Completed",
    participants: [
      { id: "p-001", name: "Dr. Anil Sahasrabudhe", role: "Chairman", joinTime: "10:55 AM", leaveTime: "01:00 PM", duration: "125 min", status: "Present" },
      { id: "p-002", name: "Prof. Rajive Kumar", role: "Member Secretary", joinTime: "10:59 AM", leaveTime: "01:00 PM", duration: "121 min", status: "Present" },
      { id: "p-006", name: "Dr. Ramesh Unnikrishnan", role: "Advisor II", joinTime: "11:04 AM", leaveTime: "01:00 PM", duration: "116 min", status: "Late" },
      { id: "p-007", name: "Prof. M.P. Poonia", role: "Vice Chairman", joinTime: "10:54 AM", leaveTime: "12:45 PM", duration: "111 min", status: "Left Early" },
      { id: "p-020", name: "Prof. Devender Singh", role: "UGC Nominee", joinTime: "10:58 AM", leaveTime: "01:00 PM", duration: "122 min", status: "Present" },
      { id: "p-021", name: "Shri R.K. Soni", role: "Director (Adms)", joinTime: "11:10 AM", leaveTime: "01:00 PM", duration: "110 min", status: "Late" },
      { id: "p-022", name: "Dr. Manpreet Singh Manna", role: "Associate Professor", joinTime: "10:56 AM", leaveTime: "01:00 PM", duration: "124 min", status: "Present" },
      { id: "p-023", name: "Prof. G. D. Roy", role: "IIT Representative", joinTime: "10:58 AM", leaveTime: "01:00 PM", duration: "122 min", status: "Present" },
      { id: "p-024", name: "Dr. Preeti Bajaj", role: "Private Institute Representative", joinTime: "10:57 AM", leaveTime: "01:00 PM", duration: "123 min", status: "Present" },
      { id: "p-025", name: "Shri Anand Sharma", role: "Finance Officer", joinTime: "10:59 AM", leaveTime: "01:00 PM", duration: "121 min", status: "Present" },
      { id: "p-026", name: "Dr. R. G. Rao", role: "NIT Representative", joinTime: "10:55 AM", leaveTime: "12:50 PM", duration: "115 min", status: "Left Early" },
      { id: "p-027", name: "Smt. Shashi Bala", role: "Legal Consultant", joinTime: "10:58 AM", leaveTime: "01:00 PM", duration: "122 min", status: "Present" },
      { id: "p-028", name: "Dr. Hemant Kumar", role: "Policy Advisor", joinTime: "10:57 AM", leaveTime: "01:00 PM", duration: "123 min", status: "Present" },
      { id: "p-029", name: "Prof. A. C. Mitra", role: "Governing Council Member", joinTime: "--", leaveTime: "--", duration: "0 min", status: "Absent" },
      { id: "p-030", name: "Dr. S. K. Gupta", role: "State Govt Representative", joinTime: "--", leaveTime: "--", duration: "0 min", status: "Absent" },
    ]
  },
  {
    id: "meet-004",
    name: "Student Welfare Committee - Grievance Redressal",
    date: "2026-08-08",
    startTime: "09:30 AM",
    endTime: "11:00 AM",
    totalParticipants: 6,
    present: 5,
    absent: 1,
    late: 0,
    status: "Completed",
    participants: [
      { id: "p-031", name: "Prof. Dileep N. Malkhede", role: "Chairman (Welfare)", joinTime: "09:25 AM", leaveTime: "11:00 AM", duration: "95 min", status: "Present" },
      { id: "p-032", name: "Dr. Sandeep Singh", role: "Student Coordinator", joinTime: "09:28 AM", leaveTime: "11:00 AM", duration: "92 min", status: "Present" },
      { id: "p-033", name: "Ms. Ananya Roy", role: "Student Council Head", joinTime: "09:29 AM", leaveTime: "11:00 AM", duration: "91 min", status: "Present" },
      { id: "p-034", name: "Mr. Rohan Mehta", role: "Student Secretary", joinTime: "09:27 AM", leaveTime: "10:55 AM", duration: "88 min", status: "Present" },
      { id: "p-035", name: "Dr. Asha Kumari", role: "Counselling Head", joinTime: "09:30 AM", leaveTime: "11:00 AM", duration: "90 min", status: "Present" },
      { id: "p-036", name: "Prof. J. C. Verma", role: "Academic Dean", joinTime: "--", leaveTime: "--", duration: "0 min", status: "Absent" }
    ]
  }
];

export const mockAuditLogs = [
  { id: "log-101", timestamp: "2026-08-08 14:15:22", user: "admin_aicte", action: "Report Generated", module: "Reports (M6)", ip: "192.168.1.45", status: "Success", severity: "INFO", details: "Generated Security Audit Report for Q2." },
  { id: "log-102", timestamp: "2026-08-08 13:58:10", user: "sys_monitor", action: "Security Warning", module: "Audit (M6)", ip: "10.0.4.12", status: "Triggered", severity: "CRITICAL", details: "Multiple failed login attempts detected on admin profile." },
  { id: "log-103", timestamp: "2026-08-08 13:10:44", user: "prof_rajive", action: "Meeting Created", module: "Meeting (M2)", ip: "172.16.22.102", status: "Success", severity: "INFO", details: "Faculty Governance Meeting - National Level Norms created successfully." },
  { id: "log-104", timestamp: "2026-08-08 12:45:00", user: "shri_sanjeev", action: "Permission Changed", module: "Auth (M1)", ip: "192.168.1.12", status: "Success", severity: "WARNING", details: "Granted temporary read permissions to DST Representative on project evaluation." },
  { id: "log-105", timestamp: "2026-08-08 11:30:12", user: "dr_anil", action: "File Accessed", module: "Files (M3)", ip: "192.168.1.10", status: "Success", severity: "INFO", details: "Accessed budget allocation sheet AICTE_Budget_2026_Q3.pdf." },
  { id: "log-106", timestamp: "2026-08-08 11:04:15", user: "dr_ramesh", action: "Participant Joined", module: "Attendance (M6)", ip: "172.16.24.55", status: "Success", severity: "INFO", details: "Prof Ramesh Unnikrishnan joined Faculty Governance Meeting." },
  { id: "log-107", timestamp: "2026-08-08 10:15:32", user: "unauthorized_user", action: "User Login", module: "Auth (M1)", ip: "185.220.101.4", status: "Failed", severity: "CRITICAL", details: "Login attempt with incorrect credentials on admin console from foreign IP." },
  { id: "log-108", timestamp: "2026-08-08 09:55:00", user: "dr_anil", action: "User Login", module: "Auth (M1)", ip: "192.168.1.10", status: "Success", severity: "INFO", details: "Chairman successfully completed multi-factor authentication (MFA)." },
  { id: "log-109", timestamp: "2026-08-08 09:54:12", user: "shri_vineet", action: "Participant Joined", module: "Attendance (M6)", ip: "192.168.1.33", status: "Success", severity: "INFO", details: "Shri Vineet Joshi joined AICTE Review Meeting." },
  { id: "log-110", timestamp: "2026-08-08 09:30:05", user: "prof_dileep", action: "Participant Joined", module: "Attendance (M6)", ip: "172.16.54.12", status: "Success", severity: "INFO", details: "Prof Dileep Malkhede joined Student Welfare Committee Meeting." },
  { id: "log-111", timestamp: "2026-08-07 16:40:12", user: "blockchain_agent", action: "Record Updated", module: "Blockchain (M4)", ip: "10.0.12.99", status: "Success", severity: "INFO", details: "Committed transaction hash for Faculty Governance decisions to ledger." },
  { id: "log-112", timestamp: "2026-08-07 14:15:10", user: "admin_aicte", action: "Report Generated", module: "Reports (M6)", ip: "192.168.1.45", status: "Success", severity: "INFO", details: "Generated Attendance Summary Report for July 2026." },
  { id: "log-113", timestamp: "2026-08-07 11:15:00", user: "shri_vineet", action: "Participant Left", module: "Attendance (M6)", ip: "192.168.1.33", status: "Success", severity: "WARNING", details: "Shri Vineet Joshi left AICTE Review Meeting early (90% session remaining)." },
  { id: "log-114", timestamp: "2026-08-06 15:58:33", user: "malay_evaluator", action: "File Accessed", module: "Files (M3)", ip: "192.168.2.110", status: "Success", severity: "INFO", details: "Accessed SIH Hackathon Evaluation Guidelines.pdf." },
  { id: "log-115", timestamp: "2026-08-06 13:00:22", user: "hacker_ip", action: "Unauthorized Access Attempt", module: "Auth (M1)", ip: "198.51.100.12", status: "Blocked", severity: "CRITICAL", details: "Attempt to download transcription database file directly without OAuth headers." }
];

export const mockSecurityEvents = [
  { id: "sec-001", title: "Multiple failed login attempts", description: "System detected 6 unsuccessful login attempts on 'admin_aicte' within 2 minutes. Source IP: 185.220.101.4 (VPN Exit Node). Remediation: IP address quarantined for 24 hours, triggered manual MFA notification.", timestamp: "2026-08-08 13:58:10", severity: "CRITICAL", status: "Active", icon: "warning", details: "IP quarantined. AICTE governance team notified via emergency alert panel." },
  { id: "sec-002", title: "Permission updated securely", description: "Admin granted temporary read permissions on evaluation files to external committee member. Action verified against blockchain digital token registry.", timestamp: "2026-08-08 12:45:00", severity: "INFO", status: "Resolved", icon: "success", details: "Verified with Blockchain ledger (M4). Audit node logged txn: 0x8a92f...bc34." },
  { id: "sec-003", title: "Unauthorized access attempt", description: "Attempted direct download of meeting recording files without valid OAuth JWT header. IP: 198.51.100.12. Session dropped automatically.", timestamp: "2026-08-06 13:00:22", severity: "CRITICAL", status: "Active", icon: "warning", details: "Blocked at Gateway. M3 File server secure shield active." },
  { id: "sec-004", title: "Security event resolved", description: "Suspicious API polling on governance endpoints resolved. Incident traced to automated network diagnosis check from AICTE IT cell.", timestamp: "2026-08-05 09:12:40", severity: "WARNING", status: "Resolved", icon: "success", details: "Source verified as internal AICTE server IP (10.0.12.14). Added to safe list." }
];

export const mockMemoryRecords = [
  {
    id: "mem-001",
    title: "AICTE Review Meeting - Budget Allocations Q3 2026",
    category: "Meetings",
    date: "2026-08-05",
    relevance: 98,
    details: {
      summary: "AICTE quarterly budget allocation approval. Allocated INR 12.5 Crores for college modernizations and SIH incubation supports.",
      decision: "Approved funding increase of 15% for innovation cell labs.",
      actionItems: "Dr. Abhay Jere to finalize dispersal metrics by August 20.",
      blockchainHash: "0x892e8bf723da890bf2a3e9c8821a9980d28711e9a2bc91e772153c3d2890fb91",
      authorizedRoles: ["Admin", "Chairman", "Member Secretary", "CIO", "Advisor"],
      documents: ["AICTE_Budget_2026_Q3.pdf", "SIH_Incubation_Grants_Final.xlsx"],
      aiHighlights: "Decided in 12 mins. Primary advocates: Prof M.P. Poonia, Dr. Abhay Jere."
    }
  },
  {
    id: "mem-002",
    title: "SIH Incubation Grant Dispersal Scheme",
    category: "Decisions",
    date: "2026-08-05",
    relevance: 92,
    details: {
      summary: "Approval of the criteria for selecting hackathon project prototypes for incubation funding. Allocation structure details.",
      decision: "SIH final prototypes with gold rating will receive 2 Lakhs seed grant directly via decentralized escrow.",
      actionItems: "All state coordinators to distribute guidelines within 3 days.",
      blockchainHash: "0xf3a890b7218d22e8bf287c8811e92bc9153c99e9c88e77c3d215bda90ab228fc",
      authorizedRoles: ["Admin", "Chairman", "CIO", "Evaluator"],
      documents: ["Incubation_Select_Guidelines_v2.pdf"],
      aiHighlights: "Consensus reached rapidly. AI highlighted risk: Escrow needs KYC links."
    }
  },
  {
    id: "mem-003",
    title: "SIH Hackathon Evaluation Guidelines.pdf",
    category: "Documents",
    date: "2026-08-06",
    relevance: 87,
    details: {
      summary: "Official governance booklet for Smart India Hackathon evaluators containing evaluation scoresheets, feedback rubrics, and NDA agreements.",
      decision: "All evaluators must accept digitized NDA verified with e-signatures.",
      actionItems: "Governance audit system M6 must record all guidlines access logs.",
      blockchainHash: "0xd87211e9980ab2bc91e772153f3a890bf723da890bf2a3e9c882128711e9a25b",
      authorizedRoles: ["Admin", "Chairman", "Member Secretary", "CIO", "Evaluator"],
      documents: ["SIH_Hackathon_Evaluation_Guidelines.pdf"],
      aiHighlights: "Standard annual guidelines. Updated formatting on section 4 (Auditing)."
    }
  },
  {
    id: "mem-004",
    title: "M6 Audit Trail compliance check & report publishing",
    category: "Actions",
    date: "2026-08-08",
    relevance: 80,
    details: {
      summary: "Action item assigned during Faculty Governance norms review. Mandates weekly publication of secure audit log hashes to public blockchain.",
      decision: "M6 security module will automatically commit audit hashes every Saturday at 18:00 UTC.",
      actionItems: "System admin to audit the Cron trigger logs.",
      blockchainHash: "0xe2bc91e772153c3d2890fb910892e8bf723da890bf2a3e9c8821a9980d28711e9",
      authorizedRoles: ["Admin", "Advisor"],
      documents: ["Audit_Compliance_Mandate_AICTE.pdf"],
      aiHighlights: "Auto-scheduler configured successfully in compliance with security guidelines."
    }
  },
  {
    id: "mem-005",
    title: "Faculty Governance Meeting - National Level Norms 2026",
    category: "Meetings",
    date: "2026-08-07",
    relevance: 75,
    details: {
      summary: "Governance committee meeting focused on modifying institutional norms for technical colleges in tier-3 cities.",
      decision: "Modified student-faculty ratio to 1:20 for colleges with NBA accreditation.",
      actionItems: "Shri R.K. Soni to draft and publish gazette notification.",
      blockchainHash: "0xc8821a9980d28711e9a2bc91e772153c3d2890fb910892e8bf723da890bf2a3e9",
      authorizedRoles: ["Admin", "Chairman", "Member Secretary", "Advisor"],
      documents: ["AICTE_Norms_Draft_V4.pdf", "NBA_Accredited_Colleges_List_2026.xlsx"],
      aiHighlights: "Extensive debate over tier-3 exceptions. Transcripts detail dissent on section 3.2."
    }
  }
];

export const mockNotifications = [
  { id: "not-001", message: "Reminder: Review meeting report for 'AICTE Review Meeting' is pending signoff.", timestamp: "2026-08-08 14:00:00", priority: "HIGH", read: false, type: "reminder" },
  { id: "not-002", message: "Action Item: Approve SIH incubation grant criteria by tonight.", timestamp: "2026-08-08 12:30:00", priority: "HIGH", read: false, type: "action" },
  { id: "not-003", message: "Security Alert: VPN login detected on 'unauthorized_user' profile.", timestamp: "2026-08-08 10:15:35", priority: "CRITICAL", read: false, type: "security" },
  { id: "not-004", message: "Report generated: Quarterly Security Audit Report Q2 is ready for download.", timestamp: "2026-08-08 09:00:00", priority: "MEDIUM", read: true, type: "report" },
  { id: "not-005", message: "Attendance issue: Prof. K.K. Aggarwal marked Absent in AICTE Review Meeting.", timestamp: "2026-08-05 11:35:00", priority: "MEDIUM", read: true, type: "attendance" }
];

export const mockDashboardStats = {
  totalMeetings: 24,
  totalParticipants: 184,
  attendanceRate: "89.2%",
  securityEvents: 4,
  pendingActions: 3,
  recentActivities: [
    { text: "Security Audit Report generated by admin_aicte", time: "10 mins ago", type: "report" },
    { text: "Critical security event: Failed login from VPN IP", time: "25 mins ago", type: "security" },
    { text: "Prof Ramesh Unnikrishnan marked Late (Governance Meeting)", time: "3 hours ago", type: "attendance" },
    { text: "Blockchain ledger committed 3 new decision hashes", time: "1 day ago", type: "blockchain" }
  ]
};
