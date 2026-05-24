import os
import re
import numpy as np
import logging

# ---------------------------------------------------------------------------
# Disable oneDNN / MKL-DNN and PIR / New IR BEFORE importing paddle/paddleocr.
# PaddleOCR 3.x on some Windows CPUs throws:
#   NotImplementedError: ConvertPirAttribute2RuntimeAttribute not support
#     [pir::ArrayAttribute<pir::DoubleAttribute>]
# Setting these flags forces plain CPU kernels and avoids the crash.
# ---------------------------------------------------------------------------
os.environ["FLAGS_use_mkldnn"] = "0"
os.environ["FLAGS_enable_pir_api"] = "0"
os.environ["PADDLE_PDX_ENABLE_MKLDNN_BYDEFAULT"] = "0"
os.environ["PADDLE_PDX_DISABLE_MKLDNN_MODEL_BL"] = "1"
os.environ["FLAGS_json_format_model"] = "0"

from paddleocr import PaddleOCR
from PIL import Image
import io

logger = logging.getLogger("ocr_service.ocr_engine")

# ---------------------------------------------------------------------------
# PaddleOCR 3.5.0 — initialize with new param names.
# use_angle_cls / use_textline_orientation: correct text-line rotation.
# lang='ne' loads the Devanagari recognition model (bilingual Ne+En).
# Pass enable_mkldnn=False and engine_config to force old executor CPU path.
# ---------------------------------------------------------------------------
logger.info("Initializing PaddleOCR 3.x with lang='ne'...")
ocr = PaddleOCR(
    use_textline_orientation=True,
    lang='ne',
    enable_mkldnn=False,
    engine_config={
        "paddle_static": {
            "run_mode": "paddle",
            "enable_new_ir": False,
        }
    }
)
logger.info("PaddleOCR initialized successfully.")


# ---------------------------------------------------------------------------
# PaddleOCR 3.x compatibility shim
# ---------------------------------------------------------------------------

def _convert_predict_result(predict_result) -> list:
    """
    Convert PaddleOCR 3.x predict() output to the legacy ocr.ocr() format:

    Legacy format (what our parsers expect):
      [ [                          <- page list (always one page)
          [ box_pts, (text, conf) ],   <- one entry per text box
          ...
        ]
      ]
    where box_pts = [[x1,y1],[x2,y2],[x3,y3],[x4,y4]]

    PaddleOCR 3.x predict() format:
      list[dict] where each dict (one per image) has:
        'dt_polys'  : list of np.ndarray, shape (4,2)
        'rec_texts' : list[str]
        'rec_scores': list[float]
    """
    if not predict_result:
        return [[]]  # empty but valid

    res = predict_result[0]  # we always process one image at a time
    dt_polys  = res.get("dt_polys",  [])
    rec_texts = res.get("rec_texts", [])
    rec_scores = res.get("rec_scores", [])

    lines = []
    for poly, text, score in zip(dt_polys, rec_texts, rec_scores):
        # poly: np.ndarray of shape (4, 2)  →  [[x1,y1],[x2,y2],[x3,y3],[x4,y4]]
        box_pts = [[int(pt[0]), int(pt[1])] for pt in poly]
        lines.append([box_pts, (text, float(score))])

    return [lines]  # wrap in outer list (page dimension)


def run_ocr(img) -> list:
    """
    Run PaddleOCR on a numpy BGR image and return the result in legacy format.
    Use this everywhere instead of ocr.ocr(img, cls=True).
    """
    predict_result = ocr.predict(img)
    return _convert_predict_result(predict_result)

# ---------------------------------------------------------------------------
# OCR Constants & Maps
# ---------------------------------------------------------------------------

NEPALI_TO_ARABIC = {
    "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
    "५": "5", "६": "6", "७": "7", "८": "8", "९": "9"
}

NEPALI_OPTIONS = {
    "क": "A", "ख": "B", "ग": "C", "घ": "D",
    "क)": "A", "ख)": "B", "ग)": "C", "घ)": "D"
}

QUESTION_START_RE = re.compile(
    r"^[|;:\\\u0964\-\s'\"]{0,5}(?:Q\.?\s*)?\(?([1-9][0-9]{0,2}|[१-९][०-९]{0,2})\)?\s*[.):,]\s+\S"
)

NEW_Q_IN_OPTION_RE = re.compile(
    r"(?:\n|^)[|;:\\\u0964\-\s'\"]{0,5}(?:Q\.?\s*)?\(?([1-9][0-9]{0,2})\)?\s*[.):,]\s+\S",
    re.MULTILINE
)

