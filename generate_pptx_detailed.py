import sys
import os

try:
    from pptx import Presentation
    from pptx.util import Inches, Pt
    from pptx.dml.color import RGBColor
except ImportError:
    print("python-pptx is not installed. Please install it using pip.")
    sys.exit(1)

def generate_detailed_pptx():
    print("Initializing Detailed PowerPoint Presentation generation...")
    prs = Presentation()
    prs.slide_width = Inches(13.333) # 16:9 widescreen layout
    prs.slide_height = Inches(7.5)
    
    # Theme color definitions
    c_bg = RGBColor(10, 15, 29)       # Deep Dark Navy #0A0F1D
    c_title = RGBColor(248, 250, 252) # White #F8FAFC
    c_body = RGBColor(148, 163, 184)  # Muted Slate #94A3B8
    c_blue = RGBColor(96, 165, 250)   # Indigo/Blue #60A5FA

    blank_layout = prs.slide_layouts[6] # Blank slide layout

    slides_content = [
        # Slide 1: Title
        {
            "is_title": True,
            "title": "SECURE AICTE MEETING & GOVERNANCE PLATFORM",
            "subtitle": "Module M6: Audit + Attendance + Reports + Institutional Memory\n\nDetailed Technical Breakdown: React, Node.js + Express, PostgreSQL, pgvector/FTS\nSmart India Hackathon Presentation Deck"
        },
        # Slide 2: Scope & Role
        {
            "title": "Module M6 Scope & Platform Role",
            "sections": [
                {
                    "heading": "Centralized Auditing & Governance Cell",
                    "text": "M6 tracks, parses, and acts as the central logs ledger for all governance operations (M1 Auth, M2 Meetings, M3 Files, M4 Blockchain, M5 AI Transcripts)."
                },
                {
                    "heading": "Core System Capabilities",
                    "text": "• Compliance Auditing: Ingests logins, permission modifications, and file queries.\n"
                           "• Attendance Analytics: Computes arrival, exit, and connection durations via webhooks.\n"
                           "• Reports Compiler: Parametric config engine committing report hashes to blockchain.\n"
                           "• SOC Threat Center: Monitors credential logs and quarantines malicious IP addresses.\n"
                           "• Memory Query: Role-based historic searches powered by PostgreSQL GIN indexes."
                }
            ]
        },
        # Slide 3: M6 Inter-Module Integrations
        {
            "title": "Inter-Module Integration Interfaces",
            "sections": [
                {
                    "heading": "Inbound Integrations (M1, M2, M3, M5)",
                    "text": "• Module M1 (Auth): Transmits user login metadata, client IPs, and active session roles.\n"
                           "• Module M2 (Meetings): Jitsi webhook integration pushes join/leave connection signals.\n"
                           "• Module M3 (Files): Ingests audits on document downloads and access updates.\n"
                           "• Module M5 (AI): Automatically maps summarized transcripts to memory indices."
                },
                {
                    "heading": "Outbound Integrity Checks (M4)",
                    "text": "• Module M4 (Ledger): Commits SHA-256 report integrity checksum hashes directly to private blockchain blocks, retrieving verification seals (hashes) to ensure document tamper-resistance."
                }
            ]
        },
        # Slide 4: React + Vite Frontend
        {
            "title": "Topic: React + Vite Frontend Architecture",
            "sections": [
                {
                    "heading": "UI Components & Layout Routing",
                    "text": "• Single Page Application (SPA): Configured with React 19 and Vite for rapid loading.\n"
                           "• Sidebar State Routing: Coordinated tabs navigate sections without page reloads.\n"
                           "• Tailwind CSS v4: Enforces government-themed slate dark palette directly in CSS stylesheets.\n"
                           "• Presenter Controller: Floating overlay panel programmatically updates React states to demo specific walkthrough features."
                },
                {
                    "heading": "Data Visualization & States",
                    "text": "• Recharts integration: Renders LineCharts for attendance trends and PieCharts for warning levels.\n"
                           "• Shared Context: Coordinates notification unread badge counts in header alerts.\n"
                           "• Interactive SOC Panels: Triggers alert drawers that mutate states to resolve threat indicators."
                }
            ]
        },
        # Slide 5: Node.js + Express Backend
        {
            "title": "Topic: Node.js + Express Backend API Layer",
            "sections": [
                {
                    "heading": "Express API Architecture",
                    "text": "• REST API Endpoints: Exposes routes for audit streams, attendance updates, PDF report compilation, and search queries.\n"
                           "• Middleware Configuration: CORS filters, JSON body-parsing middleware, and security header checks.\n"
                           "• In-Memory Fallback: Stores database records in local arrays if PostgreSQL node connection is offline."
                },
                {
                    "heading": "Compliance Auditing Hooks",
                    "text": "• Operations Actions: System operations (like report generating) trigger background logging checks.\n"
                           "• JSON Payload Handling: Validates date ranges and query keywords, returning status codes (e.g. 201 Created)."
                }
            ]
        },
        # Slide 6: PostgreSQL Database Schema
        {
            "title": "Topic: PostgreSQL Relational Database Schema",
            "sections": [
                {
                    "heading": "Relational Tables Structure",
                    "text": "• audit_logs: Logs timestamps, actions, targets, client IPs, statuses, and severities.\n"
                           "• attendance: Tracks meeting participant logs, computing total minutes and status tags.\n"
                           "• compliance_reports: Stores report configurations and blockchain ledger hashes.\n"
                           "• notifications: Manages priority-based alarms (LOW, MEDIUM, HIGH, CRITICAL)."
                },
                {
                    "heading": "Data Integrity & Relationships",
                    "text": "• Cascade Deletions: Implements foreign key constraints linking M6 tables directly with users (M1) and meetings (M2).\n"
                           "• Check Constraints: Restricts statuses to designated pools (Present, Late, Absent, Left Early; INFO, WARNING, CRITICAL) to prevent invalid logs."
                }
            ]
        },
        # Slide 7: pgvector vs PostgreSQL FTS
        {
            "title": "Topic: pgvector vs. PostgreSQL FTS",
            "sections": [
                {
                    "heading": "PostgreSQL Full-Text Search (FTS)",
                    "text": "• English Lexeme parsing: Pre-calculates a single 'search_vector' (tsvector type) and indexes it using a GIN (Inverted Index) layout.\n"
                           "• ts_rank ranking: relevance ranks search terms based on keyword match density.\n"
                           "• GIN index updates: Keeps lexeme database synchronized via trigger functions."
                },
                {
                    "heading": "PostgreSQL pgvector Embeddings",
                    "text": "• Embedding Columns: Stores document representations as vector columns (e.g. vector(1536)).\n"
                           "• HNSW Indexing: Speeds up cosine distance queries (<=>) across multi-dimensional embedding weights.\n"
                           "• Context Search: Resolves query semantics rather than exact keyword spelling."
                }
            ]
        },
        # Slide 8: Attendance & SOC Mechanics
        {
            "title": "Attendance & SOC Security Alarms",
            "sections": [
                {
                    "heading": "Attendance Duration Analytics",
                    "text": "Integrates Jitsi webhooks to record user connecting and leaving events. Calculates duration: Duration = Leave Time - Join Time (expressed in minutes).\n"
                           "Assigns status badges: Present, Late (>5m post start), Left Early, or Absent."
                },
                {
                    "heading": "SOC Automated Mitigation Protocols",
                    "text": "• IP Quarantine: Blocks client IPs if 5 failed login attempts occur in 2 minutes.\n"
                           "• Verification Modal: Compliance officers inspect logs and resolve alerts directly from UI."
                }
            ]
        },
        # Slide 9: Reports Engine & Blockchain Sealing
        {
            "title": "Reports Engine & Blockchain Sealing",
            "sections": [
                {
                    "heading": "Compliance PDF Builder",
                    "text": "Retrieves logs for chosen meetings and date boundaries. Renders a simulated compliance PDF directly inside the browser, containing official headers, summary blocks, and verify signatures."
                },
                {
                    "heading": "Blockchain Integrity Lock (M4 Integration)",
                    "text": "M6 hashes the report file payload using SHA-256. This hash is committed to the blockchain, creating a read-only token seal. Anyone altering the database later fails verification checks."
                }
            ]
        },
        # Slide 10: Conclusion & Deliverables
        {
            "title": "M6 Prototype Stack & Deliverables",
            "sections": [
                {
                    "heading": "Visual Front-End Prototype",
                    "text": "React + Vite frontend dev stack. Uses a premium dark-navy theme (#0A0F1D), glassmorphism styles, Recharts analytics, and Lucide icons."
                },
                {
                    "heading": "Backend API & Database Schemas",
                    "text": "Express API server with mock databases. Features a floating Demo Controller walkthrough bar. PostgreSQL schema scripts including FTS search vectors."
                }
            ]
        }
    ]

    for idx, slide_data in enumerate(slides_content):
        slide = prs.slides.add_slide(blank_layout)
        
        # Slide Background
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = c_bg
        
        if slide_data.get("is_title"):
            # Title slide layout
            title_box = slide.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(11.333), Inches(4.5))
            tf = title_box.text_frame
            tf.word_wrap = True
            
            p1 = tf.paragraphs[0]
            p1.text = slide_data["title"]
            p1.font.size = Pt(40)
            p1.font.bold = True
            p1.font.color.rgb = c_title
            p1.font.name = 'Arial'
            
            p2 = tf.add_paragraph()
            p2.text = "\n" + slide_data["subtitle"]
            p2.font.size = Pt(16)
            p2.font.color.rgb = c_blue
            p2.font.name = 'Arial'
            
        else:
            # Header
            header_box = slide.shapes.add_textbox(Inches(1.0), Inches(0.5), Inches(11.333), Inches(1.0))
            tf_h = header_box.text_frame
            tf_h.word_wrap = True
            p_h = tf_h.paragraphs[0]
            p_h.text = slide_data["title"]
            p_h.font.size = Pt(32)
            p_h.font.bold = True
            p_h.font.color.rgb = c_blue
            p_h.font.name = 'Arial'
            
            # Sub-sections (Detailed left & right boxes)
            sec1 = slide_data["sections"][0]
            sec2 = slide_data["sections"][1]
            
            # Left block
            left_box = slide.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(5.4), Inches(4.8))
            tf_l = left_box.text_frame
            tf_l.word_wrap = True
            
            p_l_h = tf_l.paragraphs[0]
            p_l_h.text = sec1["heading"]
            p_l_h.font.size = Pt(20)
            p_l_h.font.bold = True
            p_l_h.font.color.rgb = c_title
            p_l_h.font.name = 'Arial'
            p_l_h.space_after = Pt(10)
            
            p_l_b = tf_l.add_paragraph()
            p_l_b.text = sec1["text"]
            p_l_b.font.size = Pt(15)
            p_l_b.font.color.rgb = c_body
            p_l_b.font.name = 'Arial'
            p_l_b.line_spacing = 1.2
            
            # Right block
            right_box = slide.shapes.add_textbox(Inches(6.9), Inches(1.8), Inches(5.4), Inches(4.8))
            tf_r = right_box.text_frame
            tf_r.word_wrap = True
            
            p_r_h = tf_r.paragraphs[0]
            p_r_h.text = sec2["heading"]
            p_r_h.font.size = Pt(20)
            p_r_h.font.bold = True
            p_r_h.font.color.rgb = c_title
            p_r_h.font.name = 'Arial'
            p_r_h.space_after = Pt(10)
            
            p_r_b = tf_r.add_paragraph()
            p_r_b.text = sec2["text"]
            p_r_b.font.size = Pt(15)
            p_r_b.font.color.rgb = c_body
            p_r_b.font.name = 'Arial'
            p_r_b.line_spacing = 1.2

            # Footer
            footer_box = slide.shapes.add_textbox(Inches(11.0), Inches(6.8), Inches(1.5), Inches(0.5))
            tf_f = footer_box.text_frame
            p_f = tf_f.paragraphs[0]
            p_f.text = f"Slide {idx + 1} / 10"
            p_f.font.size = Pt(10)
            p_f.font.color.rgb = c_body
            p_f.font.name = 'Arial'

    prs.save("AICTE_M6_Presentation_Detailed.pptx")
    print("Exhaustive detailed PowerPoint updated successfully as 'AICTE_M6_Presentation_Detailed.pptx'")

if __name__ == "__main__":
    generate_detailed_pptx()
