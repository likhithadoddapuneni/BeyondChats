import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export default function ProgressDashboard({ userId }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [userId]);

  const fetchAnalytics = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/progress/${userId}/analytics`);
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>⏳ Loading progress...</div>;
  }

  if (!analytics) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
      ❌ Unable to load progress data
    </div>;
  }

  return (
    <div className="progress-dashboard">
      <h3>📊 Learning Progress</h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginTop: '1.5rem'
      }}>
        <div style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h4>Total Attempts</h4>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
            {analytics.totalAttempts}
          </p>
        </div>

        <div style={{
          padding: '1.5rem',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h4>Average Score</h4>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
            {analytics.averageScore.toFixed(1)}%
          </p>
        </div>
      </div>

      {analytics.recentScores.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h4>📈 Recent Scores</h4>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginTop: '1rem',
            alignItems: 'flex-end',
            height: '150px'
          }}>
            {analytics.recentScores.map((score, i) => (
              <div key={i} style={{
                flex: 1,
                background: score >= 70 ? '#4caf50' : score >= 50 ? '#ff9800' : '#f44336',
                borderRadius: '8px 8px 0 0',
                height: `${score}%`,
                minHeight: '20px',
                position: 'relative',
                transition: 'height 0.3s ease'
              }}>
                <span style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  {score.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginTop: '2rem'
      }}>
        <div>
          <h4>💪 Top Strengths</h4>
          <div style={{ marginTop: '1rem' }}>
            {analytics.topStrengths.length > 0 ? (
              analytics.topStrengths.map((s, i) => (
                <div key={i} style={{
                  padding: '0.75rem',
                  background: '#e8f5e9',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>{s.topic}</span>
                  <span style={{ fontWeight: '600', color: '#4caf50' }}>
                    {s.count} ✓
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: '#999' }}>No data yet</p>
            )}
          </div>
        </div>

        <div>
          <h4>📚 Areas to Improve</h4>
          <div style={{ marginTop: '1rem' }}>
            {analytics.topWeaknesses.length > 0 ? (
              analytics.topWeaknesses.map((w, i) => (
                <div key={i} style={{
                  padding: '0.75rem',
                  background: '#ffebee',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>{w.topic}</span>
                  <span style={{ fontWeight: '600', color: '#f44336' }}>
                    {w.count} ✗
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: '#999' }}>No data yet</p>
            )}
          </div>
        </div>
      </div>

      {analytics.recentAttempts.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h4>📝 Recent Quiz Attempts</h4>
          <div style={{ marginTop: '1rem' }}>
            {analytics.recentAttempts.map((attempt, i) => (
              <div key={i} style={{
                padding: '1rem',
                background: '#f9f9f9',
                borderRadius: '8px',
                marginBottom: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <p style={{ fontWeight: '600' }}>{attempt.pdfName}</p>
                  <p style={{ fontSize: '0.85rem', color: '#666' }}>
                    {attempt.quizType} • {new Date(attempt.date).toLocaleDateString()}
                  </p>
                </div>
                <div style={{
                  padding: '0.5rem 1rem',
                  background: attempt.score >= 70 ? '#4caf50' : attempt.score >= 50 ? '#ff9800' : '#f44336',
                  color: 'white',
                  borderRadius: '20px',
                  fontWeight: '600'
                }}>
                  {attempt.score.toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
