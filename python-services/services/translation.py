# services/translation.py
import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

# from model_loader import translator
from models import TranslateRequest
from model_loader import translator

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/translate")
async def translate_text(request: TranslateRequest):
    logger.info(f"Nhận được yêu cầu dịch cho văn bản: '{request.text[:30]}...'")

    if not translator:
        logger.error("Model dịch thuật chưa được tải!")
        raise HTTPException(
            status_code=503, detail="Translation model is not available."
        )
    try:
        logger.debug("Bắt đầu gọi model dịch thuật...")
        result = await translator.translate(
            request.text, src=request.src_lang, dest=request.target_lang
        )
        translated_text = result.text

        logger.info(f"Dịch thành công!:  {translated_text} ")
        return JSONResponse(content={"translated_text": translated_text, "requestId": request.requestId})
    except Exception as e:
        logger.error(f"Đã xảy ra lỗi trong quá trình dịch: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
