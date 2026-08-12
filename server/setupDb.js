const { Client, Pool } = require('pg');

const postgresUrl = 'postgresql://postgres:postgres@localhost:5432/postgres';
const targetDbUrl = 'postgresql://postgres:postgres@localhost:5432/aicte_m6';

const ddlQueries = [
  // 1. Create audit_logs table
  `CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      actor_username VARCHAR(50) NOT NULL,
      action VARCHAR(100) NOT NULL,
      module_name VARCHAR(50) NOT NULL,
      ip_address INET,
      status VARCHAR(25) NOT NULL,
      severity_level VARCHAR(15) CHECK (severity_level IN ('INFO', 'WARNING', 'CRITICAL')) DEFAULT 'INFO',
      details TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,

  // 2. Create index on audit logs
  `CREATE INDEX IF NOT EXISTS idx_audit_severity ON audit_logs(severity_level);`,

  // 3. Create meetings table (M2 reference)
  `CREATE TABLE IF NOT EXISTS meetings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(200) NOT NULL,
      scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
      scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
      status VARCHAR(20) DEFAULT 'Scheduled',
      description TEXT,
      room_name VARCHAR(100),
      created_by VARCHAR(50)
  );`,

  // 4. Create attendance table
  `CREATE TABLE IF NOT EXISTS attendance (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
      participant_name VARCHAR(100) NOT NULL,
      official_role VARCHAR(100) NOT NULL,
      join_time TIMESTAMP WITH TIME ZONE,
      leave_time TIMESTAMP WITH TIME ZONE,
      duration_minutes INTEGER DEFAULT 0,
      attendance_status VARCHAR(25) CHECK (attendance_status IN ('Present', 'Late', 'Absent', 'Left Early')) DEFAULT 'Absent',
      ip_address INET,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,

  // 5. Create index on attendance
  `CREATE INDEX IF NOT EXISTS idx_attendance_meeting ON attendance(meeting_id);`,

  // 6. Create reports table
  `CREATE TABLE IF NOT EXISTS compliance_reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      report_number VARCHAR(30) UNIQUE NOT NULL,
      report_type VARCHAR(50) NOT NULL,
      compiled_by_username VARCHAR(50) NOT NULL,
      start_date DATE DEFAULT CURRENT_DATE,
      end_date DATE DEFAULT CURRENT_DATE,
      blockchain_ledger_hash VARCHAR(66),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,

  // 7. Create notifications table
  `CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      message TEXT NOT NULL,
      priority_level VARCHAR(15) CHECK (priority_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'MEDIUM',
      notification_type VARCHAR(30) NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,

  // 8. Create institutional_memory table
  `CREATE TABLE IF NOT EXISTS institutional_memory (
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
  );`,

  // 9. Add GIN index for search_vector
  `CREATE INDEX IF NOT EXISTS idx_memory_search_vector ON institutional_memory USING gin(search_vector);`,

  // 10. Create users table
  `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      role VARCHAR(50) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,

  // 11. Create meeting_participants table
  `CREATE TABLE IF NOT EXISTS meeting_participants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
      user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
      allowed BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,

  // 12. Create attendance_sessions table
  `CREATE TABLE IF NOT EXISTS attendance_sessions (
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
  );`
];

const triggerQueries = [
  // 1. Create or replace search vector update trigger function
  `CREATE OR REPLACE FUNCTION institutional_memory_search_trigger() 
   RETURNS trigger AS $$
   begin
     new.search_vector :=
       setweight(to_tsvector('english', coalesce(new.title,'')), 'A') ||
       setweight(to_tsvector('english', coalesce(new.summary,'')), 'B') ||
       setweight(to_tsvector('english', coalesce(new.decision_details,'')), 'C') ||
       setweight(to_tsvector('english', coalesce(new.action_items,'')), 'D');
     return new;
   end
   $$ LANGUAGE plpgsql;`,

  // 2. Drop trigger if exists and recreate it
  `DROP TRIGGER IF EXISTS tsvectorupdate ON institutional_memory;`,
  `CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
   ON institutional_memory FOR EACH ROW EXECUTE FUNCTION institutional_memory_search_trigger();`
];

async function setup() {
  console.log('Connecting to PostgreSQL client to check target database...');
  const client = new Client({ connectionString: postgresUrl });
  
  try {
    await client.connect();
    
    // Check if aicte_m6 database exists
    const dbCheckRes = await client.query("SELECT 1 FROM pg_database WHERE datname = 'aicte_m6'");
    
    if (dbCheckRes.rowCount === 0) {
      console.log("Database 'aicte_m6' does not exist. Creating database now...");
      await client.query("CREATE DATABASE aicte_m6");
      console.log("Database 'aicte_m6' created successfully.");
    } else {
      console.log("Database 'aicte_m6' already exists.");
    }
  } catch (err) {
    console.error('Failed to run database creation check:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }

  // Connect to target database
  console.log('Connecting to database aicte_m6 to run table migrations...');
  const pool = new Pool({ connectionString: targetDbUrl });
  
  try {
    // 1. Run DDL schema
    for (let query of ddlQueries) {
      await pool.query(query);
    }
    console.log('Tables and indexes created successfully.');

    // 2. Run Triggers schema
    for (let query of triggerQueries) {
      await pool.query(query);
    }
    console.log('Full-Text Search triggers verified successfully.');

    // 3. Seed tables if meetings table is empty
    const checkEmpty = await pool.query('SELECT count(*) FROM meetings');
    if (parseInt(checkEmpty.rows[0].count) === 0) {
      console.log('Seeding baseline meetings data...');
      
      // Seed Meetings
      const insertMeet1 = await pool.query(`
        INSERT INTO meetings (title, scheduled_start, scheduled_end, status)
        VALUES ('AICTE Review Meeting - Budget Allocations Q3', '2026-08-05 10:00:00+05:30', '2026-08-05 11:30:00+05:30', 'Completed')
        RETURNING id
      `);
      
      const insertMeet2 = await pool.query(`
        INSERT INTO meetings (title, scheduled_start, scheduled_end, status)
        VALUES ('Project Evaluation Committee - Smart India Hackathon', '2026-08-06 14:00:00+05:30', '2026-08-06 16:30:00+05:30', 'Completed')
        RETURNING id
      `);

      const m1Id = insertMeet1.rows[0].id;
      const m2Id = insertMeet2.rows[0].id;

      // Seed Attendance for Meeting 1
      await pool.query(`
        INSERT INTO attendance (meeting_id, participant_name, official_role, join_time, leave_time, duration_minutes, attendance_status) VALUES
        ('${m1Id}', 'Dr. Anil Sahasrabudhe', 'Chairman', '2026-08-05 09:55:00+05:30', '2026-08-05 11:30:00+05:30', 95, 'Present'),
        ('${m1Id}', 'Prof. Rajive Kumar', 'Member Secretary', '2026-08-05 09:58:00+05:30', '2026-08-05 11:30:00+05:30', 92, 'Present'),
        ('${m1Id}', 'Dr. Abhay Jere', 'Chief Innovation Officer', '2026-08-05 10:05:00+05:30', '2026-08-05 11:28:00+05:30', 83, 'Late'),
        ('${m1Id}', 'Shri Vineet Joshi', 'Government Nominee', '2026-08-05 09:54:00+05:30', '2026-08-05 11:15:00+05:30', 81, 'Left Early')
      `);

      // Seed Attendance for Meeting 2
      await pool.query(`
        INSERT INTO attendance (meeting_id, participant_name, official_role, join_time, leave_time, duration_minutes, attendance_status) VALUES
        ('${m2Id}', 'Dr. Abhay Jere', 'Chief Innovation Officer', '2026-08-06 13:55:00+05:30', '2026-08-06 16:30:00+05:30', 155, 'Present'),
        ('${m2Id}', 'Mr. Malay Vyas', 'SIH Evaluator (M6 Panel)', '2026-08-06 13:50:00+05:30', '2026-08-06 16:30:00+05:30', 160, 'Present')
      `);

      // Seed Audit Logs
      await pool.query(`
        INSERT INTO audit_logs (actor_username, action, module_name, ip_address, status, severity_level, details) VALUES
        ('admin_aicte', 'Report Generated', 'Reports (M6)', '192.168.1.45', 'Success', 'INFO', 'Generated Security Audit Report for Q2.'),
        ('sys_monitor', 'Security Warning', 'Audit (M6)', '10.0.4.12', 'Triggered', 'CRITICAL', 'Multiple failed login attempts detected on admin profile.'),
        ('prof_rajive', 'Meeting Created', 'Meeting (M2)', '172.16.22.102', 'Success', 'INFO', 'Faculty Governance Meeting created.')
      `);

      // Seed Notifications
      await pool.query(`
        INSERT INTO notifications (message, priority_level, notification_type, is_read) VALUES
        ('Reminder: Review meeting report is pending signoff.', 'HIGH', 'reminder', FALSE),
        ('Action Item: Approve SIH incubation grant criteria by tonight.', 'HIGH', 'action', FALSE)
      `);

      // Seed Memory
      await pool.query(`
        INSERT INTO institutional_memory (title, category, record_date, summary, decision_details, action_items, documents_list, authorized_roles, blockchain_hash, ai_transcript_segment) VALUES
        ('AICTE Review Meeting - Budget Allocations Q3 2026', 'Meetings', '2026-08-05', 'AICTE quarterly budget allocation approval. Allocated INR 12.5 Crores.', 'Approved funding increase of 15% for innovation cell labs.', 'Dr. Abhay Jere to finalize dispersal metrics.', ARRAY['AICTE_Budget_2026_Q3.pdf'], ARRAY['Admin', 'Chairman', 'CIO', 'Advisor'], '0x892e8bf723da890bf2a3e9c8821a9980d28711e9a2bc91e772153c3d2890fb91', 'Decided in 12 mins. Primary advocates: Prof M.P. Poonia.'),
        ('SIH Incubation Grant Dispersal Scheme', 'Decisions', '2026-08-05', 'Approval of the criteria for selecting hackathon project prototypes.', 'SIH final prototypes with gold rating will receive 2 Lakhs seed grant.', 'All coordinators to distribute guidelines.', ARRAY['Incubation_Select_Guidelines_v2.pdf'], ARRAY['Admin', 'Chairman', 'CIO', 'Evaluator'], '0xf3a890b7218d22e8bf287c8811e92bc9153c99e9c88e77c3d215bda90ab228fc', 'Consensus reached rapidly.')
      `);

      // Seed Users
      await pool.query(`
        INSERT INTO users (id, name, email, role) VALUES
        ('admin_aicte', 'Dr. Abhay Jere', 'abhay.jere@aicte-india.org', 'Admin'),
        ('student_rahul', 'Rahul Patel', 'rahul.patel@sih.gov.in', 'Student'),
        ('prof_rajive', 'Prof. Rajive Kumar', 'rajive.kumar@aicte-india.org', 'Member Secretary')
      `);

      // Seed allowed meeting participants
      await pool.query(`
        INSERT INTO meeting_participants (meeting_id, user_id, allowed) VALUES
        ('${m1Id}', 'admin_aicte', TRUE),
        ('${m1Id}', 'prof_rajive', TRUE),
        ('${m2Id}', 'admin_aicte', TRUE),
        ('${m2Id}', 'student_rahul', TRUE)
      `);

      console.log('Database seeded with SIH data successfully.');
    } else {
      console.log('Database already contains records. Skipping seed.');
    }
  } catch (err) {
    console.error('Migration setup failed:', err.message);
  } finally {
    await pool.end();
  }
}

setup();
