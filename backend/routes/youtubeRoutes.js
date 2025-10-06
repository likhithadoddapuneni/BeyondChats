const express = require('express');
const { Pdf } = require('../models/models');
const YouTubeService = require('../services/youtubeService');

const router = express.Router();
const youtubeService = new YouTubeService();

// Get video recommendations for a PDF
router.get('/recommend/:pdfId', async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.pdfId);
    if (!pdf) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    // Extract key topics from PDF title and first 500 chars
    const query = pdf.originalname.replace('.pdf', '') + ' ' + 
                  pdf.textContent.slice(0, 500);
    
    // Search for relevant videos
    const videos = await youtubeService.searchVideos(query, 6);

    res.json({ videos });
  } catch (error) {
    console.error('YouTube recommendation error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
