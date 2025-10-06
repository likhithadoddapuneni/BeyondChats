const express = require('express');
const { ChatHistory, Pdf } = require('../models/models');
const GeminiService = require('../services/geminiService');
const RAGService = require('../services/ragService');

const router = express.Router();
const geminiService = new GeminiService(process.env.GEMINI_API_KEY);
const ragService = new RAGService();

// Get chat history for a user and PDF
router.get('/:userId/:pdfId', async (req, res) => {
  try {
    const chat = await ChatHistory.findOne({
      userId: req.params.userId,
      pdfId: req.params.pdfId
    });

    res.json(chat || { messages: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message with RAG
router.post('/message', async (req, res) => {
  try {
    const { userId, pdfId, message } = req.body;

    if (!message || !pdfId) {
      return res.status(400).json({ error: 'Message and pdfId required' });
    }

    // Search for relevant chunks
    const relevantChunks = await ragService.searchChunks(pdfId, message, 5);
    console.log('Relevant Chunks:', relevantChunks);

    // Generate response with RAG
    let response;
    try {
      // Log the context that will be sent to Gemini
      const context = relevantChunks.map((chunk, i) => `[Page ${chunk.pageNumber}, Section ${i+1}]: "${chunk.text}"`).join('\n\n');
      console.log('Context sent to Gemini:', context);
      response = await geminiService.generateChatResponseWithRAG(
        message,
        relevantChunks
      );
    } catch (err) {
      // If the LLM fails, propagate a clear error message
      console.error('LLM error:', err);
      return res.status(500).json({ error: typeof err === 'string' ? err : (err.message || 'Failed to generate response') });
    }

    // Save to chat history
    let chat = await ChatHistory.findOne({ userId, pdfId });
    if (!chat) {
      chat = new ChatHistory({ userId, pdfId, messages: [] });
    }

    chat.messages.push(
      { role: 'user', content: message },
      { 
        role: 'assistant', 
        content: response,
        citations: relevantChunks.map(c => `Page ${c.pageNumber}`)
      }
    );

    await chat.save();

    res.json({
      response,
      citations: relevantChunks.map(chunk => ({
        page: chunk.pageNumber,
        text: chunk.text.slice(0, 150) + '...'
      }))
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: typeof error === 'string' ? error : (error.message || 'Unknown error') });
  }
});

// Get all chats for a user
router.get('/:userId', async (req, res) => {
  try {
    const chats = await ChatHistory.find({ userId: req.params.userId })
      .populate('pdfId', 'originalname')
      .sort({ createdAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
