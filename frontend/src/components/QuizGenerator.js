import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export default function QuizGenerator({ pdfId, userId }) {
  const [quiz, setQuiz] = useState([]);
  const [quizType, setQuizType] = useState('MCQ');
  const [numQuestions, setNumQuestions] = useState(5);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);

  const generateQuiz = async () => {
    if (!pdfId) {
      alert('Please select a PDF first');
      return;
    }

    setLoading(true);
    setResults(null);
    setAnswers({});

    try {
      const { data } = await axios.post(`${API_URL}/quiz/generate`, {
        pdfId,
        quizType,
        numQuestions
      });

      setQuiz(data.questions);
    } catch (error) {
      alert('Failed to generate quiz: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (qIndex, value) => {
    setAnswers({ ...answers, [qIndex]: value });
  };

  const submitQuiz = async () => {
    const userAnswers = quiz.map((_, i) => answers[i] || '');

    try {
      const { data } = await axios.post(`${API_URL}/quiz/attempt`, {
        userId,
        pdfId,
        quizType,
        questions: quiz,
        userAnswers
      });

      setResults(data);
      setShowExplanations(true);
    } catch (error) {
      alert('Failed to submit quiz: ' + (error.response?.data?.error || error.message));
    }
  };

  const resetQuiz = () => {
    setQuiz([]);
    setAnswers({});
    setResults(null);
    setShowExplanations(false);
  };

  if (!pdfId) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
        <h3>❓ No PDF Selected</h3>
        <p>Please select a PDF to generate quizzes</p>
      </div>
    );
  }

  return (
    <div className="quiz-generator">
      <h3>🎯 Quiz Generator</h3>

      {quiz.length === 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Quiz Type:
            </label>
            <select 
              value={quizType} 
              onChange={(e) => setQuizType(e.target.value)}
            >
              <option value="MCQ">Multiple Choice Questions (MCQ)</option>
              <option value="SAQ">Short Answer Questions (SAQ)</option>
              <option value="LAQ">Long Answer Questions (LAQ)</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Number of Questions:
            </label>
            <input
              type="number"
              min="3"
              max="10"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              style={{ padding: '0.75rem', border: '2px solid #ddd', borderRadius: '8px', width: '100%' }}
            />
          </div>

          <button 
            onClick={generateQuiz} 
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? '⏳ Generating Quiz...' : '🎲 Generate Quiz'}
          </button>
        </div>
      )}

      {quiz.length > 0 && !results && (
        <div style={{ marginTop: '1.5rem' }}>
          {quiz.map((q, i) => (
            <div key={i} style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: '#f9f9f9',
              borderRadius: '8px',
              border: '2px solid #eee'
            }}>
              <p style={{ fontWeight: '600', marginBottom: '0.75rem' }}>
                {i + 1}. {q.question}
              </p>

              {quizType === 'MCQ' && q.options ? (
                <div>
                  {q.options.map((opt, j) => (
                    <label key={j} style={{ display: 'block', marginBottom: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name={`q${i}`}
                        value={opt}
                        checked={answers[i] === opt}
                        onChange={() => handleAnswerChange(i, opt)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  value={answers[i] || ''}
                  onChange={(e) => handleAnswerChange(i, e.target.value)}
                  placeholder="Enter your answer here..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #ddd',
                    minHeight: quizType === 'LAQ' ? '120px' : '60px',
                    resize: 'vertical'
                  }}
                />
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={submitQuiz} 
              className="btn-primary"
              style={{ flex: 1 }}
            >
              ✅ Submit Quiz
            </button>
            <button 
              onClick={resetQuiz} 
              className="btn-secondary"
              style={{ flex: 1 }}
            >
              🔄 New Quiz
            </button>
          </div>
        </div>
      )}

      {results && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{
            padding: '1.5rem',
            background: results.score >= 70 ? '#d4edda' : results.score >= 50 ? '#fff3cd' : '#f8d7da',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <h3>🎉 Quiz Completed!</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0' }}>
              {results.score.toFixed(1)}%
            </p>
            <p>{results.correctCount} out of {results.totalQuestions} correct</p>
          </div>

          {showExplanations && (
            <div>
              <h4 style={{ marginBottom: '1rem' }}>📚 Review Answers:</h4>
              {results.results.map((r, i) => (
                <div key={i} style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  background: r.isCorrect ? '#e8f5e9' : '#ffebee',
                  borderRadius: '8px',
                  border: `2px solid ${r.isCorrect ? '#4caf50' : '#f44336'}`
                }}>
                  <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                    {r.isCorrect ? '✅' : '❌'} {i + 1}. {r.question}
                  </p>
                  <p><strong>Your Answer:</strong> {r.userAnswer || '(No answer)'}</p>
                  <p><strong>Correct Answer:</strong> {r.correctAnswer}</p>
                  <p style={{ 
                    marginTop: '0.75rem', 
                    padding: '0.75rem', 
                    background: 'white', 
                    borderRadius: '6px',
                    fontSize: '0.9rem'
                  }}>
                    <strong>💡 Explanation:</strong> {r.explanation}
                  </p>
                </div>
              ))}
            </div>
          )}

          <button 
            onClick={resetQuiz} 
            className="btn-primary"
            style={{ width: '100%' }}
          >
            🎲 Generate New Quiz
          </button>
        </div>
      )}
    </div>
  );
}
