# services/ocr.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from model_loader import easyocr_reader
import logging 

router = APIRouter()

logger = logging.getLogger(__name__)

@router.post("/ocr")
async def image_ocr(file: UploadFile = File(...), requestId: str = Form(...)):
    logger.info(f"file ảnh nhận được {UploadFile}")
    if not easyocr_reader:
        logger.error("không tìm thấy model")
        raise HTTPException(status_code=503, detail="OCR model is not available.")
    try:
        logger.debug("bắt đầu quét ảnh")
        image_bytes = await file.read()
        result = easyocr_reader.readtext(image_bytes, detail=0, paragraph=True)
        logger.info(f"result: {result}")
        full_text = " ".join(result)
        logger.info(f"{full_text}")
        return JSONResponse(content={"text": full_text, "requestId": requestId})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))