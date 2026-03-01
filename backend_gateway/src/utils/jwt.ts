// src/utils/jwt.ts
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";
import type { JwtPayload } from "../types/auth.js";

/**
 * Tạo Access Token (thời hạn ngắn)
 */
export const generateAccessToken = (payload: JwtPayload): string => {
    return jwt.sign({ ...payload }, env.JWT_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    } as SignOptions);
};

/**
 * Tạo Refresh Token (thời hạn dài)
 */
export const generateRefreshToken = (payload: JwtPayload): string => {
    return jwt.sign({ ...payload }, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    } as SignOptions);
};

/**
 * Xác thực Access Token
 */
export const verifyAccessToken = (token: string): JwtPayload => {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};

/**
 * Xác thực Refresh Token
 */
export const verifyRefreshToken = (token: string): JwtPayload => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
};

