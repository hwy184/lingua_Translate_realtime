import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Users, Loader2 } from "lucide-react";
import { useSocket } from "../context/SocketContext";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function S2SHomePage() {
    const navigate = useNavigate();
    const socket = useSocket();

    const [isJoining, setIsJoining] = useState(false);
    
    // Auth context mock: Get from local storage if exists, else empty
    const [name, setName] = useState(() => {
        try {
            const userStr = localStorage.getItem("lingua_user");
            if (userStr) {
                const user = JSON.parse(userStr);
                return user.displayName || "";
            }
        } catch(e) {}
        return "";
    });

    const [roomCode, setRoomCode] = useState("");

    const [waitingForHost, setWaitingForHost] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!socket) return;

        const handleRoomCreated = (data: { roomId: string; token: string }) => {
            navigate(`/s2s/room/${data.roomId}`, { state: { token: data.token, isHost: true } });
        };

        const handleJoinApproved = (data: { roomId: string; token: string }) => {
            setWaitingForHost(false);
            navigate(`/s2s/room/${data.roomId}`, { state: { token: data.token, isHost: false } });
        };

        const handleJoinRejected = (data: { message: string }) => {
            setWaitingForHost(false);
            setErrorMsg(data.message || "Bị từ chối");
        };

        const handleError = (data: { message: string }) => {
            setWaitingForHost(false);
            setErrorMsg(data.message);
        };

        socket.on("s2s:room_created", handleRoomCreated);
        socket.on("s2s:join_approved", handleJoinApproved);
        socket.on("s2s:join_rejected", handleJoinRejected);
        socket.on("s2s:error", handleError);

        return () => {
            socket.off("s2s:room_created", handleRoomCreated);
            socket.off("s2s:join_approved", handleJoinApproved);
            socket.off("s2s:join_rejected", handleJoinRejected);
            socket.off("s2s:error", handleError);
        };
    }, [socket, navigate]);

    const handleCreateRoom = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        if (!name) return setErrorMsg("Vui lòng nhập tên");
        socket.emit("s2s:create_room", { hostName: name });
    };

    const handleJoinRoom = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        if (!name) return setErrorMsg("Vui lòng nhập tên");
        if (!roomCode) return setErrorMsg("Vui lòng nhập mã phòng");
        
        socket.emit("s2s:request_join", { roomId: roomCode, guestName: name });
        setWaitingForHost(true);
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full shadow-lg border-0 shadow-zinc-200">
                <div className="bg-zinc-900 rounded-t-xl p-8 text-center text-white">
                    <Mic className="w-16 h-16 mx-auto mb-4 text-zinc-300" />
                    <CardTitle className="text-3xl font-bold tracking-tight">Lingua S2S</CardTitle>
                    <CardDescription className="mt-2 text-zinc-400">Dịch thuật thời gian thực bằng dọng nói</CardDescription>
                </div>

                <CardContent className="p-8">
                    {errorMsg && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                            {errorMsg}
                        </div>
                    )}

                    {waitingForHost ? (
                        <div className="text-center py-8">
                            <Loader2 className="w-12 h-12 text-zinc-900 animate-spin mx-auto mb-4" />
                            <h3 className="text-xl font-semibold">Đang chờ duyệt...</h3>
                            <p className="text-zinc-500 mt-2 text-sm">Chủ phòng đang xem xét yêu cầu tham gia của bạn</p>
                            <Button
                                variant="link"
                                onClick={() => setWaitingForHost(false)}
                                className="mt-6 text-red-600 hover:text-red-800"
                            >
                                Hủy yêu cầu
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Tên hiển thị</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Tên của bạn (Ẩn danh hoặc Đăng nhập)"
                                    className="h-12"
                                />
                                <p className="text-xs text-zinc-500">Người dùng đã đăng nhập sẽ được tự động điền Tên.</p>
                            </div>

                            <div className="flex gap-2 p-1 bg-zinc-100 rounded-lg">
                                <Button
                                    type="button"
                                    variant={!isJoining ? "default" : "ghost"}
                                    onClick={() => setIsJoining(false)}
                                    className="flex-1"
                                >
                                    Tạo phòng mới
                                </Button>
                                <Button
                                    type="button"
                                    variant={isJoining ? "default" : "ghost"}
                                    onClick={() => setIsJoining(true)}
                                    className="flex-1 text-zinc-600 hover:text-zinc-900"
                                >
                                    Tham gia phòng
                                </Button>
                            </div>

                            {isJoining ? (
                                <form onSubmit={handleJoinRoom} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="roomCode">Mã phòng</Label>
                                        <Input
                                            id="roomCode"
                                            type="text"
                                            value={roomCode}
                                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                            placeholder="XXXXXX"
                                            className="font-mono h-12 uppercase"
                                            maxLength={6}
                                        />
                                    </div>
                                    <Button type="submit" size="lg" className="w-full">
                                        Gửi yêu cầu tham gia
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={handleCreateRoom}>
                                    <Button type="submit" size="lg" className="w-full flex items-center justify-center gap-2">
                                        <Users className="w-5 h-5" /> Tạo phòng bằng Code
                                    </Button>
                                </form>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
