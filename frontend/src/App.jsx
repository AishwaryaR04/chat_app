import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css";

// Connect to your backend (replace with your Railway URL when deployed)
const socket = io("http://10.54.100.49:5000");


function App() {
  const [username, setUsername] = useState("");
  const [inputUsername, setInputUsername] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    // Listen for messages from server
    socket.on("receiveMessage", (data) => {
      setChat((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receiveMessage");
    };
    
  }, []);
  useEffect(() => {
  socket.on("warning", (msg) => {
    alert(msg);
  });
}, []);


  const handleSetUsername = () => {
    if (inputUsername.trim()) {
      setUsername(inputUsername);
      socket.emit("setUsername", inputUsername);
    }
  };

  const sendMessage = () => {
    if (message.trim() && username) {
      socket.emit("sendMessage", message);
      setMessage("");
    }
  };

  return (
    <div className="app">
      {!username ? (
        <div className="username-setup">
          <h2>Enter your name to join the chat</h2>
          <input
            type="text"
            className="username-input"
            placeholder="Your name..."
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
          />
          <button className="username-btn" onClick={handleSetUsername}>
            Join Chat
          </button>
        </div>
      ) : (
        <div className="chat-container">
          <div className="chat-header">
            <span></span> The Chatroom
          </div>

          <div className="chat-box">
            {chat.map((c, i) => (
              <div
                key={i}
                className={`message ${
                  c.username === username ? "sent" : "received"
                }`}
              >
                <strong>{c.username}</strong>
                <span>{c.message}</span>
                <div className="timestamp">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="message-input-area">
            <input
              type="text"
              className="message-input"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button className="send-btn" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
