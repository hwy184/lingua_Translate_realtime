import axios from 'axios';
import FormData from 'form-data';

const PYTHON_API_URL = 'http://127.0.0.1:8000/services/read_docx';

interface ExtractedTextResult {
    text: string;
}

const fileExtractService = async (pdfBuffer: Buffer): Promise<ExtractedTextResult> => {
    const form = new FormData();
    // Tên field ('file') phải khớp với tham số trong endpoint FastAPI: `file: UploadFile`
    form.append('file', pdfBuffer, {
        filename: 'document.docx', // Tên file ở đây không quá quan trọng
        contentType: 'application/docx',
    });

    try {
        const response = await axios.post<ExtractedTextResult>(PYTHON_API_URL, form, {
            headers: { ...form.getHeaders() },
        });

        return response.data;

    } catch (error) {
        console.error("Lỗi khi gọi PDF extraction service:", error);
        throw new Error("Service trích xuất PDF không phản hồi hoặc gặp lỗi.");
    }
};

export default fileExtractService;
