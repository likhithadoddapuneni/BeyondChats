import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export default function SourceSelector({ onSelectPdf, selectedPdfId }) {
  const [pdfs, setPdfs] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/pdfs`);
      setPdfs(data);
    } catch (error) {
      console.error('Error fetching PDFs:', error);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      setMessage('Please select a PDF file');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('pdf', uploadFile);

      const { data } = await axios.post(`${API_URL}/pdfs/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage(`✅ ${data.filename} uploaded successfully!`);
      setUploadFile(null);
      fetchPdfs();
    } catch (error) {
      setMessage('❌ Upload failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="source-selector">
      <h3>📁 Select PDF Source</h3>
      
      <select 
        value={selectedPdfId} 
        onChange={(e) => onSelectPdf(e.target.value)}
        style={{ marginTop: '1rem', marginBottom: '1rem' }}
      >
        <option value="">-- Select a PDF --</option>
        {pdfs.map((pdf) => (
          <option key={pdf._id} value={pdf._id}>
            {pdf.originalname} ({pdf.pages} pages)
          </option>
        ))}
      </select>

      <hr style={{ margin: '1.5rem 0', border: '1px solid #eee' }} />

      <h4>📤 Upload New PDF</h4>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setUploadFile(e.target.files[0])}
        style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}
      />
      <button 
        onClick={handleUpload} 
        disabled={uploading}
        className="btn-primary"
        style={{ width: '100%', marginTop: '0.5rem' }}
      >
        {uploading ? '⏳ Uploading...' : '📤 Upload PDF'}
      </button>

      {message && (
        <p style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          background: message.includes('✅') ? '#d4edda' : '#f8d7da',
          borderRadius: '8px',
          fontSize: '0.9rem'
        }}>
          {message}
        </p>
      )}
    </div>
  );
}
