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

  const handleDelete = async (pdfId) => {
    if (!window.confirm('Are you sure you want to delete this PDF?')) return;
    try {
      await axios.delete(`${API_URL}/pdfs/${pdfId}`);
      setMessage('PDF deleted successfully.');
      fetchPdfs();
      if (selectedPdfId === pdfId) onSelectPdf('');
    } catch (error) {
      setMessage('❌ Delete failed: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="source-selector">
      <h3>📁 Select PDF Source</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {pdfs.map((pdf) => (
          <li key={pdf._id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', background: selectedPdfId === pdf._id ? '#e6f7ff' : 'white', borderRadius: '6px', padding: '0.5rem 0.75rem' }}>
            <span style={{ flex: 1, cursor: 'pointer' }} onClick={() => onSelectPdf(pdf._id)}>
              {pdf.originalname} ({pdf.pages} pages)
            </span>
            <button onClick={() => handleDelete(pdf._id)} style={{ marginLeft: '0.5rem', background: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', padding: '0.25rem 0.75rem', cursor: 'pointer' }}>🗑️ Delete</button>
          </li>
        ))}
      </ul>

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
