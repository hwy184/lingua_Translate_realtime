import React, { useState } from "react";
import axios from "axios";

interface ImageInputProps {
    onTextExtracted: (text: string) => void;
}

export function ImageInput({ onTextExtracted }: ImageInputProps) {
    const [fileName, setFileName] = useState("Chưa chọn ảnh");
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setPreview(URL.createObjectURL(file));
        setLoading(true);

        try {
            const form = new FormData();
            form.append("file", file);
            form.append("requestId", Date.now().toString());

            // Gọi API OCR của Python Service
            const res = await axios.post(
                "http://127.0.0.1:8000/api/ocr",
                form,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                },
            );

            if (res.data && res.data.text) {
                onTextExtracted(res.data.text);
            } else {
                onTextExtracted("");
            }
        } catch (err) {
            console.error("Lỗi OCR:", err);
            onTextExtracted("Lỗi khi nhận diện văn bản từ ảnh.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full
         h-full p-2 border-2 border-dashed border-neutral-600 rounded-xl
          bg-neutral-800 text-gray-300 relative overflow-hidden">
            <input
                type="file"
                id="image-upload"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
            />

            {preview ? (
                <div className="relative w-full h-full flex flex-col items-center">
                    <img src={preview} alt="Preview" className="h-24 object-contain mb-2" />
                    <label
                        htmlFor="image-upload"
                        className="cursor-pointer text-xs px-3 py-1 rounded bg-neutral-700 hover:bg-neutral-600 transition-colors"
                    >
                        {loading ? "Đang xử lý..." : "Chọn ảnh khác"}
                    </label>
                </div>
            ) : (
                <>
                    <label
                        htmlFor="image-upload"
                        className="cursor-pointer px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                    >
                        {loading ? "Đang xử lý..." : "Tải lên ảnh"}
                    </label>
                    <p className="mt-2 text-sm text-neutral-400">{fileName}</p>
                </>
            )}
        </div>
    );
}
