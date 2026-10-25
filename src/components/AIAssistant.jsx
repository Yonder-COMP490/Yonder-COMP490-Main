import { useState } from "react";
import "./AIAssistant.css";

function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <>
      {isOpen && (
        <div className="ai-chat">
          <h3>Yoni - Your Travel Assistant</h3>
          <p>Hi! I am Yoni. How can I help you plan your trip?</p>
          <div className="ai-chat-input">
            <input
              type="text"
              placeholder="Ask Yoni anything ..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button>Send</button>
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
