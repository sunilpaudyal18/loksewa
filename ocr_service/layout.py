import cv2
import numpy as np
import logging

logger = logging.getLogger("ocr_service.layout")

def decode_image(image_bytes: bytes) -> np.ndarray:
    """
    Decode raw image bytes into an OpenCV BGR image.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Failed to decode image bytes into OpenCV format.")
    return img

def preprocess_image(img: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """
    Preprocess image for OCR.

    Strategy (prevents OOM on large phone/scanner images):
      - Images already >= 1500px on long side: skip upscale (resolution is already fine).
      - Images > 2400px on long side: downscale to 2400px to avoid memory exhaustion.
      - Small images (<800px long side): 2x upscale to improve OCR accuracy.

    Returns:
      - upscaled_gray: grayscale preprocessed image
      - denoised_gray: preprocessed, denoised grayscale image
    """
    MAX_LONG_SIDE = 2400  # Never let the long side exceed this after preprocessing

    # 1. Grayscale conversion
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    long_side = max(h, w)

    # 2. Adaptive resize
    if long_side < 800:
        # Small image — upscale 2x for better OCR text detection
        upscaled = cv2.resize(gray, (w * 2, h * 2), interpolation=cv2.INTER_CUBIC)
        logger.info(f"Small image ({w}x{h}) — upscaled 2x to ({w*2}x{h*2})")
    elif long_side <= MAX_LONG_SIDE:
        # Good resolution already — no resizing needed
        upscaled = gray
        logger.info(f"Image ({w}x{h}) in acceptable range — no resize")
    else:
        # Large image — downscale to prevent OOM during denoising and PaddleOCR
        scale = MAX_LONG_SIDE / long_side
        new_w = int(w * scale)
        new_h = int(h * scale)
        upscaled = cv2.resize(gray, (new_w, new_h), interpolation=cv2.INTER_AREA)
        logger.info(f"Large image ({w}x{h}) — downscaled to ({new_w}x{new_h}) to prevent OOM")

    # 3. Denoising using Bilateral Filter
    # Bilateral filter reduces noise while keeping edges sharp (good for OCR)
    denoised = cv2.bilateralFilter(upscaled, d=9, sigmaColor=75, sigmaSpace=75)

    return upscaled, denoised

def split_columns_if_two(img_gray: np.ndarray) -> tuple[list[np.ndarray], int | None]:
    """
    Analyzes the vertical projection profile of the image to detect if it has
    a two-column layout. If so, splits the image vertically and returns the two columns.
    Otherwise, returns the original image as a single-element list.
    
    Returns:
      - columns: list of numpy arrays (1 or 2 images)
      - split_x: the X coordinate of the split in the img_gray coordinate system (or None)
    """
    h, w = img_gray.shape
    
    # 1. Threshold to binary inverted (white text, black background)
    # Using Otsu thresholding
    _, binary = cv2.threshold(img_gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    
    # 2. Crop margins (2% from each edge) for projection statistics.
    # This prevents black scan borders from corrupting column counts.
    margin_y = int(h * 0.02)
    margin_x = int(w * 0.02)
    cropped_binary = binary[margin_y:h - margin_y, margin_x:w - margin_x]
    
    ch, cw = cropped_binary.shape
    
    # 3. Sum white pixels along the vertical axis (vertical projection profile)
    vertical_projection = np.sum(cropped_binary == 255, axis=0)
    
    # 4. Search for a valley in the middle 30% to 70% of the cropped area
    mid_start = int(cw * 0.35)
    mid_end = int(cw * 0.65)
    mid_region = vertical_projection[mid_start:mid_end]
    
    if len(mid_region) == 0:
        return [img_gray], None
        
    # We look for a continuous stretch of columns where the white pixel count is very low.
    max_val = np.max(vertical_projection)
    # Threshold for "empty" space is 1.5% of max pixel density
    empty_threshold = max_val * 0.015
    
    runs = []
    current_run = []
    
    for idx, val in enumerate(mid_region):
        real_idx = mid_start + idx + margin_x  # Map back to original coordinate
        if val < empty_threshold:
            current_run.append(real_idx)
        else:
            if len(current_run) > 0:
                runs.append(current_run)
                current_run = []
    if len(current_run) > 0:
        runs.append(current_run)
        
    # Find the widest valley in the middle region
    # The valley must be at least 1.5% of the total page width to qualify as a column gap
    min_valley_width = int(w * 0.015)
    best_valley = None
    
    for run in runs:
        if len(run) >= min_valley_width:
            if best_valley is None or len(run) > len(best_valley):
                best_valley = run
                
    if best_valley:
        split_x = int(np.mean(best_valley))
        logger.info(f"Two-column layout detected. Splitting at X={split_x} (page width={w})")
        # Split original grayscale image
        col1 = img_gray[:, :split_x]
        col2 = img_gray[:, split_x:]
        return [col1, col2], split_x
    
    logger.info("Single-column layout detected.")
    return [img_gray], None
