import { useState, useEffect, useRef } from 'react'
import './index.css'

function App() {
  const [messages, setMessages] = useState([
    { text: "Welcome to the Dialogflow Assistant! How can I help you today?", sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
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
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.text) {
          const receivedMessage = {
            ...data,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages((prev) => [...prev, receivedMessage]);
          setIsTyping(false);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        setTimeout(connectWS, 3000);
      };

      socket.onerror = () => {
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
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMessage]);
    ws.send(JSON.stringify({ text: inputText }));
    setInputText('');
    setIsTyping(true);
  };

  return (
    <div className="whatsapp-container">
      {/* Header */}
      <header className="whatsapp-header">
        <div className="header-left">
          <div className="header-avatar">🤖</div>
          <div className="header-info">
            <span className="bot-name">Dialogflow Assistant</span>
            <span className={`status ${isConnected ? 'online' : 'offline'}`}>
              {isConnected ? 'online' : 'reconnecting...'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="whatsapp-chat-area">
        <div className="message-list">
          {messages.map((msg, index) => (
            <div key={index} className={`message-bubble-wrapper ${msg.sender}`}>
              <div className={`message-bubble ${msg.sender}`}>
                <div className="message-content">{msg.text}</div>
                <div className="message-meta">
                  <span className="message-time">{msg.time}</span>
                  {msg.sender === 'user' && (
                    <span className="message-status">✓✓</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message-bubble-wrapper bot">
              <div className="message-bubble bot typing">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <form className="whatsapp-input-area" onSubmit={handleSend}>
        <div className="input-field-container">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message"
            disabled={!isConnected}
          />
        </div>
        <button type="submit" className="send-btn" disabled={!inputText.trim() || !isConnected}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path>
          </svg>
        </button>
      </form>
    </div>
  )
}

export default App
