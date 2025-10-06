import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="layout">
      {children}
      <footer style={{
        textAlign: 'center',
        padding: '1rem',
        background: '#f5f7fa',
        color: '#666',
        marginTop: 'auto'
      }}>
        <p>© 2025 BeyondChats - Built with React, Node.js, MongoDB & Gemini AI</p>
      </footer>
    </div>
  );
}
