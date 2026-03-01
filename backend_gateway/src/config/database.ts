// src/config/database.ts
import pg from "pg";
import { env } from "./env.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;

const pool = new Pool({
    connectionString: env.DATABASE_URL,
});

// Test kết nối khi khởi động
pool.on("error", (err) => {
    console.error("❌ PostgreSQL pool error:", err);
});

/**
 * Thực thi một câu SQL query
 */
export const query = async (text: string, params?: unknown[]) => {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`📊 Query executed in ${duration}ms — rows: ${result.rowCount}`);
    return result;
};

/**
 * Lấy pool để dùng transaction
 */
export const getPool = () => pool;

/**
 * Khởi tạo database: chạy migration files
 */
export const initDatabase = async () => {
    try {
        // Test kết nối
        const client = await pool.connect();
        console.log("✅ Kết nối PostgreSQL thành công!");
        client.release();

        // Chạy migration
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const migrationPath = path.resolve(__dirname, "../db/migrations/001_init.sql");

        if (fs.existsSync(migrationPath)) {
            const sql = fs.readFileSync(migrationPath, "utf-8");
            await pool.query(sql);
            console.log("✅ Database migration đã chạy thành công!");
        } else {
            console.warn("⚠️ Không tìm thấy file migration:", migrationPath);
        }
    } catch (error) {
        console.error("❌ Lỗi khởi tạo database:", error);
        throw error;
    }
};
