import os
# Disable oneDNN and PIR/New IR before any paddle import (same as in ocr_engine.py)
os.environ["FLAGS_use_mkldnn"] = "0"
os.environ["FLAGS_enable_pir_api"] = "0"
os.environ["PADDLE_PDX_ENABLE_MKLDNN_BYDEFAULT"] = "0"
os.environ["PADDLE_PDX_DISABLE_MKLDNN_MODEL_BL"] = "1"
os.environ["FLAGS_json_format_model"] = "0"


import cv2
import json
import sys

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from layout import preprocess_image, split_columns_if_two
from ocr_engine import run_ocr, reconstruct_reading_order, parse_questions_from_text, parse_answer_key_ocr

def test_questions():
    img_path = "public/test/q6.jpeg"
    if not os.path.exists(img_path):
        print(f"Test image not found at {img_path}")
        return
        
    print(f"\n--- Testing Questions OCR on {img_path} ---")
    
    # Load image
    img = cv2.imread(img_path)
    print(f"Original shape: {img.shape}")
    
    # Preprocess
    upscaled, denoised = preprocess_image(img)
    print(f"Upscaled shape: {upscaled.shape}")
    
    # Column split detection
    cols, split_x = split_columns_if_two(denoised)
    print(f"Columns detected: {len(cols)}")
    if split_x:
        print(f"Split X coordinate: {split_x}")
        
    for idx, col_img in enumerate(cols):
        print(f"\nRunning OCR on Column {idx + 1}...")
        col_bgr = cv2.cvtColor(col_img, cv2.COLOR_GRAY2BGR)
        result = run_ocr(col_bgr)
        
        # Reconstruct reading order
        reconstructed = reconstruct_reading_order(result)
        print("--- Reconstructed Text Preview (first 300 chars) ---")
        print(reconstructed[:300])
        print("-----------------------------------------------------")
        
        # Parse questions
        questions, warnings = parse_questions_from_text(reconstructed)
        print(f"Parsed {len(questions)} questions.")
        for q in questions[:3]:
            print(f"\nQ{q['number']}: {q['text'][:80]}...")
            print(f"  A) {q['optionA']}")
            print(f"  B) {q['optionB']}")
            print(f"  C) {q['optionC']}")
            print(f"  D) {q['optionD']}")
            print(f"  Confidence: {q['confidence']}")
            if q['hasWarning']:
                print(f"  Warning: {q['warningMessage']}")
        if warnings:
            print(f"Warnings: {warnings[:5]}")

def test_answer_key():
    img_path = "public/test/ans1.jpeg"
    if not os.path.exists(img_path):
        print(f"Test image not found at {img_path}")
        return
        
    print(f"\n--- Testing Answer Key OCR on {img_path} ---")
    
    # Load image
    img = cv2.imread(img_path)
    
    # Preprocess
    upscaled, denoised = preprocess_image(img)
    
    # Run OCR
    ak_bgr = cv2.cvtColor(denoised, cv2.COLOR_GRAY2BGR)
    result = run_ocr(ak_bgr)
    
    # Parse answers using X-coordinate clustering
    answers, errors = parse_answer_key_ocr(result)
    print(f"Parsed {len(answers)} answers.")
    print("Sample Answers (first 10):")
    sorted_keys = sorted(answers.keys())
    for k in sorted_keys[:10]:
        print(f"  Q{k}: {answers[k]}")
    if errors:
        print(f"Errors/Warnings: {errors}")

if __name__ == "__main__":
    test_questions()
    test_answer_key()
