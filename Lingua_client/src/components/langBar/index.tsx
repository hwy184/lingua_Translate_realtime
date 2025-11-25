import { GenericDropdown } from "../reUse/GenericDropDown";
import type { DropdownItem } from "../reUse/GenericDropDown";
import { useLanguage } from "../../hooks/useLanguage";
import { getDropdownItems, getButtonContent } from "../../constants/languager";
import type { LanguageCode } from "../../constants/languager";

export function LangBar() {
    const { sourceLang, targetLang, setSourceLang, setTargetLang } =
        useLanguage();

    const handleSourceSelect = (item: DropdownItem<LanguageCode>) => {
        const newLang = item.value;

        if (newLang === targetLang) {
            setSourceLang(targetLang);
            setTargetLang(sourceLang);
        } else {
            setSourceLang(newLang);
        }
    };

    const handleTargetSelect = (item: DropdownItem<LanguageCode>) => {
        const newLang = item.value;

        if (newLang === sourceLang) {
            setTargetLang(sourceLang);
            setSourceLang(targetLang);
        } else {
            setTargetLang(newLang);
        }
    };

    const swapLang = () => {
        const tempLang = sourceLang;

        setSourceLang(targetLang);
        setTargetLang(tempLang);
    };

    // --- Logic JSX Rendering ---
    const sourceItems = getDropdownItems(sourceLang);
    const sourceButtonContent = getButtonContent(sourceLang);

    const targetItems = getDropdownItems(targetLang);
    const targetButtonContent = getButtonContent(targetLang);

    return (
        <div className="flex justify-center p-4 space-x-4">
            {/* Selector cho Ngôn ngữ nguồn (SỬ DỤNG GenericDropdown) */}
            <GenericDropdown<LanguageCode> // Dùng Generics <string>
                buttonContent={sourceButtonContent}
                items={sourceItems}
                onItemSelect={handleSourceSelect} // Xử lý logic hoán đổi
            />

            {/* mũi tên */}
            <button
                className="w-8 h-8 bg-black rounded-lg shadow-md flex items-center justify-center transition-all duration-200 hover:bg-gray-800 hover:scale-105 active:scale-95 focus:outline-none"
                onClick={swapLang}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                    stroke="white"
                    className="w-5 h-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 12h18M15 6l6 6-6 6M9 18L3 12l6-6"
                    />
                </svg>
            </button>



            {/* Selector cho Ngôn ngữ đích (SỬ DỤNG GenericDropdown) */}
            <GenericDropdown<LanguageCode> // Dùng Generics <string>
                buttonContent={targetButtonContent}
                items={targetItems}
                onItemSelect={handleTargetSelect} // Xử lý logic hoán đổi
            />
        </div>
    );
}
