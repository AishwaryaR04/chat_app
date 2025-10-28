import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // or your frontend URL when deployed
    methods: ["GET", "POST"]
  }
});

const users = {}; // store socket.id -> username

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("setUsername", (username) => {
    users[socket.id] = username;
    console.log(`${username} joined the chat`);
  });

  socket.on("sendMessage", (message) => {
    const username = users[socket.id] || "Anonymous";
    

    io.emit("receiveMessage", { username, message });
  });

  socket.on("disconnect", () => {
    console.log(`${users[socket.id]} disconnected`);
    delete users[socket.id];
  });
});

server.listen(5000, "0.0.0.0", () => {
  console.log("✅ Server running on http://10.54.100.49:5000");
});
