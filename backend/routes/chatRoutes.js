const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { ChatHistory, Pdf } = require('../models/models');
const GeminiService = require('../services/geminiService');
const RAGService = require('../services/ragService');

const router = express.Router();
const geminiService = new GeminiService(process.env.GEMINI_API_KEY);
const ragService = new RAGService();

// ============================================
// SESSION-BASED CHAT ROUTES
// ============================================

// Create a new chat session for a user/pdf
router.post('/session', async (req, res) => {
  try {
    const { userId, pdfId, sessionTitle } = req.body;
    if (!userId || !pdfId) {
      return res.status(400).json({ error: 'userId and pdfId required' });
    }
    
    const sessionId = uuidv4();
    const chat = new ChatHistory({ 
      userId, 
      pdfId, 
      sessionId, 
      sessionTitle: sessionTitle || 'New Chat', 
      messages: [] 
    });
    
    await chat.save();
    res.json({ sessionId, chat });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List all chat sessions for a user/pdf
router.get('/sessions/:userId/:pdfId', async (req, res) => {
  try {
    const chats = await ChatHistory.find({ 
      userId: req.params.userId, 
      pdfId: req.params.pdfId,
      sessionId: { $exists: true, $ne: null } // Only get sessions with sessionId
    }).sort({ createdAt: -1 });
    
    res.json(chats.map(chat => ({
      sessionId: chat.sessionId,
      sessionTitle: chat.sessionTitle,
      createdAt: chat.createdAt,
      messageCount: chat.messages.length
    })));
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get chat history for a specific session
router.get('/session/:userId/:pdfId/:sessionId', async (req, res) => {
  try {
    const chat = await ChatHistory.findOne({
      userId: req.params.userId,
      pdfId: req.params.pdfId,
      sessionId: req.params.sessionId
    });
    
    res.json(chat || { messages: [] });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send message to a specific session
router.post('/message/session', async (req, res) => {
  try {
    const { userId, pdfId, sessionId, message } = req.body;
    
    if (!message || !pdfId || !sessionId) {
      return res.status(400).json({ error: 'Message, pdfId, and sessionId required' });
    }

    // Search for relevant chunks
    const relevantChunks = await ragService.searchChunks(pdfId, message, 5);
    console.log('Relevant Chunks:', relevantChunks);

    // Generate response with RAG
    let response;
    try {
      const context = relevantChunks.map((chunk, i) => 
        `[Page ${chunk.pageNumber}, Section ${i+1}]: "${chunk.text}"`
      ).join('\n\n');
      console.log('Context sent to Gemini:', context);
      
      response = await geminiService.generateChatResponseWithRAG(message, relevantChunks);
    } catch (err) {
      console.error('LLM error:', err);
      return res.status(500).json({ 
        error: typeof err === 'string' ? err : (err.message || 'Failed to generate response') 
      });
    }

    // Save to chat history (session-based)
    let chat = await ChatHistory.findOne({ userId, pdfId, sessionId });
    if (!chat) {
      chat = new ChatHistory({ 
        userId, 
        pdfId, 
        sessionId, 
        sessionTitle: 'Chat Session',
        messages: [] 
      });
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
    res.status(500).json({ 
      error: typeof error === 'string' ? error : (error.message || 'Unknown error') 
    });
  }
});

// ============================================
// NON-SESSION CHAT ROUTES (Auto-generate sessionId)
// ============================================

// Send message without explicit session (creates default session per user+pdf)
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
      const context = relevantChunks.map((chunk, i) => 
        `[Page ${chunk.pageNumber}, Section ${i+1}]: "${chunk.text}"`
      ).join('\n\n');
      console.log('Context sent to Gemini:', context);
      
      response = await geminiService.generateChatResponseWithRAG(message, relevantChunks);
    } catch (err) {
      console.error('LLM error:', err);
      return res.status(500).json({ 
        error: typeof err === 'string' ? err : (err.message || 'Failed to generate response') 
      });
    }

    // Find or create a default session for this user+pdf combination
    let chat = await ChatHistory.findOne({ 
      userId, 
      pdfId,
      sessionId: { $exists: false } // Find the non-session chat
    });
    
    if (!chat) {
      // Create a new default chat with auto-generated sessionId
      const defaultSessionId = `default-${userId}-${pdfId}`;
      chat = new ChatHistory({ 
        userId, 
        pdfId, 
        sessionId: defaultSessionId,
        sessionTitle: 'Default Chat',
        messages: [] 
      });
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
      sessionId: chat.sessionId, // Return sessionId for future requests
      citations: relevantChunks.map(chunk => ({
        page: chunk.pageNumber,
        text: chunk.text.slice(0, 150) + '...'
      }))
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: typeof error === 'string' ? error : (error.message || 'Unknown error') 
    });
  }
});

// ============================================
// CHAT HISTORY MANAGEMENT ROUTES
// ============================================

// Get all chats for a user
router.get('/:userId', async (req, res) => {
  try {
    const chats = await ChatHistory.find({ userId: req.params.userId })
      .populate('pdfId', 'originalname')
      .sort({ createdAt: -1 });

    res.json(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get chat history for a user and PDF
router.get('/:userId/:pdfId', async (req, res) => {
  try {
    const chat = await ChatHistory.findOne({
      userId: req.params.userId,
      pdfId: req.params.pdfId
    }).sort({ createdAt: -1 }); // Get most recent chat

    res.json(chat || { messages: [] });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear chat history for a user and PDF
router.delete('/:userId/:pdfId', async (req, res) => {
  try {
    const result = await ChatHistory.deleteMany({ 
      userId: req.params.userId, 
      pdfId: req.params.pdfId 
    });
    
    res.json({ 
      success: true, 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a specific session
router.delete('/session/:userId/:pdfId/:sessionId', async (req, res) => {
  try {
    const result = await ChatHistory.deleteOne({
      userId: req.params.userId,
      pdfId: req.params.pdfId,
      sessionId: req.params.sessionId
    });
    
    res.json({ 
      success: true, 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
