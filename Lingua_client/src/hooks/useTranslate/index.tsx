import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "../../context/SocketContext";

interface TranslatePayload {
    text: string;
    src_lang: string;
    target_lang: string;
}

interface TranslateResult {
    translatedText: string;
    originalText?: string;
}

/**
 * Hook để xử lý logic dịch thuật real-time qua WebSocket
 */
export const useTranslate = () => {
    const socket = useSocket();
    const [translatedText, setTranslatedText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Dùng ref để track request hiện tại, tránh race condition
    const currentRequestRef = useRef<string>("");
    const isProcessingRef = useRef(false);

    useEffect(() => {
        // Handler xử lý kết quả dịch
        const handleTranslation = (result: TranslateResult) => {
            console.log("📥 Nhận kết quả:", result);

            // Chỉ cập nhật nếu đúng request đang chờ
            if (result.originalText === currentRequestRef.current) {
                setTranslatedText(result.translatedText);
                setIsLoading(false);
                isProcessingRef.current = false;
            }
        };

        // Handler xử lý lỗi
        const handleError = (error: string) => {
            console.error("❌ Lỗi dịch:", error);
            setIsLoading(false);
            isProcessingRef.current = false;
        };

        // Đăng ký listeners
        socket.on("final_result", handleTranslation);
        socket.on("translation_error", handleError);

        // Cleanup khi unmount
        return () => {
            socket.off("final_result", handleTranslation);
            socket.off("translation_error", handleError);
        };
    }, [socket]); // Chỉ chạy khi socket thay đổi

    // Dùng useCallback để tránh tạo function mới mỗi lần render
    const sendForTranslation = useCallback(
        (payload: TranslatePayload) => {
            // Validate input
            if (!payload.text.trim()) {
                setIsLoading(false);
                setTranslatedText("");
                currentRequestRef.current = "";
                return;
            }

            // Bỏ qua nếu đang xử lý request giống hệt
            if (
                isProcessingRef.current &&
                currentRequestRef.current === payload.text
            ) {
                console.log("⏭️ Bỏ qua request trùng lặp");
                return;
            }

            console.log("📤 Gửi yêu cầu dịch:", payload.text);

            // Cập nhật trạng thái
            currentRequestRef.current = payload.text;
            isProcessingRef.current = true;
            setIsLoading(true);

            // Emit event
            socket.emit("translate_stream", payload);
        },
        [socket],
    );

    // Reset function để clear dữ liệu
    const reset = useCallback(() => {
        setTranslatedText("");
        setIsLoading(false);
        currentRequestRef.current = "";
        isProcessingRef.current = false;
    }, []);

    return {
        translatedText,
        isLoading,
        sendForTranslation,
        reset,
    };
};
