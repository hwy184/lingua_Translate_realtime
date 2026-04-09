// src/config/env.ts
import dotenv from "dotenv";
dotenv.config();

export const env = {
    // Database
    DATABASE_URL: process.env["DATABASE_URL"] ?? "postgresql://postgres:postgres@localhost:5432/lingua_db",

    // JWT
    JWT_SECRET: process.env["JWT_SECRET"] ?? "lingua_jwt_secret_default",
    JWT_REFRESH_SECRET: process.env["JWT_REFRESH_SECRET"] ?? "lingua_jwt_refresh_secret_default",
    JWT_ACCESS_EXPIRES_IN: process.env["JWT_ACCESS_EXPIRES_IN"] ?? "15m",
    JWT_REFRESH_EXPIRES_IN: process.env["JWT_REFRESH_EXPIRES_IN"] ?? "7d",

    // Google OAuth
    GOOGLE_CLIENT_ID: process.env["GOOGLE_CLIENT_ID"] ?? "",
    GOOGLE_CLIENT_SECRET: process.env["GOOGLE_CLIENT_SECRET"] ?? "",

    // Server
    PORT: parseInt(process.env["PORT"] ?? "3000", 10),
    PYTHON_API_URL: process.env["PYTHON_API_URL"] ?? "http://127.0.0.1:8000",

    // LiveKit
    LIVEKIT_URL: process.env["LIVEKIT_URL"] ?? "ws://localhost:7880",
    LIVEKIT_API_KEY: process.env["LIVEKIT_API_KEY"] ?? "devkey",
    LIVEKIT_API_SECRET: process.env["LIVEKIT_API_SECRET"] ?? "supersecretkey_1234567890_abcdefgh",
} as const;
