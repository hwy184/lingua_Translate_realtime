// src/sockets/audioHandler.ts

import speechToTextService from '../../services/speechToText.service.js';
import translationService from '../../services/translation.service.js';
import type { rawAudio, rawText } from '../../types/translation.js';

const registerAudioHandler = async (audioBuffer: rawAudio) => {
    const originalText = await speechToTextService(audioBuffer.audioBuffer);

    if (!originalText || originalText.text.trim() === '') {
        return {
            originalText: '[Không nhận dạng được giọng nói]',
            translatedText: ''
        };
    }

    const dataText: rawText = {
        text: originalText.text,
        src_lang: audioBuffer.src_lang,
        target_lang: audioBuffer.target_lang
    }

    const translatedText = await translationService(dataText);
    return {
        originalText: originalText,
        translatedText: translatedText.text
    };
}

export default registerAudioHandler;