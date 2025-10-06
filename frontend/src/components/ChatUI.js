import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export default function ChatUI({ pdfId, userId }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (pdfId) {
      loadChatHistory();
    }
    loadAllChats();
  }, [pdfId, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/chat/${userId}/${pdfId}`);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const loadAllChats = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/chat/${userId}`);
      setChats(data);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !pdfId || loading) return;

    const userMsg = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/chat/message`, {
        userId,
        pdfId,
        message: inputMessage
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        citations: data.citations,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    setMessages([]);
  };

  if (!pdfId) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
        <h3>💬 No PDF Selected</h3>
        <p>Please select a PDF to start chatting</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100%', position: 'relative' }}>
      {/* Left Drawer */}
      <div style={{
        width: showDrawer ? '250px' : '0',
        background: '#f5f7fa',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        borderRight: showDrawer ? '1px solid #ddd' : 'none'
      }}>
        <div style={{ padding: '1rem' }}>
          <button 
            onClick={newChat}
            className="btn-primary"
            style={{ width: '100%', marginBottom: '1rem', fontSize: '0.9rem' }}
          >
            ➕ New Chat
          </button>
          
          <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Recent Chats</h4>
          {chats.map((chat, i) => (
            <div key={i} style={{
              padding: '0.75rem',
              background: 'white',
              borderRadius: '6px',
              marginBottom: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}>
              {chat.pdfId?.originalname || 'Chat ' + (i + 1)}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          borderBottom: '1px solid #eee'
        }}>
          <button 
            onClick={() => setShowDrawer(!showDrawer)}
            className="btn-secondary"
            style={{ padding: '0.5rem 1rem' }}
          >
            ☰ {showDrawer ? 'Hide' : 'Show'} Chats
          </button>
          <h3 style={{ margin: 0 }}>💬 Chat Assistant</h3>
          <div style={{ width: '100px' }}></div>
        </div>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          background: '#f9f9f9'
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
              <p>👋 Hi! Ask me anything about your coursebook!</p>
              <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
                Try: "Explain Newton's laws" or "What is thermodynamics?"
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} style={{
                marginBottom: '1rem',
                padding: '1rem',
                background: msg.role === 'user' ? '#667eea' : 'white',
                color: msg.role === 'user' ? 'white' : '#333',
                borderRadius: '12px',
                maxWidth: '80%',
                marginLeft: msg.role === 'user' ? 'auto' : '0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                
                {msg.citations && msg.citations.length > 0 && (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem',
                    background: '#f0f0f0',
                    borderRadius: '6px',
                    fontSize: '0.85rem'
                  }}>
                    <strong>📚 Sources:</strong>
                    {msg.citations.map((cite, j) => (
                      <div key={j} style={{ marginTop: '0.25rem' }}>
                        • {cite.page}: "{cite.text}"
                      </div>
                    ))}
                  </div>
                )}
                
                <p style={{ 
                  fontSize: '0.7rem', 
                  marginTop: '0.5rem', 
                  opacity: 0.7 
                }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
          {loading && (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#999' }}>
              ⏳ Thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ 
          padding: '1rem', 
          background: 'white',
          borderTop: '1px solid #eee',
          display: 'flex', 
          gap: '0.5rem' 
        }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask a question..."
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
          <button 
            onClick={sendMessage}
            disabled={loading || !inputMessage.trim()}
            className="btn-primary"
            style={{ minWidth: '80px' }}
          >
            {loading ? '⏳' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
