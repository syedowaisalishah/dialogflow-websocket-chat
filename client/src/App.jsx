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
        setIsTyping(false); // always clear typing indicator on any response
        if (data.text) {
          const receivedMessage = {
            ...data,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages((prev) => [...prev, receivedMessage]);
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

  const formatMessage = (text) => {
    if (!text) return '';
    // Replace *bold* with <strong>bold</strong>
    const formatted = text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
    return formatted;
  };

  const DoubleCheckIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.5 12.5L5.5 16.5L14.5 7.5" stroke="#53BDEB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 12.5L12 16.5L22.5 6" stroke="#53BDEB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

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
        <div className="header-right">
          <button className="icon-btn">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M15.9 14.3H15l-.3-.3c1-1.1 1.6-2.6 1.6-4.2 0-3.7-3-6.7-6.7-6.7S3 6 3 9.7s3 6.7 6.7 6.7c1.6 0 3.1-.6 4.2-1.6l.3.3v.9l6 6 1.8-1.8-1.8-1.8-6-6zm-6.2 0c-2.6 0-4.6-2.1-4.6-4.6s2.1-4.6 4.6-4.6 4.6 2.1 4.6 4.6-2 4.6-4.6 4.6z"></path>
            </svg>
          </button>
          <button className="icon-btn">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"></path>
            </svg>
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="whatsapp-chat-area">
        <div className="message-list">
          {messages.map((msg, index) => (
            <div key={index} className={`message-bubble-wrapper ${msg.sender}`}>
              <div className={`message-bubble ${msg.sender}`}>
                <div
                  className="message-content"
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                />
                <div className="message-meta">
                  <span className="message-time">{msg.time}</span>
                  {msg.sender === 'user' && (
                    <span className="message-status">
                      <DoubleCheckIcon />
                    </span>
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
