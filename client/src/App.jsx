import { useState, useEffect, useRef } from 'react'
import './index.css'

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize WebSocket connection
    const socket = new WebSocket('ws://localhost:3001');

    socket.onopen = () => {
      console.log('Connected to server');
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    socket.onclose = () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(socket);

    return () => {
      socket.close();
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
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>Dialogflow Assistant</h1>
        <div className={`status ${isConnected ? 'online' : 'offline'}`}>
          {isConnected ? '● Online' : '○ Offline'}
        </div>
      </header>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {messages.length === 0 && !isConnected && (
          <div className="message bot">Connecting to server...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          disabled={!isConnected}
        />
        <button type="submit" disabled={!inputText.trim() || !isConnected}>
          Send
        </button>
      </form>
    </div>
  )
}

export default App
