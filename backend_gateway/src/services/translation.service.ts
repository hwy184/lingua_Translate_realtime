//src/services/translation.service.ts
import axios from "axios";
import type { rawText } from "../types/translation.js";
const PYTHON_API_URL = "http://127.0.0.1:8000/api/translate";

const TranslationService = async (rawText: rawText) => {
    try {
        const jsonResTranslatedText = await axios.post(PYTHON_API_URL, {
            requestId: "req_" + Date.now(),
            text: rawText.text,
            src_lang: rawText.src_lang,
            target_lang: rawText.target_lang,
        });
        console.log(`Dịch thành công: `);
        return jsonResTranslatedText.data;
    } catch (error) {
        console.error("Lỗi khi gọi đến FastAPI:", error);
        throw new Error("Service  không phản hồi hoặc gặp lỗi.");
    }
};

export default TranslationService;
