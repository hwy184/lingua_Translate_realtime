interface request {
    requestId: string;
}

export interface jsonResponeTranslate extends request {
    originalText: string;
    translatedText: string;
}

export interface rawText extends request {
    text: string;
    src_lang: string;
    target_lang: string;
}

export interface rawImage extends request {
    imageData: string | Buffer;
    src_lang: string;
    target_lang: string;
}

export interface rawFile extends request {
    fileData: Buffer;
    src_lang: string;
    target_lang: string;
}

export interface rawAudio extends request {
    audioBuffer: Buffer;
    src_lang: string;
    target_lang: string;
}
