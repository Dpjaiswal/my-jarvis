import sys
import os
import time
import logging
import json

# Add the root directory to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_community.llms import Ollama
from langchain.agents import initialize_agent, AgentType
from langchain.memory import ConversationBufferMemory
from packages.core_ai.tools.registry import ARIA_TOOLS
from packages.core_ai.memory.vector_store import search_memory

# Structured Logging Setup (Observability)
class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
        }
        if hasattr(record, 'trace_id'):
            log_record['trace_id'] = record.trace_id
        if hasattr(record, 'duration_ms'):
            log_record['duration_ms'] = record.duration_ms
        return json.dumps(log_record)

logger = logging.getLogger("aria_api")
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
ch.setFormatter(JSONFormatter())
logger.addHandler(ch)

app = FastAPI(title="Aria OS API - Phase 3")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    user_id: str = "user_123"

class ChatResponse(BaseModel):
    response: str

ollama_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
try:
    logger.info(f"Connecting to Ollama at {ollama_url}")
    llm = Ollama(model="llama3", base_url=ollama_url)
    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
    agent = initialize_agent(
        tools=ARIA_TOOLS,
        llm=llm,
        agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
        verbose=True,
        memory=memory,
        handle_parsing_errors=True
    )
except Exception as e:
    logger.error(f"Failed to initialize LLM: {e}")
    agent = None

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    logger.info("Request processed", extra={"duration_ms": process_time, "trace_id": request.headers.get("X-Trace-Id", "unknown")})
    return response

@app.get("/health")
async def health_check():
    return {"status": "ok", "agent_available": agent is not None}

@app.post("/v1/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    if not agent:
        raise HTTPException(status_code=500, detail="LLM Agent not initialized.")
    
    try:
        logger.info(f"Searching memory for user {req.user_id}")
        long_term_context = search_memory(req.user_id, req.message)
        context_str = f"\n[Relevant Long-Term Memory: {long_term_context}]\n" if long_term_context else ""
        
        final_prompt = f"{context_str}User Request: {req.message}"
        logger.info("Executing Agent Workflow")
        
        start_ai = time.time()
        response = agent.run(input=final_prompt)
        logger.info("Agent Execution Complete", extra={"duration_ms": (time.time() - start_ai) * 1000})
        
    except Exception as e:
        logger.error(f"Error in agent workflow: {e}")
        raise HTTPException(status_code=500, detail=f"LLM Error: {str(e)}")

    return ChatResponse(response=response)
