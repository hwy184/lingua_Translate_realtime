import { Socket } from "socket.io";
import { AccessToken } from "livekit-server-sdk";
import crypto from "crypto";
import { env } from "../../config/env.js";

// In-memory room store.
// In production, use Redis.
interface S2SRoom {
    roomId: string;
    hostSocketId: string;
    hostName: string;
    guestSocketId?: string;
    guestName?: string;
    createdAt: number;
}

const s2sRooms = new Map<string, S2SRoom>();

const generateRoomCode = () => {
    return crypto.randomBytes(3).toString("hex").toUpperCase(); // 6-char hex
};

const createLiveKitToken = async (roomName: string, participantName: string, identity: string) => {
    const token = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
        identity: identity,
        name: participantName,
    });
    token.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
    });
    return await token.toJwt(); // ← phiên bản mới SDK trả về Promise
};

export default function registerS2SRoomHandler(socket: Socket) {
    // 1. Create a new Room
    socket.on("s2s:create_room", async (data: { hostName: string }) => {
        const roomId = generateRoomCode();
        s2sRooms.set(roomId, {
            roomId,
            hostSocketId: socket.id,
            hostName: data.hostName || "Host",
            createdAt: Date.now(),
        });

        socket.join(`s2s_${roomId}`);

        const token = await createLiveKitToken(roomId, data.hostName || "Host", `host_${socket.id}`);

        socket.emit("s2s:room_created", { roomId, token });
        console.log(`🏠 S2S Room Created: ${roomId} by ${data.hostName}`);
    });

    // 2. Request to Join Room
    socket.on("s2s:request_join", (data: { roomId: string; guestName: string }) => {
        const room = s2sRooms.get(data.roomId);
        if (!room) {
            return socket.emit("s2s:error", { message: "Phòng không tồn tại." });
        }
        if (room.guestSocketId) {
            return socket.emit("s2s:error", { message: "Phòng đã đầy." });
        }

        socket.to(room.hostSocketId).emit("s2s:join_request", {
            guestSocketId: socket.id,
            guestName: data.guestName || "Guest",
        });
        console.log(`🙋 S2S Join Request: ${data.guestName} -> Room ${data.roomId}`);
    });

    // 3. Host Approves Join
    socket.on("s2s:approve_join", async (data: { roomId: string; guestSocketId: string }) => {
        const room = s2sRooms.get(data.roomId);
        if (!room || room.hostSocketId !== socket.id) {
            return socket.emit("s2s:error", { message: "Không có quyền duyệt." });
        }

        room.guestSocketId = data.guestSocketId;

        const token = await createLiveKitToken(data.roomId, "Guest", `guest_${data.guestSocketId}`);

        socket.to(data.guestSocketId).emit("s2s:join_approved", {
            roomId: data.roomId,
            token,
        });
        console.log(`✅ S2S Join Approved for ${data.guestSocketId} in Room ${data.roomId}`);
    });

    // 4. Host Rejects Join
    socket.on("s2s:reject_join", (data: { guestSocketId: string }) => {
        socket.to(data.guestSocketId).emit("s2s:join_rejected", {
            message: "Chủ phòng đã từ chối yêu cầu tham gia.",
        });
    });

    // Disconnect handling to clean up (simplified)
    socket.on("disconnect", () => {
        // In a real app we might clean up rooms if host disconnects
        for (const [roomId, room] of s2sRooms.entries()) {
            if (room.hostSocketId === socket.id) {
                // Host left, room closed
                socket.to(`s2s_${roomId}`).emit("s2s:room_closed");
                s2sRooms.delete(roomId);
            }
        }
    });
}
