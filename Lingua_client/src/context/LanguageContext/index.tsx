import { createContext } from "react";
// 1. Định nghĩa types
type LanguageCode = string;

interface LanguageContextType {
    sourceLang: LanguageCode;
    targetLang: LanguageCode;
    setSourceLang: (lang: LanguageCode) => void;
    setTargetLang: (lang: LanguageCode) => void;
}

// 2. Tạo Context với default undefined
export const LanguageContext = createContext<LanguageContextType | undefined>(
    undefined,
);
