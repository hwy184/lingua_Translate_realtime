// src/modules/user/user.service.ts
import { query } from "../../config/database.js";
import type { UserProfile } from "../../types/auth.js";

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

/**
 * Tìm user theo ID
 */
export const findById = async (id: string): Promise<UserProfile | null> => {
    const result = await query(`SELECT * FROM users WHERE id = $1`, [id]);
    if (result.rows.length === 0) return null;
    return mapRowToProfile(result.rows[0] as Record<string, unknown>);
};

/**
 * Tìm user theo email
 */
export const findByEmail = async (email: string): Promise<UserProfile | null> => {
    const result = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    if (result.rows.length === 0) return null;
    return mapRowToProfile(result.rows[0] as Record<string, unknown>);
};

/**
 * Cập nhật profile user
 */
export const updateProfile = async (
    userId: string,
    data: { displayName?: string | undefined; avatarUrl?: string | undefined },
): Promise<UserProfile | null> => {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.displayName !== undefined) {
        fields.push(`display_name = $${paramIndex++}`);
        values.push(data.displayName);
    }

    if (data.avatarUrl !== undefined) {
        fields.push(`avatar_url = $${paramIndex++}`);
        values.push(data.avatarUrl);
    }

    if (fields.length === 0) {
        return findById(userId);
    }

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    const result = await query(
        `UPDATE users SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
        values,
    );

    if (result.rows.length === 0) return null;
    return mapRowToProfile(result.rows[0] as Record<string, unknown>);
};
