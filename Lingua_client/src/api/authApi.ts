// src/api/authApi.ts
import axios from "axios";

const API_BASE = "http://localhost:3000/api";

const api = axios.create({
    baseURL: API_BASE,
    headers: { "Content-Type": "application/json" },
});

// === Auth ===

export const registerUser = (email: string, password: string, displayName: string) =>
    api.post("/auth/register", { email, password, displayName });

export const loginUser = (email: string, password: string) =>
    api.post("/auth/login", { email, password });

export const loginAnonymous = () =>
    api.post("/auth/anonymous");

export const loginGoogle = (idToken: string) =>
    api.post("/auth/google", { idToken });

export const refreshToken = (refreshToken: string) =>
    api.post("/auth/refresh", { refreshToken });

export const logoutUser = (refreshToken: string) =>
    api.post("/auth/logout", { refreshToken });

// === User ===

export const getProfile = (accessToken: string) =>
    api.get("/users/profile", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

export const updateProfile = (accessToken: string, data: { displayName?: string; avatarUrl?: string }) =>
    api.put("/users/profile", data, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