OPTION_BOUNDARY_RE = re.compile(r"\b([ABCDabcd])\)\s*")

# ---------------------------------------------------------------------------
# Preprocessing & Normalization Helpers
# ---------------------------------------------------------------------------

def convert_nepali_numerals(text: str) -> str:
    return "".join(NEPALI_TO_ARABIC.get(char, char) for char in text)

def detect_language(text: str) -> str:
    devanagari_chars = len(re.findall(r"[\u0900-\u097F]", text))
    total_chars = len(text.replace(" ", "").replace("\n", ""))
    if total_chars > 0 and devanagari_chars / total_chars > 0.3:
        return "ne"
    return "en"

def normalize_option_separators(text: str) -> str:
    out = text
    
    # Common OCR Hallucinations for options
    out = re.sub(r"©\s*[.):\-]?\s*", "C) ", out)
    out = re.sub(r"छ[ेै]?\s*\)", "B) ", out)
    out = re.sub(r"उ\s*\)", "B) ", out)
    out = re.sub(r"-\s*गि\s*", "B) ", out)
    out = re.sub(r"\(९\)\s*", "C) ", out)
    out = re.sub(r"\(\"\)\s*", "C) ", out)
    out = re.sub(r"\(8\)\s*", "C) ", out)
    out = re.sub(r"7\s*\)", "D) ", out)
    
    out = re.sub(r"\b1D\)", "D)", out)
    out = re.sub(r"(^|\s)13\)", r"\g<1>B) ", out)
    out = re.sub(r"(^|\s)3\)", r"\g<1>B) ", out)
    
    out = re.sub(r"\bA:\s", "A) ", out)
    out = re.sub(r"\bB:\s", "B) ", out)
    out = re.sub(r"\bC:\s", "C) ", out)
    out = re.sub(r"\bD:\s", "D) ", out)
    
    out = re.sub(r"([a-zA-Z\u0900-\u097F]\s+)(5|6|8|9)\s*\)", r"\g<1>B) ", out)
    out = re.sub(r"^[|;:\\\u0964\-\s'\"]*\(?0\)\s*", "C) ", out, flags=re.MULTILINE)
    out = re.sub(r"^[|;:\\\u0964\-\s'\"]*\('\)\s*", "C) ", out, flags=re.MULTILINE)
    out = re.sub(r"([a-zA-Z\u0900-\u097F]\s+)1\s*\)", r"\g<1>D) ", out)
    out = re.sub(r"([a-zA-Z\u0900-\u097F]\s+)0\s*\)", r"\g<1>D) ", out)
    
    # Nepali double-paren क)) ख)) ग)) घ))
    out = re.sub(r"(क|ख|ग|घ)\)\)", lambda m: f"{NEPALI_OPTIONS.get(m.group(1), m.group(1))}) ", out)
    
    # Nepali single-paren क) ख) ग) घ)
    # Using lambda to handle the match and replacement
    def nep_opt_replace(m):
        prefix = m.group(1)
        letter = m.group(2)
        return f"{prefix}{NEPALI_OPTIONS.get(letter, letter)}) "
        
    out = re.sub(r"(^|\s)(क|ख|ग|घ)\s*[).:\-]\s*", nep_opt_replace, out)
    
    # Nepali space separator (क text)
    out = re.sub(r"(^|\s)(क|ख|ग|घ)\s+(?=[^\s])", nep_opt_replace, out)
    
    # Nepali options in brackets/parens (क) [क]
    out = re.sub(r"[({\[]\s*(क|ख|ग|घ)\s*[)}\]]\s*", lambda m: f"{NEPALI_OPTIONS.get(m.group(1), m.group(1))}) ", out)
    
    # English options in parens (A) [A]
    out = re.sub(r"[({\[]\s*([ABCDabcd])\s*[)}\]]\s*", lambda m: f"{m.group(1).upper()}) ", out)
    
    # English options with explicit separator (A. A: A-)
    out = re.sub(r"\b([ABCDabcd])\s*[.:\-]\s*(?=\S)", lambda m: f"{m.group(1).upper()}) ", out)
    
    # English option at line start with space only
    out = re.sub(r"^([ABCDabcd]) (?=[A-Z\u0900-\u097F\d])", lambda m: f"{m.group(1).upper()}) ", out, flags=re.MULTILINE)
    
    return out

