import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const API_URL = 'http://localhost:5001/api';

export default function PdfViewer({ pdfId }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  if (!pdfId) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
        <h3>📄 No PDF Selected</h3>
        <p>Please select or upload a PDF to view</p>
      </div>
    );
  }

  const pdfUrl = `${API_URL}/pdfs/${pdfId}/file`;

  return (
    <div className="pdf-viewer">
      <h3>📖 PDF Viewer</h3>
      
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<div style={{ textAlign: 'center', padding: '2rem' }}>⏳ Loading PDF...</div>}
        error={<div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>❌ Failed to load PDF</div>}
      >
        <Page 
          pageNumber={pageNumber} 
          renderTextLayer={true}
          renderAnnotationLayer={true}
          width={Math.min(window.innerWidth * 0.4, 600)}
        />
      </Document>

      {numPages && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '1rem',
          padding: '1rem',
          background: '#f5f7fa',
          borderRadius: '8px'
        }}>
          <button 
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1}
            className="btn-secondary"
          >
            ← Previous
          </button>
          
          <span style={{ fontWeight: '600' }}>
            Page {pageNumber} of {numPages}
          </span>
          
          <button 
            onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
            disabled={pageNumber >= numPages}
            className="btn-secondary"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
