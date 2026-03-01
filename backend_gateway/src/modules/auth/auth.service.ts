// src/modules/auth/auth.service.ts
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { query } from "../../config/database.js";
import { env } from "../../config/env.js";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "../../utils/jwt.js";
import type {
    RegisterDTO,
    LoginDTO,
    GoogleLoginDTO,
    AuthResponse,
    UserProfile,
    JwtPayload,
} from "../../types/auth.js";

const SALT_ROUNDS = 10;
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

// ===== Helper: Chuyển row DB → UserProfile =====
const mapRowToProfile = (row: Record<string, unknown>): UserProfile => ({
    id: row["id"] as string,
    email: (row["email"] as string) ?? null,
    displayName: (row["display_name"] as string) ?? null,
    avatarUrl: (row["avatar_url"] as string) ?? null,
    authProvider: row["auth_provider"] as "email" | "google" | "anonymous",
    isAnonymous: row["is_anonymous"] as boolean,
    createdAt: row["created_at"] as Date,
});

// ===== Helper: Tạo token pair =====
const createTokens = (user: UserProfile) => {
    const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        authProvider: user.authProvider,
    };
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
};

// ===== Helper: Lưu Refresh Token vào DB =====
const saveRefreshToken = async (userId: string, token: string) => {
    // Hết hạn sau 7 ngày
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`,
        [userId, token, expiresAt],
    );
};

// ==========================================
// ĐĂNG KÝ BẰNG EMAIL
// ==========================================
export const registerWithEmail = async (dto: RegisterDTO): Promise<AuthResponse> => {
    // Kiểm tra email đã tồn tại chưa
    const existing = await query(`SELECT id FROM users WHERE email = $1`, [dto.email]);
    if (existing.rows.length > 0) {
        throw new Error("Email đã được sử dụng.");
    }

    // Hash mật khẩu
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    // Tạo user mới
    const result = await query(
        `INSERT INTO users (email, password_hash, display_name, auth_provider)
         VALUES ($1, $2, $3, 'email')
         RETURNING *`,
        [dto.email, passwordHash, dto.displayName ?? dto.email.split("@")[0]],
    );

    const user = mapRowToProfile(result.rows[0] as Record<string, unknown>);
    const tokens = createTokens(user);
    await saveRefreshToken(user.id, tokens.refreshToken);

    return { user, ...tokens };
};

// ==========================================
// ĐĂNG NHẬP BẰNG EMAIL
// ==========================================
export const loginWithEmail = async (dto: LoginDTO): Promise<AuthResponse> => {
    const result = await query(`SELECT * FROM users WHERE email = $1 AND auth_provider = 'email'`, [
        dto.email,
    ]);

    if (result.rows.length === 0) {
        throw new Error("Email hoặc mật khẩu không đúng.");
    }

    const row = result.rows[0] as Record<string, unknown>;
    const isValid = await bcrypt.compare(dto.password, row["password_hash"] as string);
    if (!isValid) {
        throw new Error("Email hoặc mật khẩu không đúng.");
    }

    const user = mapRowToProfile(row);
    const tokens = createTokens(user);
    await saveRefreshToken(user.id, tokens.refreshToken);

    return { user, ...tokens };
};

// ==========================================
// ĐĂNG NHẬP BẰNG GOOGLE
// ==========================================
export const loginWithGoogle = async (dto: GoogleLoginDTO): Promise<AuthResponse> => {
    // Verify Google ID Token
    const ticket = await googleClient.verifyIdToken({
        idToken: dto.idToken,
        audience: env.GOOGLE_CLIENT_ID,
    });

    const googlePayload = ticket.getPayload();
    if (!googlePayload) {
        throw new Error("Google token không hợp lệ.");
    }

    const { sub: googleId, email, name, picture } = googlePayload;

    // Kiểm tra user đã tồn tại chưa
    let result = await query(`SELECT * FROM users WHERE google_id = $1`, [googleId]);

    if (result.rows.length === 0) {
        // Tạo user mới từ Google
        result = await query(
            `INSERT INTO users (email, display_name, avatar_url, auth_provider, google_id)
             VALUES ($1, $2, $3, 'google', $4)
             RETURNING *`,
            [email, name, picture, googleId],
        );
    }

    const user = mapRowToProfile(result.rows[0] as Record<string, unknown>);
    const tokens = createTokens(user);
    await saveRefreshToken(user.id, tokens.refreshToken);

    return { user, ...tokens };
};

// ==========================================
// ĐĂNG NHẬP ẨN DANH (ANONYMOUS)
// ==========================================
export const loginAnonymous = async (): Promise<AuthResponse> => {
    const guestName = `Guest_${Date.now().toString(36)}`;

    const result = await query(
        `INSERT INTO users (display_name, auth_provider, is_anonymous)
         VALUES ($1, 'anonymous', TRUE)
         RETURNING *`,
        [guestName],
    );

    const user = mapRowToProfile(result.rows[0] as Record<string, unknown>);
    const tokens = createTokens(user);
    await saveRefreshToken(user.id, tokens.refreshToken);

    return { user, ...tokens };
};

// ==========================================
// REFRESH TOKEN
// ==========================================
export const refreshToken = async (token: string): Promise<{ accessToken: string; refreshToken: string }> => {
    // Verify token
    const payload = verifyRefreshToken(token);

    // Kiểm tra token có trong DB không
    const result = await query(
        `SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()`,
        [token],
    );

    if (result.rows.length === 0) {
        throw new Error("Refresh token không hợp lệ hoặc đã hết hạn.");
    }

    // Xóa token cũ
    await query(`DELETE FROM refresh_tokens WHERE token = $1`, [token]);

    // Tạo token mới
    const newPayload: JwtPayload = {
        userId: payload.userId,
        email: payload.email,
        authProvider: payload.authProvider,
    };

    const accessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);
    await saveRefreshToken(payload.userId, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
};

// ==========================================
// LOGOUT (Xóa refresh token)
// ==========================================
export const logout = async (token: string): Promise<void> => {
    await query(`DELETE FROM refresh_tokens WHERE token = $1`, [token]);
};
