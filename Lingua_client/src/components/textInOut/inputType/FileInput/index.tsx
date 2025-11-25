import React, { useState } from "react";
import axios from "axios";

interface FileInputProps {
    onTextExtracted: (text: string) => void;
}

import { useLanguage } from "../../../../hooks/useLanguage";

export function FileInput({ onTextExtracted }: FileInputProps) {
    const { sourceLang } = useLanguage();
    const [fileName, setFileName] = useState("Chưa chọn file (docx, image, audio)");
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [extractedText, setExtractedText] = useState("");

    const processFile = async (file: File) => {
        setFileName(file.name);
        setLoading(true);
        setExtractedText(""); // Reset text cũ

        try {
            const form = new FormData();
            form.append("file", file);

            let url = "";
            // Add requestId for all requests
            form.append("requestId", Date.now().toString());

            if (file.type.startsWith("image/")) {
                url = "http://127.0.0.1:8000/api/ocr";
            } else if (file.type.startsWith("audio/")) {
                url = "http://127.0.0.1:8000/api/transcribe-voice";
                // Map language code: Frontend 'vi' -> Backend 'vn'
                const langCode = sourceLang === 'vi' ? 'vn' : sourceLang;
                form.append("lang", langCode);
            } else if (
                file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                file.name.endsWith(".docx")
            ) {
                url = "http://127.0.0.1:8000/api/read_docx";
            } else {
                throw new Error("Định dạng file không được hỗ trợ (chỉ hỗ trợ ảnh, âm thanh, docx).");
            }

            const res = await axios.post(url, form, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            let text = "";
            if (res.data) {
                if (typeof res.data.text === 'string') {
                    text = res.data.text;
                } else if (Array.isArray(res.data.text)) {
                    text = res.data.text.join('\n');
                } else if (res.data.originalText) {
                    text = res.data.originalText;
                }
            }

            // Ensure text is a string to prevent crashes
            const safeText = String(text || "");
            setExtractedText(safeText);
            onTextExtracted(safeText);
        } catch (err) {
            console.error("Lỗi gửi file:", err);
            const errorMsg = "Lỗi xử lý file.";
            setExtractedText(errorMsg);
            onTextExtracted(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await processFile(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        await processFile(file);
    };

    return (
        <div className="flex flex-col h-full gap-2">
            {/* Upload Area */}
            <div
                className={`flex flex-col items-center justify-center w-full
                    p-4 border-2 border-dashed rounded-xl transition-all
                    ${isDragging
                        ? "border-indigo-500 bg-indigo-900/30"
                        : "border-neutral-600 bg-neutral-800"
                    } text-gray-300 ${extractedText ? 'h-32' : 'h-full'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".txt,.pdf,.docx,image/*,.jpg,.jpeg,.png,.gif,.bmp,audio/*"
                />
                <label
                    htmlFor="file-upload"
                    className="cursor-pointer px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                >
                    {loading ? "Đang xử lý..." : "Tải lên file"}
                </label>
                <p className="mt-3 text-sm text-neutral-400">
                    {isDragging ? "Thả file vào đây" : fileName}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                    Hoặc kéo thả file vào đây
                </p>
            </div>

            {/* Extracted Text Display */}
            {extractedText && (
                <div className="flex-1 bg-neutral-800 border border-neutral-600 rounded-xl p-3 overflow-auto">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-neutral-400 font-semibold">
                            Nội dung đã trích xuất:
                        </span>
                        <button
                            onClick={() => {
                                setExtractedText("");
                                setFileName("Chưa chọn file (docx, image, audio)");
                                onTextExtracted("");
                            }}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                            Xóa
                        </button>
                    </div>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">
                        {extractedText}
                    </p>
                </div>
            )}
        </div>
    );
}