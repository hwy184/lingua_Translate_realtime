// src/sockets/ocrHandler.ts
import fileExtractService from '../../services/fileExtract.service.js'
import translationService from '../../services/translation.service.js';
import type { jsonResponeTranslate, rawFile, rawText } from '../../types/translation.js';


const registerFileHandler = async (fileBuffer: rawFile): Promise<jsonResponeTranslate> => {

    const readFileResult = await fileExtractService(fileBuffer.fileData);

    if (!readFileResult || readFileResult.text.trim() === "") {
        return {
            originalText: "[không có file word]",
            translatedText: ''
        }
    }

        const dataText: rawText = {
            text: readFileResult.text,
            src_lang: fileBuffer.src_lang,
            target_lang: fileBuffer.target_lang
        }

    const translatedText = await translationService(dataText);
    return {
        originalText: readFileResult.text,
        translatedText: translatedText.text
    }
}
export default registerFileHandler;