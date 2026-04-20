import { useState, useEffect, useRef } from 'react'
import './index.css'

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const connectWS = () => {
      const socket = new WebSocket('ws://localhost:3001');

      socket.onopen = () => {
        console.log('Connected to server');
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.text) {
          setMessages((prev) => [...prev, data]);
          setIsTyping(false);
        }
      };

      socket.onclose = () => {
        console.log('Disconnected from server. Retrying...');
        setIsConnected(false);
        setTimeout(connectWS, 3000); // Auto-reconnect
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        socket.close();
      };

      setWs(socket);
    };

    connectWS();

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !ws || !isConnected) return;

    const newMessage = {
      text: inputText,
      sender: 'user'
    };

    setMessages((prev) => [...prev, newMessage]);
    ws.send(JSON.stringify({ text: inputText }));
    setInputText('');
    setIsTyping(true);
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div className="header-info">
          <h1>Dialogflow Bot</h1>
          <p className={`status ${isConnected ? 'online' : 'offline'}`}>
            {isConnected ? '● Service Connected' : '○ Reconnecting...'}
          </p>
        </div>
      </header>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.sender}`}>
            <div className="avatar">
              {msg.sender === 'bot' ? '🤖' : '👤'}
            </div>
            <div className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message-wrapper bot">
            <div className="avatar">🤖</div>
            <div className="message bot typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask me something..."
          disabled={!isConnected}
        />
        <button type="submit" disabled={!inputText.trim() || !isConnected}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
          </svg>
        </button>
      </form>
    </div>
  )
}

export default App
