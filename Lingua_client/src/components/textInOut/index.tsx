import { useState, useEffect } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { useTranslate } from "../../hooks/useTranslate";
import { useLanguage } from "../../hooks/useLanguage";
import { InputText } from "./inputType/inputText";
import { FileInput } from "./inputType/FileInput";
import { SpeechInput } from "./inputType/SpeechInput";
// import { ImageInput } from "./inputType/ImageInput";
import { GenericButton } from "../reUse/GenericButton";
import { CustomTextArea } from "../reUse/GenericTextArea";

export function TextInOut() {
    const [sourceText, setSourceText] = useState("");
    const { sourceLang, targetLang } = useLanguage();
    const debouncedSourceText = useDebounce(sourceText, 1500);

    const { translatedText, isLoading, sendForTranslation } = useTranslate();

    type InputMode = "text" | "file" | "speech";
    const [inputMode, setInputMode] = useState<InputMode>("text");

    // Khi text thay đổi (do user nhập hoặc do OCR / Speech)
    const handleSourceChange = (text: string) => {
        setSourceText(text);
    };

    useEffect(() => {
        if (!debouncedSourceText.trim()) return;
        sendForTranslation({
            text: debouncedSourceText,
            src_lang: sourceLang,
            target_lang: targetLang,
        });
    }, [debouncedSourceText, sourceLang, targetLang, sendForTranslation]);

    // Render các loại input
    const renderInput = () => {
        switch (inputMode) {
            case "file":
                return <FileInput onTextExtracted={handleSourceChange} />;
            case "speech":
                return <SpeechInput onTranscriptReady={handleSourceChange} />;
            case "text":
            default:
                return (
                    <InputText
                        sourceText={sourceText}
                        handleSourceChange={handleSourceChange}
                    />
                );
        }
    };

    return (
        <div className="grid grid-cols-2 gap-4 m-2 p-2 h-[500px]">

            {/* LEFT */}
            <div className="flex flex-col h-full">

                {/* Buttons */}
                <div className="flex gap-2 mb-2">
                    {["text", "file", "speech"].map((mode) => (
                        <GenericButton
                            key={mode}
                            onClick={() => setInputMode(mode as InputMode)}
                            className={`
              px-4 py-1 rounded-md text-sm 
              ${inputMode === mode ? "bg-indigo-600 text-white" : "bg-gray-200"}
            `}
                        >
                            {mode[0].toUpperCase() + mode.slice(1)}
                        </GenericButton>
                    ))}
                </div>

                {/* Input box */}
                <div className="flex-1 border rounded-lg p-2 bg-white shadow-sm">
                    <div className="h-full">{renderInput()}</div>
                </div>

            </div>

            {/* RIGHT (OUTPUT) */}
            <div className="flex flex-col h-full">
                <div className="flex gap-2 mb-2 opacity-0 pointer-events-none">
                    {["text", "file", "speech"].map((mode) => (
                        <GenericButton
                            key={mode}
                            onClick={() => setInputMode(mode as InputMode)}
                            className={`
              px-4 py-1 rounded-md text-sm 
              ${inputMode === mode ? "bg-indigo-600 text-white" : "bg-gray-200"}
            `}
                        >
                            {mode[0].toUpperCase() + mode.slice(1)}
                        </GenericButton>
                    ))}
                </div>

                <div className="flex-1 border rounded-lg p-2 bg-white shadow-sm">
                    <CustomTextArea
                        value={translatedText}
                        onChange={() => { }}
                        placeholder="Kết quả dịch..."
                        readOnly
                        loading={isLoading}
                    />
                </div>

            </div>

        </div>
    );

}
