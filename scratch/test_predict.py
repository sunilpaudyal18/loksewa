import sys
sys.path.append('ocr_service')
import cv2
from paddleocr import PaddleOCR

print("Initializing PaddleOCR...")
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
print("PaddleOCR initialized successfully.")

print("Reading test image...")
img = cv2.imread("public/test/q6.jpeg")
print("Image shape:", img.shape)

print("Predicting with numpy array...")
try:
    res = ocr.predict(img)
    print("Prediction succeeded! Result type:", type(res))
    if res:
        print("Keys in result[0]:", res[0].keys() if hasattr(res[0], 'keys') else 'No keys')
except Exception as e:
    import traceback
    traceback.print_exc()

print("Predicting with file path...")
try:
    res = ocr.predict("public/test/q6.jpeg")
    print("Prediction with path succeeded! Result type:", type(res))
except Exception as e:
    import traceback
    traceback.print_exc()
