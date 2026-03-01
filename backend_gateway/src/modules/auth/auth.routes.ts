// src/modules/auth/auth.routes.ts
import { Router } from "express";
import {
    register,
    login,
    googleLogin,
    anonymousLogin,
    refresh,
    logoutUser,
} from "./auth.controller.js";

const router = Router();

// POST /api/auth/register — Đăng ký bằng Email
router.post("/register", register);

// POST /api/auth/login — Đăng nhập bằng Email
router.post("/login", login);

// POST /api/auth/google — Đăng nhập bằng Google
router.post("/google", googleLogin);

// POST /api/auth/anonymous — Đăng nhập ẩn danh
router.post("/anonymous", anonymousLogin);

// POST /api/auth/refresh — Làm mới token
router.post("/refresh", refresh);

// POST /api/auth/logout — Đăng xuất
router.post("/logout", logoutUser);

export default router;
