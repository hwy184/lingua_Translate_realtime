// src/sockets/index.ts
import { Server, Socket } from "socket.io";
import registerTranslationHandler from "./handler/translationHandler.js";
import registerOcrHandler from "./handler/ocrHandler.js";
import registerFileHandler from "./handler/fileHandler.js";
import registerAudioHandler from "./handler/audioHandler.js";
import type {
    rawAudio,
    rawFile,
    rawImage,
    rawText,
} from "../types/translation.js";

const registerSocketHandlers = (io: Server) => {
    io.on("connection", (socket: Socket) => {
        console.log(`✅ Một client đã kết nối: ${socket.id}`);

        socket.removeAllListeners();

        socket.on(
            "translate_stream",
            async (textTranslationRequest: rawText) => {
                console.log(`text: ${textTranslationRequest.text}`);
                const textTranslated = await registerTranslationHandler(
                    textTranslationRequest,
                );
                socket.emit("final_result", textTranslated);
            },
        );

        socket.on("ocr-image", async (imageTranslationRequest: rawImage) => {
            const resultTranslate = await registerOcrHandler(
                imageTranslationRequest,
            );
            socket.emit("final_result", resultTranslate);
        });

        socket.on("file-reader", async (fileTranslationRequest: rawFile) => {
            const resultTranslate = await registerFileHandler(
                fileTranslationRequest,
            );
            socket.emit("final_result", resultTranslate);
        });

        socket.on(
            "audio:process-and-translate",
            async (audioTranslationRequest: rawAudio) => {
                const resultTranslate = await registerAudioHandler(
                    audioTranslationRequest,
                );
                socket.emit("final_result", resultTranslate);
            },
        );

        socket.on("disconnect", () => {
            console.log(`❌ Client đã ngắt kết nối: ${socket.id}`);
        });
    });
};

export default registerSocketHandlers;
