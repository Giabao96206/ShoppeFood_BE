import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";

import { authSocketMiddleware } from "./middleware/userMessages.middleware";
import { registerMessageEvent } from "./controller/Realtime/message.event";
import { registerReadEvent } from "./controller/Realtime/read.event";
import { registerDisconnectEvent } from "./controller/Realtime/disconnect.event";
import { registerEdit } from "./controller/Realtime/editChat.event";

export const onLineUsers = new Map();

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(authSocketMiddleware);

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;
    socket.join(userId);

    onLineUsers.set(userId, socket.id);

    socket.broadcast.emit("user_online", userId); 

    socket.on("request_online_users", () => {
    const currentOnlineUsers = Array.from(onLineUsers.keys());
    socket.emit("get_online_users", currentOnlineUsers);
  });

    registerMessageEvent(io, socket);
    registerReadEvent(io, socket);
    registerEdit(io, socket);
    registerDisconnectEvent(io, socket, onLineUsers); 
  });

  return io;
};