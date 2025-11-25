import React, { useRef, useEffect, useState } from "react";
import { GenericButton } from "../GenericButton";

export interface DropdownItem<T> {
    id: string;
    label: string;
    isSelected: boolean;
    value: T;
}

export interface GenericDropdownProps<T> {
    buttonContent: React.ReactNode;
    items: DropdownItem<T>[];
    onItemSelect?: (item: DropdownItem<T>) => void;
}

export function GenericDropdown<T>({
    buttonContent,
    items,
    onItemSelect = () => { },
}: GenericDropdownProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Tự động đóng khi click ngoài
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleClick = (item: DropdownItem<T>) => {
        onItemSelect(item);
        setIsOpen(false);
    };

    return (
        <div ref={ref} className="relative inline-block text-left">
            {/* Nút toggle */}
            <GenericButton
                onClick={() => setIsOpen((prev) => !prev)}
                type="button" // Luôn là một thói quen tốt khi chỉ định type
            >
                {/* 3. Nội dung nút bây giờ là 'children' */}
                {buttonContent}
                <svg
                    className={`w-4 h-4 transform transition-transform ${isOpen ? "rotate-180" : ""
                        }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </GenericButton>

            {/* Menu dropdown */}
            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-40 rounded-xl border border-neutral-700
                     bg-neutral-900 shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                    role="menu"
                >
                    <div className="py-1 max-h-60 overflow-y-auto">
                        {items.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleClick(item)}
                                className={`block w-full text-left px-4 py-2 text-sm rounded-lg
                  ${item.isSelected
                                        ? "text-indigo-400 font-semibold"
                                        : "text-gray-300 hover:bg-neutral-800"
                                    }`}
                                role="menuitem"
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
