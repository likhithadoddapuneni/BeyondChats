import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = 'https://beyondchats-5ojh.onrender.com/api';

export default function ChatUI({ pdfId, userId }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showSessionDrawer, setShowSessionDrawer] = useState(false);
  const messagesEndRef = useRef(null);

  // Load sessions and chat history when pdfId changes
  useEffect(() => {
    if (pdfId && userId) {
      loadSessions();
    }
  }, [pdfId, userId]);

  // Load chat history when session changes
  useEffect(() => {
    if (currentSessionId && pdfId && userId) {
      loadChatHistory();
    }
  }, [currentSessionId, pdfId, userId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load all sessions for current user+pdf
  const loadSessions = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/chat/sessions/${userId}/${pdfId}`);
      setSessions(data);
      
      // If sessions exist, load the most recent one
      if (data.length > 0) {
        setCurrentSessionId(data[0].sessionId);
      } else {
        // Create a new session if none exist
        createNewSession();
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  // Load chat history for current session
  const loadChatHistory = async () => {
    if (!currentSessionId) return;
    
    try {
      const { data } = await axios.get(
        `${API_URL}/chat/session/${userId}/${pdfId}/${currentSessionId}`
      );
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  // Create new chat session
  const createNewSession = async () => {
    if (!pdfId || !userId) return;
    
    try {
      const { data } = await axios.post(`${API_URL}/chat/session`, {
        userId,
        pdfId,
        sessionTitle: `Chat ${new Date().toLocaleString()}`
      });
      
      setCurrentSessionId(data.sessionId);
      setMessages([]);
      await loadSessions(); // Refresh session list
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim() || !pdfId || loading || !currentSessionId) return;

    const userMsg = { 
      role: 'user', 
      content: inputMessage, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/chat/message/session`, {
        userId,
        pdfId,
        sessionId: currentSessionId,
        message: inputMessage
      });

      const assistantMsg = {
        role: 'assistant',
        content: data.response,
        citations: data.citations,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
      
      // Reload chat history to ensure sync with backend
      await loadChatHistory();
      await loadSessions(); // Update session list with new message count
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '❌ Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Switch to a different session
  const switchSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    setShowSessionDrawer(false);
  };

  // Delete a session
  const deleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this chat session?')) return;
    
    try {
      await axios.delete(`${API_URL}/chat/session/${userId}/${pdfId}/${sessionId}`);
      
      // If deleted session was current, create new one
      if (sessionId === currentSessionId) {
        await createNewSession();
      } else {
        await loadSessions();
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  if (!pdfId) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>💬</div>
        <h2>Please select a PDF to start chatting</h2>
        <p>Choose a PDF from the sidebar to begin your learning journey!</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Chat Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h3 style={styles.headerTitle}>💬 Chat Assistant</h3>
          <span style={styles.sessionInfo}>
            {sessions.find(s => s.sessionId === currentSessionId)?.sessionTitle || 'Loading...'}
          </span>
        </div>
        <div style={styles.headerActions}>
          <button onClick={() => setShowSessionDrawer(!showSessionDrawer)} style={styles.sessionBtn}>
            📋 Sessions ({sessions.length})
          </button>
          <button onClick={createNewSession} style={styles.newChatBtn}>
            ➕ New Chat
          </button>
        </div>
      </div>

      {/* Session Drawer */}
      {showSessionDrawer && (
        <div style={styles.sessionDrawer}>
          <h4 style={styles.drawerTitle}>Chat Sessions</h4>
          {sessions.length === 0 ? (
            <p style={styles.noSessions}>No chat sessions yet</p>
          ) : (
            sessions.map(session => (
              <div
                key={session.sessionId}
                style={{
                  ...styles.sessionItem,
                  ...(session.sessionId === currentSessionId ? styles.activeSession : {})
                }}
              >
                <div 
                  onClick={() => switchSession(session.sessionId)}
                  style={styles.sessionContent}
                >
                  <div style={styles.sessionTitle}>{session.sessionTitle}</div>
                  <div style={styles.sessionMeta}>
                    {new Date(session.createdAt).toLocaleDateString()} • {session.messageCount} messages
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.sessionId);
                  }}
                  style={styles.deleteSessionBtn}
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Welcome Message */}
      {messages.length === 0 && (
        <div style={styles.welcomeBox}>
          <h3>👋 Hi! Ask me anything about your coursebook!</h3>
          <p>Try: "Explain Newton's laws" or "What is thermodynamics?"</p>
        </div>
      )}

      {/* Messages */}
      <div style={styles.messagesContainer}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              ...styles.messageWrapper,
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                ...styles.message,
                ...(msg.role === 'user' ? styles.userMessage : styles.assistantMessage)
              }}
            >
              <div style={styles.messageContent}>{msg.content}</div>
              {msg.citations && msg.citations.length > 0 && (
                <div style={styles.citations}>
                  📚 Sources: {msg.citations.map((c, i) => (
                    <span key={i} style={styles.citationBadge}>
                      Page {c.page}
                    </span>
                  ))}
                </div>
              )}
              <div style={styles.timestamp}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={styles.loadingIndicator}>
            <div style={styles.typingDots}>
              <span>●</span>
              <span>●</span>
              <span>●</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your question here..."
          style={styles.input}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={!inputMessage.trim() || loading}
          style={styles.sendButton}
        >
          {loading ? '⏳' : '📤'} Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #e5e7eb',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  headerTitle: {
    margin: 0,
    fontSize: '1.25rem'
  },
  sessionInfo: {
    fontSize: '0.875rem',
    opacity: 0.9
  },
  headerActions: {
    display: 'flex',
    gap: '0.5rem'
  },
  sessionBtn: {
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  newChatBtn: {
    padding: '0.5rem 1rem',
    background: 'white',
    color: '#667eea',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  sessionDrawer: {
    maxHeight: '300px',
    overflowY: 'auto',
    borderBottom: '1px solid #e5e7eb',
    background: '#f9fafb',
    padding: '1rem'
  },
  drawerTitle: {
    margin: '0 0 0.75rem 0',
    fontSize: '1rem',
    color: '#374151'
  },
  noSessions: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: '1rem'
  },
  sessionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    marginBottom: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  activeSession: {
    background: '#eef2ff',
    borderColor: '#667eea'
  },
  sessionContent: {
    flex: 1
  },
  sessionTitle: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.25rem'
  },
  sessionMeta: {
    fontSize: '0.75rem',
    color: '#6b7280'
  },
  deleteSessionBtn: {
    padding: '0.25rem 0.5rem',
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem'
  },
  welcomeBox: {
    textAlign: 'center',
    padding: '2rem',
    background: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)',
    margin: '1rem',
    borderRadius: '12px'
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  messageWrapper: {
    display: 'flex',
    width: '100%'
  },
  message: {
    maxWidth: '75%',
    padding: '0.875rem 1rem',
    borderRadius: '12px',
    wordWrap: 'break-word'
  },
  userMessage: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderBottomRightRadius: '4px'
  },
  assistantMessage: {
    background: '#f3f4f6',
    color: '#1f2937',
    borderBottomLeftRadius: '4px'
  },
  messageContent: {
    lineHeight: '1.5'
  },
  citations: {
    marginTop: '0.5rem',
    fontSize: '0.75rem',
    opacity: 0.8,
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
    alignItems: 'center'
  },
  citationBadge: {
    background: 'rgba(0,0,0,0.1)',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px'
  },
  timestamp: {
    marginTop: '0.25rem',
    fontSize: '0.7rem',
    opacity: 0.6
  },
  loadingIndicator: {
    display: 'flex',
    justifyContent: 'flex-start',
    padding: '0.5rem'
  },
  typingDots: {
    display: 'flex',
    gap: '0.25rem',
    padding: '0.5rem 1rem',
    background: '#f3f4f6',
    borderRadius: '12px',
    animation: 'pulse 1.5s infinite'
  },
  inputContainer: {
    display: 'flex',
    gap: '0.75rem',
    padding: '1rem',
    borderTop: '1px solid #e5e7eb',
    background: '#f9fafb'
  },
  input: {
    flex: 1,
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none'
  },
  sendButton: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    color: '#6b7280'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  }
};
