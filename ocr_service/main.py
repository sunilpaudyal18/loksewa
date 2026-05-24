import os
# Disable oneDNN and PIR/New IR before any paddle import (same as in ocr_engine.py)
os.environ["FLAGS_use_mkldnn"] = "0"
os.environ["FLAGS_enable_pir_api"] = "0"
os.environ["PADDLE_PDX_ENABLE_MKLDNN_BYDEFAULT"] = "0"
os.environ["PADDLE_PDX_DISABLE_MKLDNN_MODEL_BL"] = "1"
os.environ["FLAGS_json_format_model"] = "0"


from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
from typing import List
import cv2
import numpy as np


# Import our custom modules
from layout import decode_image, preprocess_image, split_columns_if_two
from ocr_engine import run_ocr, reconstruct_reading_order, parse_questions_from_text, parse_answer_key_ocr

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("ocr_service")

app = FastAPI(title="Loksewa OCR Microservice", version="1.0.0")

# Enable CORS for Next.js app communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "healthy", "service": "Loksewa OCR Microservice", "engine": "PaddleOCR + OpenCV"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/ocr/process")
async def process_ocr(
    questions: List[UploadFile] = File(...),
    answer_key: UploadFile = File(...)
):
    """
    Perform pre-processing, layout analysis, column splitting, and region-based OCR on uploaded images.
    Returns structured JSON of parsed questions and answers.
    """
    logger.info(f"Received OCR request. Questions: {len(questions)} files. Answer Key: 1 file.")
    
    parsed_questions = []
    all_warnings = []
    all_errors = []
    confidence_scores = []
    
    # --- Step 1: Process Question Images ---
    try:
        for idx, q_file in enumerate(questions):
            logger.info(f"Processing question file: {q_file.filename}")
            q_bytes = await q_file.read()
            
            # Decode and Preprocess
            img = decode_image(q_bytes)
            upscaled_gray, denoised_gray = preprocess_image(img)
            
            # Column layout detection
            column_segments, split_x = split_columns_if_two(denoised_gray)
            
            # Run OCR on each column segment
            for col_idx, col_img in enumerate(column_segments):
                logger.info(f"Running PaddleOCR on {q_file.filename} Column {col_idx + 1}/{len(column_segments)}")
                
                # Convert grayscale column to BGR (PaddleOCR expects 3-channel input)
                col_bgr = cv2.cvtColor(col_img, cv2.COLOR_GRAY2BGR)
                ocr_result = run_ocr(col_bgr)
                
                # Reconstruct reading order text from boxes
                reconstructed_text = reconstruct_reading_order(ocr_result)
                if not reconstructed_text.strip():
                    logger.warning(f"No text extracted in {q_file.filename} Column {col_idx + 1}")
                    continue
                    
                # Parse questions from the reconstructed text
                questions_in_col, parse_warnings = parse_questions_from_text(reconstructed_text)
                
                parsed_questions.extend(questions_in_col)
                all_warnings.extend([f"{q_file.filename} [Col {col_idx + 1}]: {w}" for w in parse_warnings])
                
                # Collect confidence scores for average calculation
                for q in questions_in_col:
                    confidence_scores.append(q["confidence"])
                    
    except Exception as e:
        logger.exception("Error processing question paper images")
        raise HTTPException(status_code=500, detail=f"Failed to process question paper: {str(e)}")
        
    # --- Step 2: Process Answer Key Image ---
    parsed_answers = {}
    try:
        logger.info(f"Processing answer key: {answer_key.filename}")
        ak_bytes = await answer_key.read()
        
        # Decode and preprocess (we do 2x upscale and denoise but do NOT split columns)
        ak_img = decode_image(ak_bytes)
        upscaled_ak, denoised_ak = preprocess_image(ak_img)
        
        # Run PaddleOCR
        ak_bgr = cv2.cvtColor(denoised_ak, cv2.COLOR_GRAY2BGR)
        ak_ocr_result = run_ocr(ak_bgr)
        
        # Parse answers using X-coordinate clustering
        answers, ak_errors = parse_answer_key_ocr(ak_ocr_result)
        parsed_answers = answers
        all_warnings.extend([f"Answer Key: {err}" for err in ak_errors])
        
    except Exception as e:
        logger.exception("Error processing answer key image")
        # Log error but don't crash entirely so we still return questions if parsed
        all_errors.append(f"Answer key parsing failed: {str(e)}")
        
    # Calculate average OCR confidence
    avg_confidence = int(np.mean(confidence_scores)) if confidence_scores else 80
    
    logger.info(f"OCR process complete. Extracted {len(parsed_questions)} questions, {len(parsed_answers)} answers.")
    
    return {
        "success": True,
        "questions": parsed_questions,
        "answers": parsed_answers,
        "ocrConfidence": avg_confidence,
        "warnings": all_warnings,
        "errors": all_errors
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
