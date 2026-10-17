import json
import sqlite3
from pathlib import Path
from typing import Dict, Any, List, Optional
from backend.app.config import settings

DB_FILE = settings.BASE_DIR / "tenderguard.db"

def get_db_connection():
    conn = sqlite3.connect(str(DB_FILE))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Tenders Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tenders (
        tender_id TEXT PRIMARY KEY,
        tender_title TEXT NOT NULL,
        tender_ref_number TEXT NOT NULL,
        procuring_authority TEXT NOT NULL,
        bid_submission_deadline TEXT NOT NULL,
        required_document_types TEXT NOT NULL,
        require_oem_maf INTEGER DEFAULT 1,
        require_msme_exemption INTEGER DEFAULT 0,
        min_msme_category TEXT,
        require_pan_gstin_exact_match INTEGER DEFAULT 1,
        require_valid_startup_recognition INTEGER DEFAULT 0,
        min_annual_turnover_lakhs REAL DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Filings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vendor_filings (
        filing_id TEXT PRIMARY KEY,
        vendor_name TEXT NOT NULL,
        tender_id TEXT NOT NULL,
        tender_title TEXT NOT NULL,
        tender_ref_number TEXT NOT NULL,
        submission_timestamp TEXT NOT NULL,
        overall_status TEXT NOT NULL,
        overall_compliance_score REAL NOT NULL,
        total_checks INTEGER NOT NULL,
        compliant_count INTEGER NOT NULL,
        non_compliant_count INTEGER NOT NULL,
        requires_review_count INTEGER NOT NULL,
        checks_json TEXT NOT NULL,
        documents_json TEXT NOT NULL,
        audit_hash TEXT NOT NULL,
        zero_retention_mode INTEGER DEFAULT 1,
        processing_duration_sec REAL NOT NULL,
        time_saved_percent REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Review Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS review_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filing_id TEXT NOT NULL,
        rule_id TEXT NOT NULL,
        old_status TEXT,
        new_status TEXT NOT NULL,
        reviewer_name TEXT NOT NULL,
        reviewer_role TEXT NOT NULL,
        review_comments TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )
    """)
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
