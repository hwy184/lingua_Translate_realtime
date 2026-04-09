import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    LiveKitRoom,
    RoomAudioRenderer,
    BarVisualizer,
    TrackToggle,
    DisconnectButton,
    useTracks,
    useDataChannel,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { PhoneOff, UserPlus, Check, X, Copy, CheckCircle2, MessageSquare } from "lucide-react";
import { useSocket } from "../context/SocketContext";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Cấu hình kết nối LiveKit
const serverUrl = "ws://localhost:7880";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage {
    id: number;
    type: "transcript" | "translation";
    speaker: string;
    text: string;
    timestamp: Date;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function S2SRoomPage() {
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const socket = useSocket();

    const { token, isHost } = location.state || {};
    const [joinRequest, setJoinRequest] = useState<{ guestSocketId: string; guestName: string } | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!token) { navigate("/"); return; }
        if (isHost && socket) {
            const handleJoinRequest = (data: { guestSocketId: string; guestName: string }) => setJoinRequest(data);
            socket.on("s2s:join_request", handleJoinRequest);
            return () => { socket.off("s2s:join_request", handleJoinRequest); };
        }
    }, [token, navigate, isHost, socket]);

    const handleApprove = () => {
        if (joinRequest && socket) {
            socket.emit("s2s:approve_join", { roomId, guestSocketId: joinRequest.guestSocketId });
            setJoinRequest(null);
        }
    };
    const handleReject = () => {
        if (joinRequest && socket) {
            socket.emit("s2s:reject_join", { guestSocketId: joinRequest.guestSocketId });
            setJoinRequest(null);
        }
    };
    const handleCopyCode = () => {
        if (roomId) { navigator.clipboard.writeText(roomId); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    };

    if (!token) return null;

    return (
        <LiveKitRoom
            video={false} audio={true} token={token} serverUrl={serverUrl}
            data-lk-theme="default"
            style={{ height: "100vh", display: "flex", flexDirection: "column" }}
            onDisconnected={() => navigate("/")}
        >
            <RoomContent
                roomId={roomId}
                isHost={isHost}
                joinRequest={joinRequest}
                copied={copied}
                onCopy={handleCopyCode}
                onApprove={handleApprove}
                onReject={handleReject}
            />
            <RoomAudioRenderer />
        </LiveKitRoom>
    );
}

