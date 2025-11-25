// src/services/speechToText.service.ts
import axios from 'axios';
import FormData from 'form-data';

const PYTHON_API_URL = 'http://127.0.0.1:8000/services/transcribe-voice';

interface TranscriptionResult {
    text: string;
}
const speechToTextService = async (audioBuffer: Buffer): Promise<TranscriptionResult> => {
    const form = new FormData();

    form.append('file', audioBuffer, {
        filename: 'audio.webm',
        contentType: 'audio/webm',
    });

    try {
        const response = await axios.post<TranscriptionResult>(PYTHON_API_URL, form, {
            headers: { ...form.getHeaders() },
        });
        
        return response.data;

    } catch (error) {
        console.error("Lỗi khi gọi Speech-to-Text service:", error);
        throw new Error("Service nhận dạng giọng nói không phản hồi hoặc gặp lỗi.");
    }
};

export default speechToTextService;