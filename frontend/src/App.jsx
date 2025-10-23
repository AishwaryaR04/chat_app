import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

useEffect(() => {
  socket.on("receive-message", (msg) => {
    console.log("Message received on frontend:", msg);
    setMessages((prev) => [...prev, { text: msg, fromMe: false }]);
  });

  return () => {
    socket.off("receive-message");
  };
}, []);




  const handleSend = () => {
    if (!message) return;
    // Send message to server
    socket.emit("send-message", message);
    setMessages((prev) => [...prev, { text: message, fromMe: true }]);
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", fontFamily: "sans-serif" }}>
      <h1>React Vite Chat</h1>
      <div
        style={{
          border: "1px solid #ccc",
          padding: 20,
          height: 400,
          overflowY: "auto",
          marginBottom: 10,
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.fromMe ? "right" : "left",
              margin: "5px 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "5px 10px",
                borderRadius: 10,
                backgroundColor: msg.fromMe ? "#a0e1e0" : "#e1e1e1",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Type your message..."
        style={{ width: "80%", padding: 10 }}
      />
      <button onClick={handleSend} style={{ padding: 10 }}>
        Send
      </button>
    </div>
  );
}

export default App;
