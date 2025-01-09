import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(handle);
  const io = new Server(server, {
    addTrailingSlash: false,
    transports: ["websocket", "polling"],
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
      skipMiddlewares: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-channel", (channelId: string) => {
      console.log(`Socket ${socket.id} joining channel:`, channelId);
      socket.join(channelId);
    });

    socket.on("leave-channel", (channelId: string) => {
      console.log(`Socket ${socket.id} leaving channel:`, channelId);
      socket.leave(channelId);
    });

    socket.on("send-message", (message: any) => {
      console.log("New message:", message);
      // Broadcast to all clients in the channel except sender
      socket.to(message.channelId).emit("new-message", message);
    });

    socket.on("disconnect", (reason) => {
      console.log(`Socket ${socket.id} disconnected:`, reason);
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}); 