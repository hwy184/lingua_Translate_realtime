# services/transcription.py

import json
import wave
import tempfile
import ffmpeg  
import os      
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from vosk import KaldiRecognizer
from model_loader import vosk_models
import logging 

router = APIRouter()
logger = logging.getLogger(__name__)
@router.post("/transcribe-voice")
async def transcribe_voice(file: UploadFile = File(...), lang: str = Form("vn"), requestId: str = Form(...)):
    if not vosk_models:
        raise HTTPException(status_code=503, detail="Vosk model is not available.")

    # Tạo file tạm để lưu file gốc upload lên
    input_tempfile = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1])
    # Tạo file tạm để lưu file WAV đã chuyển đổi
    output_wav_tempfile = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")

    try:
        # 1. Lưu file upload vào file tạm
        content = await file.read()
        with open(input_tempfile.name, 'wb') as f:
            f.write(content)

        # 2. SỬ DỤNG FFMPEG ĐỂ CHUYỂN ĐỔI SANG ĐỊNH DẠNG VOSK CẦN
        #   - acodec='pcm_s16le':  16-bit PCM
        #   - ac=1:               Mono (1 kênh)
        #   - ar='16000':         Tần số 16000Hz
        print(f"Bắt đầu chuyển đổi file: {input_tempfile.name} -> {output_wav_tempfile.name}")
        ffmpeg.input(input_tempfile.name).output(
            output_wav_tempfile.name, 
            acodec='pcm_s16le', 
            ac=1, 
            ar='16000'
        ).run(overwrite_output=True, quiet=True)
        print("Chuyển đổi thành công.")

        # 3. Mở file WAV đã được chuyển đổi để xử lý với Vosk
        selected_model = vosk_models[lang]
        wf = wave.open(output_wav_tempfile.name, "rb")

        rec = KaldiRecognizer(selected_model, wf.getframerate())
        rec.SetWords(True)

        while True:
            data = wf.readframes(4000)
            if len(data) == 0:
                break
            rec.AcceptWaveform(data)
        
        wf.close() # Đóng file sau khi đọc xong

        result = json.loads(rec.FinalResult())
        logger.info(f"text:  {result['text']} ")
        return JSONResponse(content={"text": result['text'], "requestId": requestId})

    except ffmpeg.Error as e:
        print("Lỗi FFmpeg:", e.stderr)
        raise HTTPException(status_code=400, detail=f"Không thể xử lý định dạng file audio: {e.stderr.decode('utf8')}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.remove(input_tempfile.name)
        os.remove(output_wav_tempfile.name)