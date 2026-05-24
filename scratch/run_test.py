import sys
import traceback
sys.path.append('ocr_service')

from test_ocr import test_questions

if __name__ == '__main__':
    try:
        print("Starting test...")
        test_questions()
        print("Test completed successfully.")
    except Exception as e:
        print("An error occurred during execution:")
        traceback.print_exc()
