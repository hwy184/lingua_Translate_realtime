// src/types/auth.ts

export interface RegisterDTO {
    email: string;
    password: string;
    displayName?: string | undefined;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface GoogleLoginDTO {
    idToken: string;
}

export interface AuthResponse {
    user: UserProfile;
    accessToken: string;
    refreshToken: string;
}

export interface UserProfile {
    id: string;
    email: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    authProvider: "email" | "google" | "anonymous";
    isAnonymous: boolean;
    createdAt: Date;
}

export interface JwtPayload {
    userId: string;
    email: string | null;
    authProvider: string;
}

export interface RefreshTokenDTO {
    refreshToken: string;
}

// Extend Express Request để thêm user
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}
