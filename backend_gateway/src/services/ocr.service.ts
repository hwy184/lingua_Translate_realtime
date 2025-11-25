// src/services/ocr.service.ts 
import axios from 'axios';
import FormData from 'form-data';
const PYTHON_API_URL = 'http://127.0.0.1:8000/api/ocr';

interface OcrResult{
    text: string;
}

// Service chỉ nhận buffer và trả về kết quả. KHÔNG CẦN socket.
const ocrService = async (imageBuffer: Buffer): Promise<OcrResult> => {
    const form = new FormData();
    form.append('file', imageBuffer, {
        filename: 'pasted-image.png',
        contentType: 'image/png',
    });

    try {
        const response = await axios.post<OcrResult>(PYTHON_API_URL, form, {
            headers: { ...form.getHeaders() },
        });
        return response.data; 

    } catch (error) {
        console.error("Lỗi khi gọi đến FastAPI:", error);
        throw new Error("Service OCR không phản hồi hoặc gặp lỗi.");
    }
};

export default ocrService;