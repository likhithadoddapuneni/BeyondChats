import React, { useState } from 'react';
import './App.css';
import Layout from './components/Layout';
import SourceSelector from './components/SourceSelector';
import PdfViewer from './components/PdfViewer';
import QuizGenerator from './components/QuizGenerator';
import ProgressDashboard from './components/ProgressDashboard';
import ChatUI from './components/ChatUI';
import YouTubeRecommender from './components/YouTubeRecommender';


function App() {
  const [selectedPdfId, setSelectedPdfId] = useState('');
  const [userId] = useState('user_' + Date.now()); // Simple user ID generation
  const [activeTab, setActiveTab] = useState('quiz');

  return (
    <Layout>
      <div className="app-container">
        <header className="app-header">
          <h1>📚 BeyondChats</h1>
          <p>Learn smarter with AI-powered learning</p>
        </header>

        <div className="main-content">
          <div className="sidebar">
            <SourceSelector 
              onSelectPdf={setSelectedPdfId}
              selectedPdfId={selectedPdfId}
            />
            <div className="tab-selector">
              <button 
                className={activeTab === 'quiz' ? 'active' : ''}
                onClick={() => setActiveTab('quiz')}
              >
                📝 Quiz
              </button>
              <button 
                className={activeTab === 'chat' ? 'active' : ''}
                onClick={() => setActiveTab('chat')}
              >
                💬 Chat
              </button>
              <button 
                className={activeTab === 'progress' ? 'active' : ''}
                onClick={() => setActiveTab('progress')}
              >
                📊 Progress
              </button>
              <button 
  className={activeTab === 'youtube' ? 'active' : ''}
  onClick={() => setActiveTab('youtube')}
>
  🎥 Videos
</button>

            </div>
          </div>

          <div className="content-area">
            <div className="pdf-viewer-section">
              <PdfViewer pdfId={selectedPdfId} />
            </div>

            <div className="interaction-section">
              {activeTab === 'quiz' && (
                <QuizGenerator 
                  pdfId={selectedPdfId} 
                  userId={userId}
                />
              )}
              {activeTab === 'chat' && (
                <ChatUI 
                  pdfId={selectedPdfId}
                  userId={userId}
                />
              )}
              {activeTab === 'progress' && (
                <ProgressDashboard userId={userId} />
              )}
              {activeTab === 'youtube' && (
  <YouTubeRecommender pdfId={selectedPdfId} />
)}

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;
