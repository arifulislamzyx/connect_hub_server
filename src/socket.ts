import { Server, Socket } from "socket.io";
import prisma from "./config/db.config.js";

interface CustomSocket extends Socket {
  room?: string;
}

export function setupScoket(io: Server) {
  io.use((socket: CustomSocket, next) => {
    //middleware before connect user to verify group chat
    const room = socket.handshake.auth.room || socket.handshake.headers.room;

    if (!room) {
      return next(new Error("Invalid User please pass correct room id"));
    }

    socket.room = room;
    next();
  });
  io.on("connection", (socket: CustomSocket) => {
    //join the room
    socket.join(socket.room);

    console.log("the Socket Connected", socket.id);

    socket.on("message", async (data) => {
      console.log("server Side Socket Message", data);

      await prisma.chats.findMany(data);
      //   socket.broadcast.emit("message", data);

      socket.to(socket.room).emit("message", data);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected", socket.id);
    });
  });
}