def is_ocr_garbage(text: str) -> bool:
    if not text:
        return False
    if re.search(r"([|=\-#*~])\1{3,}", text):
        return True
    if re.search(r"\S{60,}", text):
        return True
    alnum_chars = len(re.findall(r"[a-zA-Z0-9\u0900-\u097F]", text))
    if len(text) > 10 and alnum_chars / len(text) < 0.3:
        return True
    return False

def compute_confidence(options: dict[str, str], question_text: str) -> tuple[float, list[str]]:
    score = 1.0
    warnings = []
    
    missing = [k for k in ["A", "B", "C", "D"] if not options.get(k)]
    if missing:
        score -= len(missing) * 0.15
        warnings.append(f"Missing options: {', '.join(missing)}")
        
    for key, val in options.items():
        if len(val) > 250:
            score -= 0.15
            warnings.append(f"Option {key} is unusually long ({len(val)} chars) - possible OCR merge")
            
    if is_ocr_garbage(question_text):
        score -= 0.1
        warnings.append("Question text contains suspected OCR noise")
        
    score = max(0.1, min(1.0, score))
    return score, warnings

# ---------------------------------------------------------------------------
# Reading Order Layout Reconstructer
# ---------------------------------------------------------------------------

def reconstruct_reading_order(ocr_result) -> str:
    """
    Sort PaddleOCR output boxes in a human reading order (top-to-bottom, left-to-right).
    Groups boxes that lie on the same horizontal text line (within a Y tolerance),
    sorts boxes on the same line from left to right, and joins lines with newlines.
    """
    if not ocr_result or not ocr_result[0]:
        return ""
        
    boxes = []
    for line in ocr_result[0]:
        box_pts, (text, conf) = line
        # box_pts is [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
        x_pts = [pt[0] for pt in box_pts]
        y_pts = [pt[1] for pt in box_pts]
        x_min, x_max = min(x_pts), max(x_pts)
        y_min, y_max = min(y_pts), max(y_pts)
        cx = (x_min + x_max) / 2
        cy = (y_min + y_max) / 2
        h = y_max - y_min
        boxes.append({
            "cx": cx, "cy": cy, "h": h, "w": x_max - x_min,
            "y_min": y_min, "y_max": y_max, "x_min": x_min,
            "text": text, "conf": conf
        })
        
    # Sort boxes primarily by y_min
    boxes.sort(key=lambda b: b["y_min"])
    
    # Group boxes into horizontal lines
    lines = []
    current_line = []
    
    for box in boxes:
        if not current_line:
            current_line.append(box)
        else:
            # Check if this box is on the same line as the current line
            # We check if Y centers are close relative to the average height
            avg_h = sum(b["h"] for b in current_line) / len(current_line)
            avg_cy = sum(b["cy"] for b in current_line) / len(current_line)
            
            if abs(box["cy"] - avg_cy) < (avg_h * 0.6):
                current_line.append(box)
            else:
                # Sort current line from left to right
                current_line.sort(key=lambda b: b["x_min"])
                lines.append(current_line)
                current_line = [box]
                
    if current_line:
        current_line.sort(key=lambda b: b["x_min"])
        lines.append(current_line)
        
    # Reconstruct text
    reconstructed_lines = []
    for line in lines:
        line_text = " ".join(b["text"] for b in line).strip()
        reconstructed_lines.append(line_text)
        
    return "\n".join(reconstructed_lines)

# ---------------------------------------------------------------------------
# Region-Based Question Paper Parser
# ---------------------------------------------------------------------------

def extract_options_from_block(block: str) -> tuple[dict[str, str], str]:
    normalized_block = normalize_option_separators(block)
    options = {}
    boundaries = []
    
    # Reset regex index and find matches
    for match in OPTION_BOUNDARY_RE.finditer(normalized_block):
        label = match.group(1).upper()
        if label in ["A", "B", "C", "D"]:
            # Ensure no duplicates, keep first occurrence
            if not any(b["label"] == label for b in boundaries):
                boundaries.append({
                    "label": label,
                    "start": match.start(),
                    "end": match.end()
                })
                
    # Sort by position in text
    boundaries.sort(key=lambda b: b["start"])
    
    if not boundaries:
        return options, normalized_block.strip()
        
    # Question body is everything before the first option
    question_body = normalized_block[:boundaries[0]["start"]].strip()
    
    # Slice text between option markers
    for idx, bound in enumerate(boundaries):
        label = bound["label"]
        start = bound["end"]
        end = boundaries[idx + 1]["start"] if idx + 1 < len(boundaries) else len(normalized_block)
        
        content = normalized_block[start:end].strip()
        
        # Strip trailing new question patterns (if block contains merged questions)
        new_q_match = NEW_Q_IN_OPTION_RE.search(content)
        if new_q_match:
            content = content[:new_q_match.start()].strip()
            
        if is_ocr_garbage(content):
            content = content[:200]  # truncate
            
        options[label] = content
        
    return options, question_body

