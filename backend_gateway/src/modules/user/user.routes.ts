// src/modules/user/user.routes.ts
import { Router } from "express";
import { getProfile, updateUserProfile } from "./user.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

// GET /api/users/profile — Lấy thông tin profile (cần auth)
router.get("/profile", requireAuth, getProfile);

// PUT /api/users/profile — Cập nhật profile (cần auth)
router.put("/profile", requireAuth, updateUserProfile);

export default router;
