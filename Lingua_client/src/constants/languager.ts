import type { DropdownItem } from "../components/reUse/GenericDropDown";

export type LanguageCode = string;

const ALL_LANGUAGES: DropdownItem<LanguageCode>[] = [
    { id: "vi", label: "Việt", value: "vi", isSelected: false },
    { id: "en", label: "Anh", value: "en", isSelected: false },
];

// Hàm Helper: Chuẩn bị dữ liệu cho Dropdown (thêm cờ isSelected)
const getDropdownItems = (
    currentSelectedCode: LanguageCode,
): DropdownItem<LanguageCode>[] => {
    return ALL_LANGUAGES.map((lang: DropdownItem<LanguageCode>) => ({
        ...lang,
        // Thêm logic: Mục này có đang được chọn không?
        isSelected: lang.value === currentSelectedCode,
    }));
};

// Hàm Helper: Tìm tên hiển thị cho buttonContent
const getButtonContent = (code: LanguageCode) => {
    return (
        ALL_LANGUAGES.find(
            (lang: DropdownItem<LanguageCode>) => lang.value === code,
        )?.label || "Chọn Ngôn Ngữ"
    );
};

export { getButtonContent, getDropdownItems };
