import React, { useState, useEffect } from 'react';
import './App.css';
import SourceSelector from './components/SourceSelector';
import PdfViewer from './components/PdfViewer';
import QuizGenerator from './components/QuizGenerator';
import ProgressDashboard from './components/ProgressDashboard';
import ChatUI from './components/ChatUI';
import YouTubeRecommender from './components/YouTubeRecommender';

function App() {
  const [selectedPdfId, setSelectedPdfId] = useState('');
  // FIX: Store userId in localStorage to persist across refreshes
  const [userId] = useState(() => {
    let storedUserId = localStorage.getItem('beyondchats_userId');
    if (!storedUserId) {
      storedUserId = 'user_' + Date.now();
      localStorage.setItem('beyondchats_userId', storedUserId);
    }
    return storedUserId;
  });
  
  const [activeTab, setActiveTab] = useState('upload');
  const [videoCache, setVideoCache] = useState({});
  const [pdfs, setPdfs] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pdfToDelete, setPdfToDelete] = useState(null);

  // Log userId for debugging
  useEffect(() => {
    console.log('Current userId:', userId);
  }, [userId]);

  const handleCacheVideos = (pdfId, videos) => {
    setVideoCache((prev) => ({ ...prev, [pdfId]: videos }));
  };

  const handleRefreshVideos = (pdfId) => {
    setVideoCache((prev) => {
      const updated = { ...prev };
      delete updated[pdfId];
      return updated;
    });
  };

  const handlePdfsUpdate = (list) => setPdfs(list);
  const handleDropdownSelect = (e) => setSelectedPdfId(e.target.value);

  const handleDeleteClick = (pdf) => {
    setPdfToDelete(pdf);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!pdfToDelete) return;
    try {
      await fetch(`http://localhost:5001/api/pdfs/${pdfToDelete._id}`, { method: 'DELETE' });
      setShowDeleteModal(false);
      setPdfToDelete(null);
      setSelectedPdfId('');
      document.dispatchEvent(new CustomEvent('refreshPdfs'));
    } catch (err) {
      alert('Failed to delete PDF');
    }
  };

  return (
    <div className="app-container">
      {/* Header with PDF Selector */}
      <div className="app-header">
        <div className="header-content">
          <div className="header-title-section">
            <h1>📚 PDF Learning Assistant</h1>
            <p>Upload, Learn, Quiz, and Chat with your PDFs</p>
          </div>
          
          {/* PDF Selector at Top */}
          {pdfs.length > 0 && (
            <div className="header-pdf-selector">
              <label htmlFor="header-pdf-select">Selected PDF:</label>
              <select
                id="header-pdf-select"
                value={selectedPdfId}
                onChange={handleDropdownSelect}
                className="header-pdf-dropdown"
              >
                <option value="">Choose a PDF...</option>
                {pdfs.map((pdf) => (
                  <option key={pdf._id} value={pdf._id}>
                    {pdf.originalname}
                  </option>
                ))}
              </select>
              {selectedPdfId && (
                <button
                  onClick={() => handleDeleteClick(pdfs.find((p) => p._id === selectedPdfId))}
                  className="header-delete-btn"
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="main-layout">
        {/* Sidebar Navigation */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h3>Navigation</h3>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              <span className="nav-icon">📤</span>
              <span className="nav-label">Upload PDF</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'pdf' ? 'active' : ''}`}
              onClick={() => setActiveTab('pdf')}
              disabled={!selectedPdfId}
            >
              <span className="nav-icon">📖</span>
              <span className="nav-label">PDF Viewer</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
              disabled={!selectedPdfId}
            >
              <span className="nav-icon">💬</span>
              <span className="nav-label">Chat</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'quiz' ? 'active' : ''}`}
              onClick={() => setActiveTab('quiz')}
              disabled={!selectedPdfId}
            >
              <span className="nav-icon">📝</span>
              <span className="nav-label">Quiz</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'videos' ? 'active' : ''}`}
              onClick={() => setActiveTab('videos')}
              disabled={!selectedPdfId}
            >
              <span className="nav-icon">🎥</span>
              <span className="nav-label">Videos</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'progress' ? 'active' : ''}`}
              onClick={() => setActiveTab('progress')}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-label">Progress</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="content-area">
          {activeTab === 'upload' && (
            <div className="content-section">
              <SourceSelector onPdfsUpdate={handlePdfsUpdate} onSelectPdf={setSelectedPdfId} />
            </div>
          )}

          {activeTab === 'pdf' && (
            <div className="content-section">
              <PdfViewer pdfId={selectedPdfId} />
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="content-section">
              <ChatUI userId={userId} pdfId={selectedPdfId} />
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="content-section">
              <QuizGenerator userId={userId} pdfId={selectedPdfId} />
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="content-section">
              <YouTubeRecommender
                pdfId={selectedPdfId}
                cachedVideos={videoCache[selectedPdfId]}
                onCacheVideos={(videos) => handleCacheVideos(selectedPdfId, videos)}
                onRefresh={() => handleRefreshVideos(selectedPdfId)}
              />
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="content-section">
              <ProgressDashboard userId={userId} />
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && pdfToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Delete PDF</h2>
            <p>Are you sure you want to delete <strong>{pdfToDelete.originalname}</strong>?</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteModal(false)} className="btn-cancel">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="btn-delete">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
