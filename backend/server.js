import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // replace with your frontend URL when deployed
    methods: ["GET", "POST"],
  },
});

const users = {}; // store socket.id -> { username, ip }

io.on("connection", (socket) => {
  // get user's IP address
  const ipAddress =
    socket.handshake.headers["x-forwarded-for"] ||
    socket.handshake.address;

  console.log(`🟢 New user connected: ${socket.id} from IP ${ipAddress}`);

  socket.on("setUsername", (username) => {
    users[socket.id] = { username, ip: ipAddress };
    console.log(`👤 ${username} joined from IP ${ipAddress}`);
    printConnectedUsers();
  });

  socket.on("sendMessage", (message) => {
    const user = users[socket.id];
    const username = user ? user.username : "Anonymous";
    console.log(`💬 ${username} (${ipAddress}): ${message}`);
    io.emit("receiveMessage", { username, message });
  });

  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (user) {
      console.log(`🔴 ${user.username} disconnected (${user.ip})`);
      delete users[socket.id];
      printConnectedUsers();
    }
  });
});

function printConnectedUsers() {
  const connectedList = Object.values(users).map(
    (u) => `${u.username} (${u.ip})`
  );
  console.log("👥 Connected users:", connectedList);
}

server.listen(5000, "0.0.0.0", () => {
  console.log("✅ Server running on http://10.54.100.49:5000");
});


