const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { Pdf } = require('../models/models');
const RAGService = require('../services/ragService');
const ragService = new RAGService();

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Upload PDF
// Upload PDF
router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
    let dataBuffer;
    try {
      dataBuffer = fs.readFileSync(filePath);
    } catch (err) {
      console.error('File read error:', err);
      return res.status(500).json({ error: 'Failed to read uploaded file.' });
    }

    // Extract text from PDF
    let pdfData;
    try {
      pdfData = await pdfParse(dataBuffer);
    } catch (err) {
      console.error('PDF parse error:', err);
      return res.status(500).json({ error: 'Failed to parse PDF.' });
    }

    const pdfDoc = new Pdf({
      filename: req.file.filename,
      originalname: req.file.originalname,
      pages: pdfData.numpages,
      textContent: pdfData.text,
      fileSize: req.file.size
    });

    try {
      pdfDoc.chunkingStatus = 'pending';
      await pdfDoc.save();
    } catch (err) {
      console.error('PDF save error:', err);
      return res.status(500).json({ error: 'Failed to save PDF metadata.' });
    }

    // Respond immediately, chunk in background
    res.json({
      message: 'PDF uploaded successfully (chunking in background)',
      pdfId: pdfDoc._id,
      filename: pdfDoc.originalname,
      pages: pdfDoc.pages,
      chunkingStatus: 'pending'
    });

    // Start chunking in background
    (async () => {
      try {
        console.log('Background chunking PDF:', pdfDoc._id, 'Text length:', pdfData.text.length);
        const chunksCreated = await ragService.storeChunks(pdfDoc._id, pdfData.text, 1, 30000);
        console.log('Chunks created for PDF', pdfDoc._id, ':', chunksCreated);
        await Pdf.findByIdAndUpdate(pdfDoc._id, { chunkingStatus: 'done', chunksCreated });
      } catch (err) {
        console.error('Chunking error (background):', err);
        await Pdf.findByIdAndUpdate(pdfDoc._id, { chunkingStatus: 'error' });
      }
    })();
// Add endpoint to check chunking status
router.get('/:id/chunking-status', async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) {
      return res.status(404).json({ error: 'PDF not found' });
    }
    res.json({ chunkingStatus: pdf.chunkingStatus || 'unknown', chunksCreated: pdf.chunksCreated || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all PDFs
router.get('/', async (req, res) => {
  try {
    const pdfs = await Pdf.find()
      .select('-textContent')
      .sort({ uploadDate: -1 });
    res.json(pdfs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific PDF file
router.get('/:id/file', async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', pdf.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get PDF metadata and text content
router.get('/:id', async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) {
      return res.status(404).json({ error: 'PDF not found' });
    }
    res.json(pdf);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete PDF
router.delete('/:id', async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.id);
    if (!pdf) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', pdf.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Pdf.findByIdAndDelete(req.params.id);
    res.json({ message: 'PDF deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
