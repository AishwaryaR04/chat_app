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

const users = {}; // socket.id → { username, ip }
const messageRate = {}; // ip → [timestamps of messages]
const suspiciousIPs = new Set(); // store flagged IPs

// IDS configuration
const MAX_MESSAGES = 5; // max messages allowed
const TIME_WINDOW = 5000; // in ms (5 seconds)

io.on("connection", (socket) => {
  // get IP address
  const ipAddress =
    socket.handshake.headers["x-forwarded-for"] ||
    socket.handshake.address;

  console.log(`🟢 New user connected: ${socket.id} from IP ${ipAddress}`);

  socket.on("setUsername", (username) => {
    users[socket.id] = { username, ip: ipAddress };
    console.log(`👤 ${username} joined from IP ${ipAddress}`);
    printConnectedUsers();
  });

  // handle message sending
  socket.on("sendMessage", (message) => {
    const user = users[socket.id];
    const username = user ? user.username : "Anonymous";

    // 🧩 IDS: rate-limiting logic
    const now = Date.now();
    if (!messageRate[ipAddress]) messageRate[ipAddress] = [];
    messageRate[ipAddress] = messageRate[ipAddress].filter(
      (t) => now - t < TIME_WINDOW
    );
    messageRate[ipAddress].push(now);

    if (messageRate[ipAddress].length > MAX_MESSAGES) {
      console.log(`🚨 [IDS ALERT] Possible spam from IP: ${ipAddress} (${username})`);
      suspiciousIPs.add(ipAddress);
      socket.emit("warning", "⚠️ You are sending messages too quickly!");
      return;
    }

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

// helper to print active users
function printConnectedUsers() {
  const connectedList = Object.values(users).map(
    (u) => `${u.username} (${u.ip})`
  );
  console.log("👥 Connected users:", connectedList);
}

server.listen(5000, "0.0.0.0", () => {
  console.log("✅ Server running on http://10.54.100.49:5000");
});
