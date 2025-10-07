const express = require('express');

const { Pdf } = require('../models/models');
const YouTubeService = require('../services/youtubeService');
const GeminiService = require('../services/geminiService');

const router = express.Router();

const youtubeService = new YouTubeService();
const geminiService = new GeminiService(process.env.GEMINI_API_KEY);


// Get video recommendations for a PDF (Gemini-powered query, with caching)
router.get('/recommend/:pdfId', async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.pdfId);
    if (!pdf) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    // Check for refresh param (force new fetch)
    const forceRefresh = req.query.refresh === 'true';

    // If cached and not forced, return cached videos
    if (!forceRefresh && pdf.cachedVideos && pdf.cachedVideos.length > 0) {
      return res.json({ videos: pdf.cachedVideos });
    }

    // Try to generate a concise, context-rich YouTube search query using Gemini
    let query;
    try {
      const prompt = `Given the following coursebook content, generate a concise, highly relevant YouTube search query (max 12 words) that would help a student find the best educational videos to understand the main topics and concepts in this document. Do NOT include the filename or any file-specific info. Only output the search query, nothing else.\n\nContent:\n${pdf.textContent.slice(0, 3000)}`;
      const response = await geminiService.generateChatResponse(prompt, '');
      query = response.split('\n')[0].trim();
      if (!query || query.length < 3) {
        throw new Error('Empty Gemini query');
      }
    } catch (err) {
      query = pdf.originalname.replace('.pdf', '') + ' ' + pdf.textContent.slice(0, 500);
    }

    // Search for relevant videos
    const videos = await youtubeService.searchVideos(query, 6);

    // Save to cache
    pdf.cachedVideos = videos;
    pdf.lastVideosFetched = new Date();
    await pdf.save();

    res.json({ videos });
  } catch (error) {
    console.error('YouTube recommendation error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