// ─── Room Content (inside LiveKitRoom context để dùng hooks) ──────────────────
function RoomContent({ roomId, isHost, joinRequest, copied, onCopy, onApprove, onReject }: {
    roomId?: string;
    isHost: boolean;
    joinRequest: { guestSocketId: string; guestName: string } | null;
    copied: boolean;
    onCopy: () => void;
    onApprove: () => void;
    onReject: () => void;
}) {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [showChat, setShowChat] = useState(true);
    const chatBottomRef = useRef<HTMLDivElement>(null);
    const msgIdRef = useRef(0);

    // Nhận data từ Python Agent qua LiveKit data channel
    useDataChannel("lingua_chat", (msg) => {
        try {
            const decoded = new TextDecoder().decode(msg.payload);
            const data = JSON.parse(decoded) as { type: "transcript" | "translation"; speaker: string; text: string };
            const newMsg: ChatMessage = { id: msgIdRef.current++, ...data, timestamp: new Date() };
            setMessages(prev => [...prev, newMsg]);
        } catch (e) { /* ignore */ }
    });

    // Auto-scroll xuống cuối
    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex-1 bg-zinc-950 text-zinc-50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                        Live Conversation
                    </h2>
                    <div className="flex items-center gap-3 mt-1 text-zinc-400 text-sm">
                        <span>Mã phòng:</span>
                        <span className="font-mono text-zinc-100 bg-zinc-800 px-2 py-0.5 rounded text-base tracking-widest font-semibold border border-zinc-700">
                            {roomId}
                        </span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-zinc-800" onClick={onCopy}>
                            {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowChat(v => !v)} className="gap-2 text-zinc-400 hover:text-zinc-100">
                    <MessageSquare className="w-4 h-4" />
                    {showChat ? "Ẩn Chat" : "Hiện Chat"}
                </Button>
            </div>

            {/* Body */}
            <div className="flex-1 flex overflow-hidden">
                {/* Visualizer */}
                <div className="flex-1 flex items-center justify-center relative">
                    <ActiveVoiceVisualizer />

                    {/* Dialog duyệt người dùng */}
                    <Dialog open={!!joinRequest} onOpenChange={() => {}}>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <UserPlus className="w-5 h-5 text-blue-500" /> Yêu cầu tham gia
                                </DialogTitle>
                                <DialogDescription>
                                    Người dùng <strong>{joinRequest?.guestName}</strong> muốn được vào cuộc trò chuyện.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="flex sm:justify-between gap-2 mt-4">
                                <Button variant="outline" className="flex-1" onClick={onReject}>
                                    <X className="w-4 h-4 mr-2" /> Từ chối
                                </Button>
                                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={onApprove}>
                                    <Check className="w-4 h-4 mr-2" /> Chấp nhận
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Chat Panel */}
                {showChat && (
                    <div className="w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col">
                        <div className="px-4 py-3 border-b border-zinc-800 text-sm font-semibold text-zinc-300 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Phiên dịch trực tiếp
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {messages.length === 0 && (
                                <p className="text-center text-zinc-600 text-sm mt-8">Nội dung cuộc trò chuyện sẽ hiện ở đây...</p>
                            )}
                            {messages.map(msg => (
                                <div key={msg.id} className={`rounded-lg px-3 py-2 text-sm ${
                                    msg.type === "transcript"
                                        ? "bg-zinc-800 border border-zinc-700"
                                        : "bg-blue-950 border border-blue-800"
                                }`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`text-xs font-semibold ${msg.type === "translation" ? "text-blue-400" : "text-zinc-400"}`}>
                                            {msg.type === "transcript" ? `🎙️ ${msg.speaker}` : "🔄 Bản dịch"}
                                        </span>
                                        <span className="text-xs text-zinc-600">
                                            {msg.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                    <p className="text-zinc-100 leading-snug">{msg.text}</p>
                                </div>
                            ))}
                            <div ref={chatBottomRef} />
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="p-6 bg-zinc-900 border-t border-zinc-800 flex justify-center gap-6 items-center shrink-0">
                <TrackToggle source={Track.Source.Microphone}
                    className="!bg-zinc-800 hover:!bg-zinc-700 !w-14 !h-14 !rounded-full flex items-center justify-center transition-colors"
                />
                <DisconnectButton
                    className="!bg-red-600 hover:!bg-red-700 !w-14 !h-14 !rounded-full flex items-center justify-center transition-colors shadow-[0_0_15px_rgba(220,38,38,0.3)] text-white"
                >
                    <PhoneOff className="w-5 h-5" />
                </DisconnectButton>
            </div>
        </div>
    );
}

// ─── Voice Visualizer ─────────────────────────────────────────────────────────
function ActiveVoiceVisualizer() {
    const tracks = useTracks([Track.Source.Microphone]);
    return (
        <div className="flex gap-8 items-center justify-center flex-wrap">
            {tracks.map((ref) => (
                <div key={ref.participant.identity} className="flex flex-col items-center gap-4">
                    <div className="w-28 h-28 bg-zinc-800 rounded-full border-4 border-blue-500/20 flex items-center justify-center overflow-hidden relative shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                        <BarVisualizer trackRef={ref} className="h-16 text-blue-400 absolute w-full" style={{ height: "40%" }} />
                    </div>
                    <span className="bg-zinc-800 px-4 py-1.5 rounded-full text-sm font-semibold shadow border border-zinc-700">
                        {ref.participant.name || ref.participant.identity}
                    </span>
                </div>
            ))}
        </div>
    );
}