def parse_question_block(block: str) -> dict | None:
    lines = [l.strip() for l in block.split("\n") if l.strip()]
    if not lines:
        return None
        
    # Check if first line matches question start
    num_match = QUESTION_START_RE.match(lines[0])
    if not num_match:
        return None
        
    raw_num = num_match.group(1)
    question_num_str = convert_nepali_numerals(raw_num)
    try:
        question_num = int(question_num_str)
    except ValueError:
        return None
        
    if question_num <= 0 or question_num > 500:
        return None
        
    # Reconstruct block without the question number prefix
    remainder_of_first_line = lines[0][num_match.end():].strip()
    block_without_num = "\n".join([remainder_of_first_line] + lines[1:])
    
    options, question_text = extract_options_from_block(block_without_num)
    
    # Fallback: if we didn't find enough options, try parsing the block as a single flat line
    if len(options) < 2:
        flat_block = block_without_num.replace("\n", " ")
        fallback_options, fallback_text = extract_options_from_block(flat_block)
        if len(fallback_options) >= 2:
            options = fallback_options
            question_text = fallback_text
            
    if not question_text:
        question_text = remainder_of_first_line
        
    score, warnings = compute_confidence(options, question_text)
    
    return {
        "number": question_num,
        "text": question_text,
        "optionA": options.get("A", ""),
        "optionB": options.get("B", ""),
        "optionC": options.get("C", ""),
        "optionD": options.get("D", ""),
        "answer": "",  # Filled by the matching logic in frontend/route
        "language": detect_language(question_text),
        "confidence": int(score * 100),
        "hasWarning": len(warnings) > 0,
        "warningMessage": "; ".join(warnings) if warnings else None
    }

def split_into_question_blocks(text: str) -> list[str]:
    lines = text.split("\n")
    blocks = []
    current_block = []
    
    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            continue
            
        if QUESTION_START_RE.match(line) and current_block:
            blocks.append("\n".join(current_block))
            current_block = []
            
        current_block.append(line)
        
    if current_block:
        blocks.append("\n".join(current_block))
        
    return [b for b in blocks if len(b) > 10]

def parse_questions_from_text(raw_text: str) -> tuple[list[dict], list[str]]:
    warnings = []
    blocks = split_into_question_blocks(raw_text)
    questions = []
    
    for block in blocks:
        parsed = parse_question_block(block)
        if parsed:
            questions.append(parsed)
        else:
            warnings.append(f"Failed to parse question block: '{block[:60]}...'")
            
    return questions, warnings

# ---------------------------------------------------------------------------
# Answer Key Parser (with X-Coordinate Clustering)
# ---------------------------------------------------------------------------

