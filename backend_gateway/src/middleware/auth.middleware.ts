// src/middleware/auth.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";

/**
 * Middleware bắt buộc xác thực.
 * Nếu không có token hợp lệ → trả lỗi 401.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({
            success: false,
            message: "Không có token xác thực. Vui lòng đăng nhập.",
        });
        return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        res.status(401).json({
            success: false,
            message: "Token không hợp lệ.",
        });
        return;
    }

    try {
        const payload = verifyAccessToken(token);
        req.user = payload;
        next();
    } catch {
        res.status(401).json({
            success: false,
            message: "Token đã hết hạn hoặc không hợp lệ.",
        });
    }
};

/**
 * Middleware xác thực tùy chọn (optional).
 * Nếu có token hợp lệ → gắn user vào req.
 * Nếu không có token → vẫn cho đi tiếp (anonymous).
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        if (token) {
            try {
                const payload = verifyAccessToken(token);
                req.user = payload;
            } catch {
                // Token không hợp lệ → bỏ qua, cho phép anonymous
            }
        }
    }

    next();
};
