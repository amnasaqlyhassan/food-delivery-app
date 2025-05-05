import React, { useState, useRef, useEffect } from "react";
import "../styles/navbar.css";
import { X } from "lucide-react";
import { chatbotRoute } from "../constant";

const ChatWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! Ask me anything about food on campus 🍽️" },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const question = input.trim();
    if (!question) return;

    setMessages((prev) => [...prev, { sender: "user", text: question }]);
    setInput("");

    try {
      const res = await fetch(chatbotRoute, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.response || "Hmm, I’m not sure." },
      ]);
    } catch (err) {
      console.error("Chatbot fetch error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Something went wrong. Try again later." },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <span>Chat with BiTEBot</span>
        <button className="chat-close" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="chat-body">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-message ${msg.sender === "user" ? "user" : "bot"}`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="send-container">
        <input
          type="text"
          placeholder="Ask a question..."
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="send-button" onClick={handleSend}>
          Enter
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;

