import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";

import { authSocketMiddleware } from "./middleware/userMessages.middleware";
import { registerMessageEvent } from "./controller/Realtime/message.event";
import { registerReadEvent } from "./controller/Realtime/read.event";
import { registerDisconnectEvent } from "./controller/Realtime/disconnect.event";


export const initializeSocket = (
  httpServer: HttpServer
) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // middleware auth
  io.use(authSocketMiddleware);

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;
    socket.join(userId);
  
    registerMessageEvent(io, socket);
    registerReadEvent(io, socket);
    registerDisconnectEvent(socket);
  });

  return io;
};