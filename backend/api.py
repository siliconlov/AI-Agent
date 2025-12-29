import logging
import uuid
import threading
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os

from llm_engine import LLMEngine
from planner import Planner
from researcher import Researcher
from reporter import Reporter

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize DB
from database import init_db, save_job, get_job, update_job_status, get_all_jobs, delete_job, update_job_title
init_db()

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Additional imports for quick mode
from search_engine import SearchEngine

class ResearchRequest(BaseModel):
    topic: str
    mode: str = "deep" # "deep" or "quick"

class ResearchResponse(BaseModel):
    job_id: str

class JobStatus(BaseModel):
    id: str
    status: str
    logs: List[str]
    report: Optional[str] = None
    sources: List[str] = []

def run_research_task(job_id: str, topic: str, mode: str = "deep"):
    logger.info(f"Starting job {job_id} for topic: {topic} (Mode: {mode})")
    
    # Local state tracking
    logs = [f"Starting {mode} research on: {topic}"]
    sources = []
    
    # Initial DB update
    update_job_status(job_id, "running", logs)
    
    try:
        # Initialize Local Engines
        llm = LLMEngine() 
        
        if mode == "quick":
            # QUICK MODE: Skip planning, single broad search
            logs.append("Quick Mode: Running broad search...")
            update_job_status(job_id, "researching", logs)
            
            search_engine = SearchEngine()
            search_results = search_engine.search(topic)
            
            # Check for cancellation
            if get_job(job_id)['status'] == 'stopping':
                logs.append("Research stopped by user.")
                update_job_status(job_id, "cancelled", logs)
                return

            # Format results for Reporter
            results = [{
                "question": topic,
                "context": search_results,
                "answer": "Gathered from search results",
                "citations": [r['href'] for r in search_results]
            }]
            
            # Collect sources from search result
            sources = [r['href'] for r in search_results]
        
        else:
            # DEEP MODE: Planning + Multi-step analysis
            # 1. Plan
            logs.append("Generating research plan (Llama 3)...")
            update_job_status(job_id, "planning", logs)
            
            planner = Planner(llm)
            questions = planner.make_plan(topic)
            logs.append(f"Plan created: {questions}")
            update_job_status(job_id, "planning", logs)
            
            # 2. Research
            update_job_status(job_id, "researching", logs)
            researcher = Researcher(llm)
            results = []
            
            for i, q in enumerate(questions):
                # Check for cancellation
                if get_job(job_id)['status'] == 'stopping':
                    logs.append("Research stopped by user.")
                    update_job_status(job_id, "cancelled", logs)
                    return

                logs.append(f"Researching: {q}")
                update_job_status(job_id, "researching", logs)
                
                data = researcher.research_question(q)
                results.append(data)
                
                # Collect citations
                if "citations" in data and isinstance(data["citations"], list):
                    sources.extend(data["citations"])
                
                logs.append(f"Finished Q{i+1}/{len(questions)}")
                update_job_status(job_id, "researching", logs, sources=list(set(sources)))
    
        # Deduplicate sources
        unique_sources = list(set(sources))

        # 3. Report
        logs.append("Synthesizing final report...")
        update_job_status(job_id, "reporting", logs, sources=unique_sources)
        
        reporter = Reporter(llm)
        report_content = reporter.generate_report(topic, results)
        
        logs.append("Research completed successfully.")
        update_job_status(job_id, "completed", logs, report=report_content, sources=unique_sources)

    except Exception as e:
        logger.error(f"Job {job_id} failed: {e}")
        logs.append(f"Error: {str(e)}")
        update_job_status(job_id, "failed", logs)

@app.post("/api/research", response_model=ResearchResponse)
async def start_research(req: ResearchRequest):
    job_id = str(uuid.uuid4())
    
    # Save initial job to DB
    initial_job = {
        "id": job_id,
        "topic": req.topic,
        "mode": req.mode,
        "status": "queued",
        "logs": [],
        "report": None,
        "sources": []
    }
    # Note: Current DB schema might not have 'mode', ignoring for now as it's not critical to persist deeply
    # But save_job uses fixed columns, so we just won't pass 'mode' to save_job unless we update DB schema.
    # Given the instructions, we'll just save the standard fields to DB.
    
    # We need to construct the dict expected by save_job (which expects keys matching DB columns approx)
    # Actually save_job takes a dict and extracts fields. 
    # Let's just pass what save_job expects.
    save_job({
        "id": job_id,
        "topic": req.topic,
        "status": "queued",
        "logs": [],
        "report": None,
        "sources": []
    })
    
    # Run in background thread
    thread = threading.Thread(target=run_research_task, args=(job_id, req.topic, req.mode))
    thread.start()
    
    return {"job_id": job_id}

@app.get("/api/research/{job_id}", response_model=JobStatus)
async def get_status(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@app.post("/api/research/{job_id}/stop")
async def stop_research(job_id: str):
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    update_job_status(job_id, "stopping", job.get("logs", []))
    return {"status": "stopping"}

class ChatRequest(BaseModel):
    job_id: str
    message: str
    history: List[Dict[str, str]] = [] # Optional: previous messages for context

@app.post("/api/chat")
async def chat_with_report(req: ChatRequest):
    job = get_job(req.job_id)
    if not job or not job.get("report"):
        raise HTTPException(status_code=404, detail="Report not found")
    
    report_content = job["report"]
    
    # Construct context-aware prompt
    system_prompt = (
        "You are an intelligent assistant helping a user understand a research report. "
        "Use the provided Report Content to answer the user's question accurately. "
        "If the answer is not in the report, say so politely. "
        "Keep answers concise and relevant."
        f"\n\n--- REPORT CONTENT ---\n{report_content}\n--- END REPORT ---"
    )
    
    messages = [{"role": "system", "content": system_prompt}]
    
    # Add history if provided
    for msg in req.history:
        messages.append({"role": msg["role"], "content": msg["content"]})
        
    messages.append({"role": "user", "content": req.message})
    
    try:
        llm = LLMEngine()
        response = llm.chat(messages)
        return {"response": response}
    except Exception as e:
        logger.error(f"Chat failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class UpdateJobRequest(BaseModel):
    topic: str

@app.get("/api/research", response_model=List[Dict])
async def get_history():
    return get_all_jobs()

@app.delete("/api/research/{job_id}")
async def remove_job(job_id: str):
    delete_job(job_id)
    return {"status": "deleted"}

@app.put("/api/research/{job_id}")
async def update_job(job_id: str, req: UpdateJobRequest):
    update_job_title(job_id, req.topic)
    return {"status": "updated"}

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000)
