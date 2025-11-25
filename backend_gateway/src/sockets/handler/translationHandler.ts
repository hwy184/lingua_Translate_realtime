// src/sockets/translationHandler.ts
import handleTranslation from "../../services/translation.service.js";
import type { jsonResponeTranslate, rawText } from "../../types/translation.js";

const registerTranslationHandler = async (
    rawText: rawText,
): Promise<jsonResponeTranslate> => {
    const resultTranslate = await handleTranslation(rawText);
    return {
        originalText: rawText.text,
        translatedText: resultTranslate.translated_text,
        requestId: rawText.requestId,
    };
};

export default registerTranslationHandler;