def parse_answer_key_ocr(ocr_result) -> tuple[dict[int, str], list[str]]:
    """
    Parse answer key tables using X-coordinate clustering.
    Identifies column bands, sorts entries top-to-bottom within columns,
    and extracts question-number -> answer mapping.
    """
    errors = []
    answers = {}
    
    if not ocr_result or not ocr_result[0]:
        return answers, ["No text detected in answer key image."]
        
    # Extract boxes and coordinates
    boxes = []
    for line in ocr_result[0]:
        box_pts, (text, conf) = line
        x_pts = [pt[0] for pt in box_pts]
        y_pts = [pt[1] for pt in box_pts]
        x_min, x_max = min(x_pts), max(x_pts)
        y_min, y_max = min(y_pts), max(y_pts)
        cx = (x_min + x_max) / 2
        cy = (y_min + y_max) / 2
        boxes.append({
            "cx": cx, "cy": cy, "x_min": x_min, "x_max": x_max,
            "y_min": y_min, "y_max": y_max, "text": text.strip()
        })
        
    if not boxes:
        return answers, ["No text blocks found in answer key."]
        
    # Sort boxes by X coordinate to prepare for column clustering
    boxes.sort(key=lambda b: b["cx"])
    
    # Cluster boxes into column bands using X gap thresholding
    # If the X gap between consecutive boxes is > 5% of the total width span, we start a new column.
    x_min_span = min(b["cx"] for b in boxes)
    x_max_span = max(b["cx"] for b in boxes)
    span_width = x_max_span - x_min_span
    gap_threshold = max(30.0, span_width * 0.05)
    
    columns = []
    current_col = []
    
    for box in boxes:
        if not current_col:
            current_col.append(box)
        else:
            last_box = current_col[-1]
            if box["cx"] - last_box["cx"] > gap_threshold:
                # Start new column
                columns.append(current_col)
                current_col = [box]
            else:
                current_col.append(box)
                
    if current_col:
        columns.append(current_col)
        
    logger.info(f"Clustered answer key into {len(columns)} columns based on X-coordinates.")
    
    # Process each column band independently, sorting top-to-bottom
    # We look for:
    # 1. Box with format "1 A" or "1. A" or "1) A" or "१ क" or "१) क"
    # 2. Sequential pairing: a box that is just a number, followed by a box that is just a letter.
    
    # Patterns
    # Allow minor trailing noise (e.g. "1. A " or "1 A.") by using a relaxed anchor
    full_pattern = re.compile(r"^\s*(\d{1,3}|[०-९]{1,3})\s*[.):\-=\]}>]?\s*([ABCDabcdकखगघ])[.):\-=\]}>\s]*$")
    number_pattern = re.compile(r"^\s*(\d{1,3}|[०-९]{1,3})\s*$")
    option_pattern = re.compile(r"^\s*([ABCDabcdकखगघ])\s*$")
    
    # Conversion helper
    def map_to_english_option(opt: str) -> str | None:
        opt_upper = opt.upper()
        if opt_upper in ["A", "B", "C", "D"]:
            return opt_upper
        # Check Nepali
        return NEPALI_OPTIONS.get(opt)
        
    for col_idx, col in enumerate(columns):
        # Sort top-to-bottom by Y coordinate
        col.sort(key=lambda b: b["y_min"])
        
        idx = 0
        while idx < len(col):
            box = col[idx]
            text = box["text"]
            
            # Scenario 1: Number + Answer combined in a single box, e.g. "1 A" or "12. C"
            m = full_pattern.match(text)
            if m:
                num = int(convert_nepali_numerals(m.group(1)))
                ans = map_to_english_option(m.group(2))
                if ans and 1 <= num <= 300:
                    answers[num] = ans
                idx += 1
                continue
                
            # Scenario 2: Number is in this box, and option is in the next box (or vice versa)
            # Check if this box is a number
            m_num = number_pattern.match(text)
            if m_num and idx + 1 < len(col):
                next_box = col[idx + 1]
                m_opt = option_pattern.match(next_box["text"])
                if m_opt:
                    num = int(convert_nepali_numerals(m_num.group(1)))
                    ans = map_to_english_option(m_opt.group(1))
                    if ans and 1 <= num <= 300:
                        answers[num] = ans
                    idx += 2
                    continue
                    
            idx += 1

    # --- Supplementary regex scan (always runs, fills gaps left by column clustering) ---
    # Build a reading-order text from all boxes and scan each line with a permissive regex.
    # First-found wins: we never overwrite an answer already captured above.
    dummy_result = [
        [
            [[b["x_min"], b["y_min"]], [b["x_max"], b["y_min"]],
             [b["x_max"], b["y_max"]], [b["x_min"], b["y_max"]]],
            (b["text"], 0.95)
        ]
        for b in boxes
    ]
    full_text = reconstruct_reading_order([dummy_result])
    for line in full_text.split("\n"):
        # Match formats like: "13 A", "13. A", "13) A", "13:A", "13A"
        matches = re.findall(
            r"(?:^|\s|[^a-zA-Z0-9])(\d{1,3}|[०-९]{1,3})\s*[.):\-=\]}>]?\s*([ABCDabcdकखगघ])(?:[^a-zA-Z0-9]|$)",
            line
        )
        for num_str, opt_str in matches:
            try:
                num = int(convert_nepali_numerals(num_str))
            except ValueError:
                continue
            ans = map_to_english_option(opt_str)
            if ans and 1 <= num <= 300 and num not in answers:
                answers[num] = ans

    if not answers:
        errors.append("Could not parse any QA pairs from the answer key. Check image quality.")

    return answers, errors
