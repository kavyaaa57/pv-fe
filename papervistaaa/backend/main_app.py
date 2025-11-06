# main_app.py - FINAL Consolidated FastAPI Backend (CLI Logic Merged and Tensor Fix)
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Any, Dict, Tuple
import traceback 
import sys 
import numpy as np 
import torch 
from src.encoder import TextEncoder 
from src.data_processor import chunk_text_by_sentences 
from src.auto_searcher import fetch_web_results 
from src.web_scraper import fetch_and_process_web_references 
from src.lexical_checker import perform_lexical_check, find_lexical_matches 
from src.similarity_checker import compare_semantic_embeddings 
from src.config import CHUNK_SIZE_SENTENCES, SEMANTIC_THRESHOLD, LEXICAL_THRESHOLD 
try:
    from spelling_grammar import check_spelling_and_grammar
except ImportError:
    def check_spelling_and_grammar(text): return {"status": "SKIPPED", "message": "Module failed to load.", "total_errors": 0}

# =========================================================================
# 1. PYDANTIC DATA MODELS
# =========================================================================
class PlagiarismInput(BaseModel):
    suspect_text: str
class Match(BaseModel):
    id: int
    similarity: float
    type: str
    text: str 
    source: str 
    url: str 
class PlagiarismReport(BaseModel):
    overallScore: float
    status: str
    flaggedChunks: str
    coverageRatio: str
    totalWords: int
    matches: List[Match]
    suggestions: List[str]
    imageCheckStatus: str
class GrammarInput(BaseModel):
    raw_text: str 
class GrammarReportModel(BaseModel):
    status: str
    total_errors: int
    errors: List[Dict[str, Any]]
# =========================================================================
# 2. GLOBAL INITIALIZATION & LIFESPAN
# =========================================================================
TEXT_ENCODER: TextEncoder = None
@asynccontextmanager
async def lifespan(app: FastAPI):
    global TEXT_ENCODER
    try:
        print("Loading S-BERT Model: Initializing TextEncoder...")
        TEXT_ENCODER = TextEncoder()
        if TEXT_ENCODER.model is None:
            raise RuntimeError("S-BERT model initialization failed.")
        print("S-BERT Model loaded successfully.")
    except Exception as e:
        print(f"CRITICAL ERROR: Failed to load S-BERT model. Error: {e}")
    yield 
app = FastAPI(
    title="Plagiarism and Grammar Detection API",
    lifespan=lifespan 
)
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# =========================================================================
# 3. CORE PLAGIARISM LOGIC (Refactoring CLI functionality for API)
# =========================================================================
def execute_plagiarism_pipeline(suspect_text: str, encoder: TextEncoder) -> Tuple[List[Dict[str, Any]], List[str], int, int]:
    suspect_chunks = chunk_text_by_sentences(suspect_text, CHUNK_SIZE_SENTENCES)
    total_chunks = len(suspect_chunks)
    total_words = len(suspect_text.split())
    if not suspect_chunks:
        return [], [], 0, total_words
    web_urls = fetch_web_results(suspect_chunks) 
    reference_chunks_raw = fetch_and_process_web_references(web_urls, CHUNK_SIZE_SENTENCES)
    reference_chunks = [c.strip() for c in reference_chunks_raw if c.strip()]
    if not reference_chunks:
        return [], web_urls, total_chunks, total_words
    suspect_embeddings = encoder.get_embeddings(suspect_chunks) 
    reference_embeddings = encoder.get_embeddings(reference_chunks) 
    if suspect_embeddings is None or reference_embeddings is None:
        return [], web_urls, total_chunks, total_words
    lexical_matrix = perform_lexical_check(suspect_chunks, reference_chunks)
    lexical_matches_raw = find_lexical_matches(suspect_chunks, reference_chunks, lexical_matrix, LEXICAL_THRESHOLD)
    semantic_matrix = compare_semantic_embeddings(suspect_embeddings, reference_embeddings)
    semantic_matches_raw = []
    for i in range(len(suspect_chunks)):
        max_sim_ref_index = np.argmax(semantic_matrix[i])
        max_similarity = semantic_matrix[i][max_sim_ref_index]
        if max_similarity * 100 > SEMANTIC_THRESHOLD:
            semantic_matches_raw.append({
                'suspect_chunk_index': i,
                'reference_chunk_index': max_sim_ref_index,
                'similarity_score': max_similarity,
                'type': 'SEMANTIC (PARAPHRASING)',
                'suspect_text': suspect_chunks[i],
                'reference_text': reference_chunks[max_sim_ref_index]
            })
    all_matches_raw = semantic_matches_raw + lexical_matches_raw
    return all_matches_raw, web_urls, total_chunks, total_words
