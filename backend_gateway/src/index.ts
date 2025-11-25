// src/index.t
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import registerSocketHandlers from "./sockets/index.js";

// -- Cài đặt cơ bản --
const app = express();
app.use(cors());
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
const PORT = process.env.PORT || 3000;

registerSocketHandlers(io);

// -- Khởi động Server --
httpServer.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
