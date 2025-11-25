# main.py
import uvicorn
import logging
from fastapi import FastAPI

# Import các router từ thư mục services
from services import translation, ocr, file_extraction, transcription

# --- CẤU HÌNH LOGGING NGAY ĐÂY ---
# Cấu hình này sẽ áp dụng cho toàn bộ ứng dụng
logging.basicConfig(
    level=logging.DEBUG, # Mức log thấp nhất sẽ được hiển thị (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    format='%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
# ----------------------------------

# Khởi tạo ứng dụng FastAPI chính
app = FastAPI(
    title="AI Services API",
    description="Một API được refactor để cung cấp các dịch vụ AI một cách có tổ chức.",
    version="1.0.0",
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép tất cả các origin (trong môi trường dev)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Thêm các router của từng service vào ứng dụng chính
# `prefix` sẽ thêm /api vào trước tất cả các endpoint của router đó (ví dụ: /api/translate)
# `tags` giúp nhóm các API lại trong giao diện Swagger UI cho đẹp và dễ nhìn
app.include_router(translation.router, prefix="/api", tags=["Translation"])
app.include_router(ocr.router, prefix="/api", tags=["OCR"])
app.include_router(file_extraction.router, prefix="/api", tags=["read_docx"])
app.include_router(transcription.router, prefix="/api", tags=["Voice Transcription"])


@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the AI Services API!"}

# Lệnh để chạy server khi file này được thực thi trực tiếp
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)