# =========================================================================
# 4. PLAGIARISM CHECK ENDPOINT (/check-plagiarism)
# =========================================================================
@app.post("/check-plagiarism", response_model=PlagiarismReport)
async def check_plagiarism_endpoint(input_data: PlagiarismInput):
    suspect_text = input_data.suspect_text
    if TEXT_ENCODER is None:
        raise HTTPException(status_code=503, detail="Service Unavailable: Text Encoder is not initialized.")
    if not suspect_text.strip():
        raise HTTPException(status_code=400, detail="Input text is empty.")
    try:
        all_matches_raw, web_urls, total_chunks, total_words = execute_plagiarism_pipeline(suspect_text, TEXT_ENCODER)
        if total_chunks == 0 or not web_urls:
             return PlagiarismReport(
                overallScore=0.0, status="CONTENT ORIGINAL", flaggedChunks="0/0", 
                coverageRatio="0.00%", totalWords=total_words, 
                matches=[], suggestions=["Could not find external sources for comparison."],
                imageCheckStatus="Skipped."
            )
        if not all_matches_raw:
             return PlagiarismReport(
                overallScore=0.0, status="CONTENT ORIGINAL", flaggedChunks="0/0", 
                coverageRatio="0.00%", totalWords=total_words, 
                matches=[], suggestions=["No significant textual similarities detected."],
                imageCheckStatus="Skipped."
            )
        final_matches: List[Match] = []
        plagiarized_chunks_indices = set()
        for idx, match in enumerate(all_matches_raw):
            plagiarized_chunks_indices.add(match['suspect_chunk_index'])
            source_url = "N/A"
            if web_urls:
                source_url = web_urls[0]
            similarity_value = match['similarity_score']
            # --- FIX APPLIED HERE: Convert Tensor to float before rounding ---
            if torch.is_tensor(similarity_value):
                 similarity_value = similarity_value.item()
            final_matches.append(Match(
                id=idx + 1,
                similarity=round(similarity_value * 100, 2),
                type=match['type'],
                text=match['suspect_text'][:80].strip() + "...",
                source=match['reference_text'][:80].strip() + "...",
                url=source_url
            ))
        plagiarism_ratio = len(plagiarized_chunks_indices) / total_chunks
        overall_score = plagiarism_ratio * 100
        if overall_score > 50:
            status = "PLAGIARISM LIKELY" 
        elif overall_score > 10:
            status = "REVIEW REQUIRED"
        else:
            status = "CONTENT ORIGINAL"
        final_matches = sorted(final_matches, key=lambda x: x.similarity, reverse=True)[:5]
        image_check_status = "Skipped (API requires file upload for visual check)."
        return PlagiarismReport(
            overallScore=round(overall_score, 2),
            status=status,
            flaggedChunks=f"{len(plagiarized_chunks_indices)}/{total_chunks}",
            coverageRatio=f"{overall_score:.2f}%",
            totalWords=total_words,
            matches=final_matches,
            suggestions=["Review flagged sections for proper citation and paraphrasing.", "High similarity scores suggest direct copying or close paraphrasing."],
            imageCheckStatus=image_check_status
        )
    except Exception as e:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        error_details = "".join(traceback.format_exception(exc_type, exc_value, exc_traceback))
        print(f"\n--- CRITICAL RUNTIME ERROR IN PLAGIARISM CHECK ---\n{error_details}")
        raise HTTPException(
            status_code=500,
            detail=f"An internal processing error occurred. Check server console for full traceback.",
        )
# =========================================================================
# 5. GRAMMAR CHECK ENDPOINT (/check-grammar)
# =========================================================================
@app.post("/check-grammar", response_model=GrammarReportModel)
async def check_grammar_endpoint(input_data: GrammarInput):
    raw_text = input_data.raw_text
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Input text is empty.")
    try:
        report = check_spelling_and_grammar(raw_text)
        if isinstance(report, dict) and report.get("status") == "ERROR":
              raise HTTPException(status_code=500, detail=report.get("message", "Internal Grammar Check Error."))
        return report
    except Exception as e:
        exc_type, exc_value, exc_traceback = sys.exc_info()
        error_details = "".join(traceback.format_exception(exc_type, exc_value, exc_traceback))
        print(f"\n--- CRITICAL RUNTIME ERROR IN GRAMMAR CHECK ---\n{error_details}")
        raise HTTPException(
            status_code=500, 
            detail=f"Grammar check failed due to unexpected error: {e}"
        )
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)