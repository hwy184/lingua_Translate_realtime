# services/pdf_extraction.py
# import fitz # PyMuPDF
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from docx import Document
import io

router = APIRouter()

@router.post("/read_docx")
async def extract_pdf_text(file: UploadFile = File(...), requestId: str = Form(...)):
    try:
        docx_byte = await file.read()
        docx_stream = io.BytesIO(docx_byte)
        docx_has_read = Document(docx_stream)
        full_text = []
        
        # pdf_byte = await file.read()
        # 
        # with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
        #     for page in doc:
        #         full_text += page.get_text()
        
        for paragraph in docx_has_read.paragraphs:
            full_text.append(paragraph.text)
            
        document_content = '\n'.join(full_text)
        
        return JSONResponse(content={"text": document_content, "requestId": requestId})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))