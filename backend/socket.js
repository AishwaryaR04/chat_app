module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    // Listen for messages from this client
    socket.on("send-message", (message) => {
      console.log(`Message received from ${socket.id}: ${message}`);

      // Broadcast to all other clients
      socket.broadcast.emit("receive-message", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
