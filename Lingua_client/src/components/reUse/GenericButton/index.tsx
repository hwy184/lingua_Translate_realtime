// file: components/reUse/GenericButton.tsx
import React, { forwardRef } from "react";

type GenericButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    // Chúng ta có thể thêm các props tùy chỉnh ở đây nếu cần,
    // nhưng hiện tại chỉ cần props gốc là đủ.
    // 'children' và 'className' đã có sẵn trong React.ButtonHTMLAttributes
};

// Sử dụng forwardRef để có thể truyền 'ref' vào nếu cần
export const GenericButton = forwardRef<HTMLButtonElement, GenericButtonProps>(
    ({ className, children, ...props }, ref) => {
        // Đây là style gốc, chung cho tất cả các nút
        const baseStyles = `
            inline-flex items-center justify-between gap-2 w-32 px-3 py-2
            rounded-xl border border-neutral-700 bg-neutral-900 text-sm
            text-gray-200 hover:bg-neutral-800 transition-colors duration-150
        `;

        return (
            <button
                ref={ref}
                // Gộp 'baseStyles' với bất kỳ 'className' nào được truyền từ bên ngoài
                className={`${baseStyles} ${className || ""}`}
                {...props} // Truyền tất cả các props khác (như onClick, type, disabled...)
            >
                {children} {/* Nội dung bên trong nút */}
            </button>
        );
    },
);

GenericButton.displayName = "GenericButton"; // Tốt cho debugging
