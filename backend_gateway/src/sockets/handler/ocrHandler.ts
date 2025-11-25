// src/sockets/ocrHandler.ts

import imageConfig from '../../utils/imageConfig.js';
import ocrService from '../../services/ocr.service.js';
import translationService from '../../services/translation.service.js';
import type { jsonResponeTranslate, rawText ,rawImage } from '../../types/translation.js';

const registerOcrHandler = async (imageRaw: rawImage): Promise<jsonResponeTranslate> => {

    const imageBuffer = imageConfig(imageRaw.imageData);
    const ocrResult = await ocrService(imageBuffer);
    
    if (!ocrResult.text || ocrResult.text.trim() === '') {
        return {
            originalText: 'Không nhận dạng được',
            translatedText: ''
        }
    };

    const dataText: rawText = {
        text: ocrResult.text,
        src_lang: imageRaw.src_lang,
        target_lang: imageRaw.target_lang
    }

    const translatedText = await translationService(dataText);
    return {
        originalText: ocrResult.text,
        translatedText: translatedText.text
    }

}

export default registerOcrHandler;