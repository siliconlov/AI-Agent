import sqlite3
import json
import logging
from typing import Dict, List, Optional

DB_PATH = "research_agent.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS jobs (
            id TEXT PRIMARY KEY,
            topic TEXT,
            status TEXT,
            report TEXT,
            logs TEXT,
            sources TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def save_job(job_data: Dict):
    conn = get_db_connection()
    c = conn.cursor()
    
    # Serialize lists to JSON strings for storage
    logs_json = json.dumps(job_data.get("logs", []))
    sources_json = json.dumps(job_data.get("sources", []))
    
    c.execute('''
        INSERT OR REPLACE INTO jobs (id, topic, status, report, logs, sources)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        job_data["id"],
        job_data["topic"],
        job_data["status"],
        job_data.get("report"),
        logs_json,
        sources_json
    ))
    conn.commit()
    conn.close()

def get_job(job_id: str) -> Optional[Dict]:
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM jobs WHERE id = ?', (job_id,))
    row = c.fetchone()
    conn.close()
    
    if row:
        job = dict(row)
        # Deserialize JSON strings back to lists
        if job["logs"]:
            job["logs"] = json.loads(job["logs"])
        else:
             job["logs"] = []
             
        if job["sources"]:
            job["sources"] = json.loads(job["sources"])
        else:
            job["sources"] = []
            
        return job
    return None

def update_job_status(job_id: str, status: str, logs: List[str], report: Optional[str] = None, sources: List[str] = []):
    """
    Efficiently update specific fields.
    Ideally we fetch, update, save. Or direct update.
    For simplicity in this sync implementation, we might just re-save mostly. 
    But let's do a direct UPDATE for better atomicity.
    """
    conn = get_db_connection()
    c = conn.cursor()
    
    logs_json = json.dumps(logs)
    sources_json = json.dumps(sources)
    
    if report:
        c.execute('''
            UPDATE jobs 
            SET status = ?, logs = ?, report = ?, sources = ?
            WHERE id = ?
        ''', (status, logs_json, report, sources_json, job_id))
    else:
        # Don't overwrite report if it's None (though usually it is None until done)
        # But if we are just updating logs, we should include sources too if they grew
        c.execute('''
            UPDATE jobs 
            SET status = ?, logs = ?, sources = ?
            WHERE id = ?
        ''', (status, logs_json, sources_json, job_id))
        
    conn.commit()
    conn.close()

def get_all_jobs() -> List[Dict]:
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT id, topic, status, created_at FROM jobs ORDER BY created_at DESC')
    rows = c.fetchall()
    conn.close()
    
    result = []
    for row in rows:
        result.append(dict(row))
    return result

def delete_job(job_id: str):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('DELETE FROM jobs WHERE id = ?', (job_id,))
    conn.commit()
    conn.close()

def update_job_title(job_id: str, new_title: str):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('UPDATE jobs SET topic = ? WHERE id = ?', (new_title, job_id))
    conn.commit()
    conn.close()

