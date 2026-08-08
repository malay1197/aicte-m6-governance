-- ============================================================================
-- AICTE SECURITY & GOVERNANCE PORTAL - DATABASE SCHEMA
-- MODULE 6: AUDIT + ATTENDANCE + REPORTS + INSTITUTIONAL MEMORY
-- ============================================================================

-- This schema outlines the SQL tables required for Module 6.
-- It runs on PostgreSQL and demonstrates Full-Text Search (FTS) indexing
-- and foreign keys linking M6 with outside modules (M1, M2, M3, M4).

-- ----------------------------------------------------------------------------
-- 1. FOREIGN TABLE REF: USER REGISTRY (M1 Authentication System)
-- ----------------------------------------------------------------------------
-- CREATE TABLE users (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     username VARCHAR(50) UNIQUE NOT NULL,
--     email VARCHAR(100) UNIQUE NOT NULL,
--     role VARCHAR(30) NOT NULL -- 'Admin', 'Chairman', 'CIO', 'Advisor', etc.
-- );

-- ----------------------------------------------------------------------------
-- 2. FOREIGN TABLE REF: MEETINGS LEDGER (M2 Meeting System)
-- ----------------------------------------------------------------------------
-- CREATE TABLE meetings (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     title VARCHAR(200) NOT NULL,
--     scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
--     scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
--     status VARCHAR(20) DEFAULT 'Scheduled' -- 'Scheduled', 'Live', 'Completed'
-- );

-- ----------------------------------------------------------------------------
-- 3. AUDIT LOGS TABLE (M6 Core)
-- ----------------------------------------------------------------------------
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_username VARCHAR(50) NOT NULL, -- Cached username for performance
    action VARCHAR(100) NOT NULL, -- 'User Login', 'Meeting Created', 'Permission Changed', etc.
    module_name VARCHAR(50) NOT NULL, -- 'Auth (M1)', 'Meeting (M2)', 'Files (M3)', 'Audit (M6)', etc.
    ip_address INET, -- Supports ipv4 or ipv6 addresses
    device_fingerprint TEXT,
    details TEXT, -- Complete JSON context of what changed
    status VARCHAR(25) NOT NULL, -- 'Success', 'Failed', 'Triggered', 'Blocked'
    severity_level VARCHAR(15) CHECK (severity_level IN ('INFO', 'WARNING', 'CRITICAL')) DEFAULT 'INFO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_severity ON audit_logs(severity_level);
CREATE INDEX idx_audit_module ON audit_logs(module_name);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ----------------------------------------------------------------------------
-- 4. ATTENDANCE LOGS TABLE (M6 Core)
-- ----------------------------------------------------------------------------
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    participant_name VARCHAR(100) NOT NULL,
    official_role VARCHAR(100) NOT NULL,
    join_time TIMESTAMP WITH TIME ZONE,
    leave_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 0,
    attendance_status VARCHAR(25) CHECK (attendance_status IN ('Present', 'Late', 'Absent', 'Left Early')) DEFAULT 'Absent',
    ip_address INET,
    blockchain_sig_verification BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attendance_meeting ON attendance(meeting_id);
CREATE INDEX idx_attendance_status ON attendance(attendance_status);

-- ----------------------------------------------------------------------------
-- 5. COMPLIANCE REPORTS TABLE (M6 Core)
-- ----------------------------------------------------------------------------
CREATE TABLE compliance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_number VARCHAR(30) UNIQUE NOT NULL, -- Format: REP-YYYYMMDD-XXXX
    report_type VARCHAR(50) NOT NULL, -- 'attendance', 'security', 'activity'
    compiled_by_username VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    meta_parameters JSONB, -- Stores query configurations (e.g. meeting_id, filters)
    blockchain_ledger_hash VARCHAR(66), -- Ledger transaction hash reference (M4 integration)
    s3_storage_url TEXT, -- Cloud location of the generated PDF/CSV payload
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_type ON compliance_reports(report_type);

-- ----------------------------------------------------------------------------
-- 6. SYSTEM NOTIFICATIONS & ALERTS (M6 Core)
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    priority_level VARCHAR(15) CHECK (priority_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'MEDIUM',
    notification_type VARCHAR(30) NOT NULL, -- 'security', 'reminder', 'action', 'report', 'attendance'
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT, -- Redirect action parameter when notification is clicked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_user_id) WHERE is_read = FALSE;

-- ----------------------------------------------------------------------------
-- 7. INSTITUTIONAL MEMORY FTS (FULL-TEXT SEARCH) IMPLEMENTATION
-- ----------------------------------------------------------------------------
-- This table aggregates data from meetings (M2), decisions (M4/M6), 
-- and transcribing AI highlights (M5) into a searchable document store.

CREATE TABLE institutional_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) CHECK (category IN ('Meetings', 'Decisions', 'Documents', 'Actions')),
    record_date DATE NOT NULL,
    summary TEXT NOT NULL,
    decision_details TEXT NOT NULL,
    action_items TEXT,
    documents_list TEXT[], -- Array of file names
    authorized_roles VARCHAR(50)[] NOT NULL, -- Roles authorized to see this record (e.g. {'Admin', 'Chairman'})
    blockchain_hash VARCHAR(66), -- Reference to M4
    ai_transcript_segment TEXT, -- Snippet of transcript from M5
    
    -- tsvector column for pgvector/FTS searching
    search_vector tsvector,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to keep the TS Vector index updated on inserts/updates
CREATE OR REPLACE FUNCTION institutional_memory_search_trigger() 
RETURNS trigger AS $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.summary,'')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.decision_details,'')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.action_items,'')), 'D');
  return new;
end
$$ LANGUAGE plpgsql;

CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
ON institutional_memory FOR EACH ROW EXECUTE FUNCTION institutional_memory_search_trigger();

-- Create GIN index for rapid FTS querying
CREATE INDEX idx_memory_search_vector ON institutional_memory USING gin(search_vector);
