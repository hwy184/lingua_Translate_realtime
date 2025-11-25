# model_loader.py

from transformers import pipeline
import easyocr
from vosk import Model

from googletrans import Translator

# Đường dẫn đến model Vosk
translator = Translator()
VOSK_MODEL_PATH_EN_US = "vosk-model-small-en-us-0.15"
VOSK_MODEL_PATH_VN = "vosk-model-small-vn-0.4"
vosk_models = {}
print("Đang tải các model AI, vui lòng chờ...")

try:
    # # 1. Tải model Dịch thuật (Anh -> Việt)
    # translator = pipeline("translation", model="Helsinki-NLP/opus-mt-en-vi")
    

    # 2. Tải model OCR
    print("Đang tải EasyOCR...")
    easyocr_reader = easyocr.Reader(['en', 'vi'], gpu=False)
    print("Tải EasyOCR thành công!")

    # 3. Tải model Speech-to-Text (Vosk)
    # Tải cả hai (hoặc nhiều hơn) model bạn hỗ trợ
    
    print("Đang tải model Vosk (EN)...")
    vosk_models['en'] = Model(VOSK_MODEL_PATH_EN_US)
    print("Tải Vosk (EN) thành công!")
    
    print("Đang tải model Vosk (VN)...")
    vosk_models['vn'] = Model(VOSK_MODEL_PATH_VN)
    print("Tải Vosk (VN) thành công!")

    print("\nTất cả model AI đã được tải thành công!")
    
except Exception as e:
    print(f"Lỗi khi tải model: {e}")
    # Gán là None để các service có thể kiểm tra
    translator = None
    easyocr_reader = None
    vosk_models = {}