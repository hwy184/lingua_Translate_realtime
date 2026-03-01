// src/index.ts
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import registerSocketHandlers from "./sockets/index.js";

// -- Config --
import { env } from "./config/env.js";
import { initDatabase } from "./config/database.js";

// -- Routes --
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";

// -- Cài đặt cơ bản --
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// -- REST API Routes --
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// -- Health Check --
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// -- Socket.io Handlers --
registerSocketHandlers(io);

// -- Khởi động Server --
const startServer = async () => {
    try {
        // Khởi tạo Database
        await initDatabase();

        httpServer.listen(env.PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${env.PORT}`);
            console.log(`📡 REST API: http://localhost:${env.PORT}/api`);
            console.log(`🔌 WebSocket: ws://localhost:${env.PORT}`);
        });
    } catch (error) {
        console.error("❌ Không thể khởi động server:", error);
        process.exit(1);
    }
};

startServer();
