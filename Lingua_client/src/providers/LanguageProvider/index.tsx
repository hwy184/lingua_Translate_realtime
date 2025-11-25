import { useState, type ReactNode } from "react";
import type { LanguageCode } from "../../constants/languager";
import { LanguageContext } from "../../context/LanguageContext";

// 3. Provider Component
export function LanguageProvider({ children }: { children: ReactNode }) {
    const [sourceLang, setSourceLang] = useState<LanguageCode>("vi");
    const [targetLang, setTargetLang] = useState<LanguageCode>("en");

    return (
        <LanguageContext.Provider
            value={{
                sourceLang,
                targetLang,
                setSourceLang,
                setTargetLang,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
}
