import { useState } from "react";
import "./AIAssistant.css";

function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSend = () => {
    if (message.trim() === "") return;

    const newMessage = {
      sender: "user",
      text: message,
    };

    const yoniReply = {
      sender: "assistant",
      text: "Hi! I'm Yoni. Lets plan your next adventure!",
    };

    setMessages([...messages, newMessage, yoniReply]);
    setMessage("");
  };
  console.log("messages: ", messages);

  return (
    <>
      {isOpen && (
        <div className="ai-chat">
          <h3>Yoni - Your Travel Assistant</h3>
          <p>Hi! I am Yoni. How can I help you plan your trip?</p>

          <div className="ai-chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`ai-message ${msg.sender}`}>
                <strong>{msg.sender}:</strong> {msg.text}
              </div>
            ))}
          </div>

          <div className="ai-chat-input">
            <input
              type="text"
              placeholder="Ask Yoni anything ..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}

      <button className="ai-assistant" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "x Close" : "🤖 Yoni"}
      </button>
    </>
  );
}

export default AIAssistant;
