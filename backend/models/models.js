const mongoose = require('mongoose');

const PdfSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalname: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  pages: { type: Number, default: 0 },
  textContent: { type: String },
  fileSize: { type: Number },
  chunkingStatus: { type: String, enum: ['pending', 'done', 'error'], default: 'pending' },
  chunksCreated: { type: Number, default: 0 },
  cachedVideos: { type: Array, default: [] },
  lastVideosFetched: { type: Date }
});

const QuizAttemptSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  pdfId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pdf' },
  quizType: { type: String, enum: ['MCQ', 'SAQ', 'LAQ'], required: true },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: String,
    userAnswer: String,
    explanation: String,
    isCorrect: Boolean
  }],
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  attemptDate: { type: Date, default: Date.now }
});

const UserProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  totalAttempts: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  strengths: [{ topic: String, count: Number }],
  weaknesses: [{ topic: String, count: Number }],
  recentScores: [Number],
  lastUpdated: { type: Date, default: Date.now }
});

const ChatHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  pdfId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pdf' },
  sessionId: { type: String, required: false, index: true }, // Made optional
  sessionTitle: { type: String, default: '' },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'] },
    content: String,
    citations: [String],
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

// Add compound index for efficient queries
ChatHistorySchema.index({ userId: 1, pdfId: 1, sessionId: 1 });

const PdfChunkSchema = new mongoose.Schema({
  pdfId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pdf', required: true },
  pageNumber: { type: Number },
  chunkIndex: { type: Number },
  text: { type: String, required: true },
  embedding: [Number],
  createdAt: { type: Date, default: Date.now }
});

const PdfChunk = mongoose.model('PdfChunk', PdfChunkSchema);
const Pdf = mongoose.model('Pdf', PdfSchema);
const QuizAttempt = mongoose.model('QuizAttempt', QuizAttemptSchema);
const UserProgress = mongoose.model('UserProgress', UserProgressSchema);
const ChatHistory = mongoose.model('ChatHistory', ChatHistorySchema);

module.exports = { Pdf, QuizAttempt, UserProgress, ChatHistory, PdfChunk };
