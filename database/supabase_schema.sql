-- Supabase Schema DDL for AICTE M6 Secure Governance Platform

-- 1. Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_username VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    module_name VARCHAR(50) NOT NULL,
    ip_address INET,
    status VARCHAR(25) NOT NULL,
    severity_level VARCHAR(15) CHECK (severity_level IN ('INFO', 'WARNING', 'CRITICAL')) DEFAULT 'INFO',
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_severity ON audit_logs(severity_level);

-- 2. Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'Scheduled',
    description TEXT,
    room_name VARCHAR(100),
    created_by VARCHAR(50)
);

-- 3. Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create meeting_participants table
CREATE TABLE IF NOT EXISTS meeting_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    allowed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create attendance_sessions table
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(50) UNIQUE NOT NULL,
    join_time TIMESTAMP WITH TIME ZONE NOT NULL,
    leave_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER DEFAULT 0,
    status VARCHAR(25) CHECK (status IN ('Active', 'Completed')) DEFAULT 'Active',
    last_heartbeat TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create compliance_reports table
CREATE TABLE IF NOT EXISTS compliance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_number VARCHAR(30) UNIQUE NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    compiled_by_username VARCHAR(50) NOT NULL,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE DEFAULT CURRENT_DATE,
    blockchain_ledger_hash VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    priority_level VARCHAR(15) CHECK (priority_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'MEDIUM',
    notification_type VARCHAR(30) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Create institutional_memory table
CREATE TABLE IF NOT EXISTS institutional_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) CHECK (category IN ('Meetings', 'Decisions', 'Documents', 'Actions')),
    record_date DATE NOT NULL,
    summary TEXT NOT NULL,
    decision_details TEXT NOT NULL,
    action_items TEXT,
    documents_list TEXT[],
    authorized_roles VARCHAR(50)[] NOT NULL,
    blockchain_hash VARCHAR(66),
    ai_transcript_segment TEXT,
    search_vector tsvector,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed baseline data
INSERT INTO users (id, name, email, role) VALUES
('admin_aicte', 'Dr. Abhay Jere', 'abhay.jere@aicte-india.org', 'Admin'),
('student_rahul', 'Rahul Patel', 'rahul.patel@sih.gov.in', 'Student'),
('prof_rajive', 'Prof. Rajive Kumar', 'rajive.kumar@aicte-india.org', 'Member Secretary')
ON CONFLICT (id) DO NOTHING;

INSERT INTO meetings (id, title, scheduled_start, scheduled_end, status, description, room_name, created_by) VALUES
('00000000-0000-0000-0000-000000000001', 'AICTE Review Meeting - Budget Allocations Q3', '2026-08-05 10:00:00+05:30', '2026-08-05 11:30:00+05:30', 'Completed', 'Budget review', 'AICTE-Sec-Room-meet-001', 'admin_aicte'),
('00000000-0000-0000-0000-000000000002', 'Project Evaluation Committee - Smart India Hackathon', '2026-08-06 14:00:00+05:30', '2026-08-06 16:30:00+05:30', 'Completed', 'SIH review', 'AICTE-Sec-Room-meet-002', 'admin_aicte')
ON CONFLICT (id) DO NOTHING;

INSERT INTO meeting_participants (meeting_id, user_id, allowed) VALUES
('00000000-0000-0000-0000-000000000001', 'admin_aicte', TRUE),
('00000000-0000-0000-0000-000000000001', 'prof_rajive', TRUE),
('00000000-0000-0000-0000-000000000002', 'admin_aicte', TRUE),
('00000000-0000-0000-0000-000000000002', 'student_rahul', TRUE)
ON CONFLICT DO NOTHING;
