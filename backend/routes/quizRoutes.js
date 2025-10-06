const express = require('express');
const { Pdf, QuizAttempt, UserProgress } = require('../models/models');
const GeminiService = require('../services/geminiService');

const router = express.Router();
const geminiService = new GeminiService(process.env.GEMINI_API_KEY);

// Generate quiz
router.post('/generate', async (req, res) => {
  try {
    const { pdfId, quizType, numQuestions = 5 } = req.body;

    if (!['MCQ', 'SAQ', 'LAQ'].includes(quizType)) {
      return res.status(400).json({ error: 'Invalid quiz type' });
    }

    const pdf = await Pdf.findById(pdfId);
    if (!pdf) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    if (!pdf.textContent) {
      return res.status(400).json({ error: 'PDF has no extractable text content' });
    }

    const questions = await geminiService.generateQuiz(
      pdf.textContent,
      quizType,
      numQuestions
    );

    res.json({
      quizType,
      pdfId,
      questions
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Submit quiz attempt
router.post('/attempt', async (req, res) => {
  try {
    const { userId, pdfId, quizType, questions, userAnswers } = req.body;

    // Calculate score
    let correctCount = 0;
    const processedQuestions = questions.map((q, index) => {
      const isCorrect = userAnswers[index]?.trim().toLowerCase() === 
                        q.correctAnswer?.trim().toLowerCase();
      if (isCorrect) correctCount++;

      return {
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswers[index] || '',
        explanation: q.explanation,
        isCorrect
      };
    });

    const score = (correctCount / questions.length) * 100;

    // Save attempt
    const attempt = new QuizAttempt({
      userId,
      pdfId,
      quizType,
      questions: processedQuestions,
      score,
      totalQuestions: questions.length
    });

    await attempt.save();

    // Update user progress
    await updateUserProgress(userId, score, processedQuestions);

    res.json({
      attemptId: attempt._id,
      score,
      correctCount,
      totalQuestions: questions.length,
      results: processedQuestions
    });
  } catch (error) {
    console.error('Attempt submission error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's quiz attempts
router.get('/attempts/:userId', async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.params.userId })
      .populate('pdfId', 'originalname')
      .sort({ attemptDate: -1 })
      .limit(20);

    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to update user progress
async function updateUserProgress(userId, score, questions) {
  let progress = await UserProgress.findOne({ userId });

  if (!progress) {
    progress = new UserProgress({ userId });
  }

  progress.totalAttempts += 1;
  progress.recentScores.push(score);
  if (progress.recentScores.length > 10) {
    progress.recentScores.shift();
  }

  progress.averageScore = 
    progress.recentScores.reduce((a, b) => a + b, 0) / progress.recentScores.length;

  // Update strengths and weaknesses based on topics
  questions.forEach(q => {
    const topic = q.topic || 'General';
    if (q.isCorrect) {
      const strength = progress.strengths.find(s => s.topic === topic);
      if (strength) {
        strength.count += 1;
      } else {
        progress.strengths.push({ topic, count: 1 });
      }
    } else {
      const weakness = progress.weaknesses.find(w => w.topic === topic);
      if (weakness) {
        weakness.count += 1;
      } else {
        progress.weaknesses.push({ topic, count: 1 });
      }
    }
  });

  progress.lastUpdated = new Date();
  await progress.save();
}

module.exports = router;
