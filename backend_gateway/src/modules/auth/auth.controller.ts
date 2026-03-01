// src/modules/auth/auth.controller.ts
import type { Request, Response } from "express";
import {
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    loginAnonymous,
    refreshToken,
    logout,
} from "./auth.service.js";
import type { RegisterDTO, LoginDTO, GoogleLoginDTO } from "../../types/auth.js";

/**
 * POST /api/auth/register
 * Đăng ký tài khoản bằng Email
 */
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, displayName } = req.body as RegisterDTO;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Email và mật khẩu là bắt buộc.",
            });
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                success: false,
                message: "Email không đúng định dạng.",
            });
            return;
        }

        // Validate password length
        if (password.length < 6) {
            res.status(400).json({
                success: false,
                message: "Mật khẩu phải có ít nhất 6 ký tự.",
            });
            return;
        }

        const result = await registerWithEmail({ email, password, displayName });
        res.status(201).json({
            success: true,
            message: "Đăng ký thành công!",
            data: result,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Lỗi đăng ký.";
        res.status(400).json({ success: false, message });
    }
};

/**
 * POST /api/auth/login
 * Đăng nhập bằng Email
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body as LoginDTO;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Email và mật khẩu là bắt buộc.",
            });
            return;
        }

        const result = await loginWithEmail({ email, password });
        res.status(200).json({
            success: true,
            message: "Đăng nhập thành công!",
            data: result,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Lỗi đăng nhập.";
        res.status(401).json({ success: false, message });
    }
};

/**
 * POST /api/auth/google
 * Đăng nhập bằng Google
 */
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { idToken } = req.body as GoogleLoginDTO;

        if (!idToken) {
            res.status(400).json({
                success: false,
                message: "Google ID Token là bắt buộc.",
            });
            return;
        }

        const result = await loginWithGoogle({ idToken });
        res.status(200).json({
            success: true,
            message: "Đăng nhập Google thành công!",
            data: result,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Lỗi đăng nhập Google.";
        res.status(401).json({ success: false, message });
    }
};

/**
 * POST /api/auth/anonymous
 * Đăng nhập ẩn danh
 */
export const anonymousLogin = async (_req: Request, res: Response): Promise<void> => {
    try {
        const result = await loginAnonymous();
        res.status(200).json({
            success: true,
            message: "Đăng nhập ẩn danh thành công!",
            data: result,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Lỗi đăng nhập ẩn danh.";
        res.status(500).json({ success: false, message });
    }
};

/**
 * POST /api/auth/refresh
 * Làm mới Access Token
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken: token } = req.body as { refreshToken: string };

        if (!token) {
            res.status(400).json({
                success: false,
                message: "Refresh token là bắt buộc.",
            });
            return;
        }

        const result = await refreshToken(token);
        res.status(200).json({
            success: true,
            message: "Token đã được làm mới!",
            data: result,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Lỗi refresh token.";
        res.status(401).json({ success: false, message });
    }
};

/**
 * POST /api/auth/logout
 * Đăng xuất (xóa refresh token)
 */
export const logoutUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken: token } = req.body as { refreshToken: string };

        if (token) {
            await logout(token);
        }

        res.status(200).json({
            success: true,
            message: "Đăng xuất thành công!",
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Lỗi đăng xuất.";
        res.status(500).json({ success: false, message });
    }
};
