import { useState, useRef } from "react";
import axios from "axios";
import { useLanguage } from "../../../../hooks/useLanguage";

interface SpeechInputProps {
    onTranscriptReady: (text: string) => void;
}

export function SpeechInput({ onTranscriptReady }: SpeechInputProps) {
    const { sourceLang } = useLanguage();
    const [isRecording, setIsRecording] = useState(false);
    const [loading, setLoading] = useState(false);
    const [transcribedText, setTranscribedText] = useState("");
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = handleStop;
            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            // Stop all tracks to release microphone
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleStop = async () => {
        setLoading(true);
        setTranscribedText(""); // Reset text cũ

        const blob = new Blob(chunksRef.current, { type: "audio/wav" });

        // Map language code: Frontend 'vi' -> Backend 'vn'
        const langCode = sourceLang === 'vi' ? 'vn' : sourceLang;

        const formData = new FormData();
        formData.append("file", blob, "recording.wav");
        formData.append("lang", langCode);
        formData.append("requestId", Date.now().toString());

        try {
            const res = await axios.post("http://127.0.0.1:8000/api/transcribe-voice", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data && res.data.text) {
                setTranscribedText(res.data.text);
                onTranscriptReady(res.data.text);
            }
        } catch (err) {
            console.error("Transcription error:", err);
            const errorMsg = "Lỗi nhận diện giọng nói.";
            setTranscribedText(errorMsg);
            onTranscriptReady(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setTranscribedText("");
        onTranscriptReady("");
    };

    return (
        <div className="flex flex-col h-full gap-2">
            {/* Recording Area */}
            <div className={`flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-neutral-600 rounded-xl bg-neutral-800 text-gray-300 ${transcribedText ? 'h-40' : 'h-full'}`}>
                {loading ? (
                    <div className="flex flex-col items-center">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <p>Đang xử lý...</p>
                    </div>
                ) : (
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${isRecording
                                ? "bg-red-600 hover:bg-red-700 animate-pulse"
                                : "bg-indigo-600 hover:bg-indigo-500"
                            }`}
                    >
                        {isRecording ? (
                            <>
                                <span className="w-3 h-3 bg-white rounded-full animate-ping"></span>
                                Dừng Ghi Âm
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                                </svg>
                                Bắt Đầu Nói
                            </>
                        )}
                    </button>
                )}
                {!loading && (
                    <p className="mt-3 text-sm text-neutral-400">
                        {isRecording ? "Đang ghi âm..." : "Nhấn để ghi âm giọng nói"}
                    </p>
                )}
            </div>

            {/* Transcribed Text Display */}
            {transcribedText && (
                <div className="flex-1 bg-neutral-800 border border-neutral-600 rounded-xl p-3 overflow-auto">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-neutral-400 font-semibold">
                            Văn bản đã chuyển đổi:
                        </span>
                        <button
                            onClick={handleClear}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                            Xóa
                        </button>
                    </div>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">
                        {transcribedText}
                    </p>
                </div>
            )}
        </div>
    );
}