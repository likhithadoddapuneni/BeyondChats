const express = require('express');
const { UserProgress, QuizAttempt } = require('../models/models');

const router = express.Router();

// Get user progress
router.get('/:userId', async (req, res) => {
  try {
    let progress = await UserProgress.findOne({ userId: req.params.userId });

    if (!progress) {
      progress = new UserProgress({
        userId: req.params.userId,
        strengths: [],
        weaknesses: []
      });
      await progress.save();
    }

    // Sort strengths and weaknesses by count
    progress.strengths.sort((a, b) => b.count - a.count);
    progress.weaknesses.sort((a, b) => b.count - a.count);

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get detailed analytics
router.get('/:userId/analytics', async (req, res) => {
  try {
    const progress = await UserProgress.findOne({ userId: req.params.userId });
    const recentAttempts = await QuizAttempt.find({ userId: req.params.userId })
      .sort({ attemptDate: -1 })
      .limit(10)
      .populate('pdfId', 'originalname');

    const analytics = {
      totalAttempts: progress?.totalAttempts || 0,
      averageScore: progress?.averageScore || 0,
      recentScores: progress?.recentScores || [],
      topStrengths: progress?.strengths.slice(0, 5) || [],
      topWeaknesses: progress?.weaknesses.slice(0, 5) || [],
      recentAttempts: recentAttempts.map(a => ({
        date: a.attemptDate,
        score: a.score,
        quizType: a.quizType,
        pdfName: a.pdfId?.originalname
      }))
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
