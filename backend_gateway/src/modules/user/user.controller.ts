// src/modules/user/user.controller.ts
import type { Request, Response } from "express";
import { findById, updateProfile } from "./user.service.js";

/**
 * GET /api/users/profile
 * Lấy thông tin profile của user đang đăng nhập
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Chưa xác thực.",
            });
            return;
        }

        const user = await findById(userId);

        if (!user) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng.",
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Lỗi lấy profile.";
        res.status(500).json({ success: false, message });
    }
};

/**
 * PUT /api/users/profile
 * Cập nhật thông tin profile
 */
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Chưa xác thực.",
            });
            return;
        }

        const { displayName, avatarUrl } = req.body as {
            displayName?: string;
            avatarUrl?: string;
        };

        const user = await updateProfile(userId, { displayName, avatarUrl });

        if (!user) {
            res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng.",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Cập nhật profile thành công!",
            data: user,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Lỗi cập nhật profile.";
        res.status(500).json({ success: false, message });
    }
};
