import { CustomTextArea } from "../../../reUse/GenericTextArea";

interface InputTextProps {
    sourceText: string;
    handleSourceChange: (text: string) => void;
}

export function InputText({ sourceText, handleSourceChange }: InputTextProps) {
    return (
        <CustomTextArea
            value={sourceText}
            onChange={handleSourceChange}
            placeholder="Nhập văn bản..."
            readOnly={false}
        />
    );
}
