// src/pages/AuthTestPage.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { loginGoogle, logoutUser } from "../api/authApi";

// Google Identity Services types
declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: {
                        client_id: string;
                        callback: (response: { credential: string }) => void;
                    }) => void;
                    renderButton: (
                        element: HTMLElement,
                        config: {
                            theme?: string;
                            size?: string;
                            text?: string;
                            width?: number;
                        },
                    ) => void;
                };
            };
        };
    }
}

export default function AuthTestPage() {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(null);
    const [user, setUser] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const googleBtnRef = useRef<HTMLDivElement>(null);

    // ================== GOOGLE SIGN-IN ==================

    const handleGoogleCallback = useCallback(async (response: { credential: string }) => {
        setLoading(true);
        setMessage("");
        try {
            const res = await loginGoogle(response.credential);
            const data = res.data.data;
            setAccessToken(data.accessToken);
            setRefreshTokenValue(data.refreshToken);
            setUser(data.user);
            setMessage("✅ Đăng nhập Google thành công!");
        } catch {
            setMessage("❌ Đăng nhập Google thất bại.");
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;
        if (!GOOGLE_CLIENT_ID) return;

        const initGoogle = () => {
            if (window.google && googleBtnRef.current) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleCallback,
                });
                window.google.accounts.id.renderButton(googleBtnRef.current, {
                    theme: "filled_black",
                    size: "large",
                    text: "signin_with",
                    width: 350,
                });
            }
        };

        const interval = setInterval(() => {
            if (window.google) {
                initGoogle();
                clearInterval(interval);
            }
        }, 200);

        return () => clearInterval(interval);
    }, [handleGoogleCallback]);

    // ================== LOGOUT ==================

    const handleLogout = async () => {
        setLoading(true);
        try {
            if (refreshTokenValue) {
                await logoutUser(refreshTokenValue);
            }
            setAccessToken(null);
            setRefreshTokenValue(null);
            setUser(null);
            setMessage("✅ Đã đăng xuất.");
        } catch {
            setMessage("❌ Đăng xuất thất bại.");
        }
        setLoading(false);
    };

    // ================== RENDER ==================

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 w-full max-w-md text-center space-y-6">

                <h1 className="text-2xl font-bold text-orange-400">🔐 Lingua Auth</h1>

                {!user ? (
                    <>
                        <p className="text-gray-400">Đăng nhập bằng Google để tiếp tục</p>
                        <div ref={googleBtnRef} className="flex justify-center"></div>
                    </>
                ) : (
                    <>
                        <div className="bg-green-900/30 border border-green-700 rounded-xl p-4">
                            <img
                                src={user.avatarUrl as string}
                                alt="avatar"
                                className="w-16 h-16 rounded-full mx-auto mb-3"
                            />
                            <p className="text-lg font-semibold text-white">{user.displayName as string}</p>
                            <p className="text-sm text-gray-400">{user.email as string}</p>
                        </div>

                        <button
                            onClick={handleLogout}
                            disabled={loading}
                            className="w-full py-2 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 rounded-lg font-semibold transition-colors cursor-pointer"
                        >
                            🚪 Đăng xuất
                        </button>
                    </>
                )}

                {message && (
                    <p className={`text-sm ${message.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>
                        {message}
                    </p>
                )}

                {loading && <p className="text-gray-500 text-sm">Đang xử lý...</p>}
            </div>
        </div>
    );
}
