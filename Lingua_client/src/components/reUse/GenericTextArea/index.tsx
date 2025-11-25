import React, { useEffect, useRef } from "react";

interface CustomTextAreaProps {
    value: string;
    onChange: (text: string) => void;
    readOnly?: boolean;
    placeholder?: string;
    loading?: boolean;
    onTimeout?: () => void; // Callback khi timeout
    timeout?: number; // Thời gian timeout (ms), mặc định 30s
}

export function CustomTextArea({
    value,
    onChange,
    readOnly = false,
    placeholder,
    loading,
    onTimeout,
    timeout = 5000,
}: CustomTextAreaProps) {
    const timeoutRef = useRef<number | null>(null);
    const [isTimedOut, setIsTimedOut] = React.useState(false);

    useEffect(() => {
        // Khi bắt đầu loading
        if (loading) {
            setIsTimedOut(false);

            // Set timeout
            timeoutRef.current = setTimeout(() => {
                setIsTimedOut(true);
                console.error("Request timeout - quá thời gian xử lý");

                // Gọi callback nếu có
                if (onTimeout) {
                    onTimeout();
                }
            }, timeout);
        } else {
            // Khi loading kết thúc, clear timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            setIsTimedOut(false);
        }

        // Cleanup khi component unmount
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [loading, timeout, onTimeout]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!readOnly) {
            onChange(event.target.value);
        }
    };

    return (
        <div className="relative w-full h-full">
            <textarea
                className="w-full h-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={value}
                onChange={handleChange}
                readOnly={readOnly}
                placeholder={placeholder}
                disabled={loading}
                style={{ opacity: loading ? 0.5 : 1 }}
            />

            {loading && !isTimedOut && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-50 rounded-md">
                    <div className="w-8 h-8 border-4 border-t-orange-500 border-gray-200 rounded-full animate-spin"></div>
                    <p className="mt-2 text-sm text-gray-600">Đang xử lý...</p>
                </div>
            )}

            {isTimedOut && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 rounded-md">
                    <div className="text-red-500 mb-2">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-red-600 font-semibold">Quá thời gian xử lý</p>
                    <p className="text-sm text-gray-600 mt-1">Vui lòng thử lại</p>
                </div>
            )}
        </div>
    );
}