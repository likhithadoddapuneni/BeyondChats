import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export default function YouTubeRecommender({ pdfId }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pdfId) {
      fetchVideos();
    }
  }, [pdfId]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/youtube/recommend/${pdfId}`);
      setVideos(data.videos);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!pdfId) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
        <h3>🎥 No PDF Selected</h3>
        <p>Select a PDF to see recommended videos</p>
      </div>
    );
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>⏳ Loading videos...</div>;
  }

  return (
    <div className="youtube-recommender">
      <h3>🎥 Recommended Videos</h3>
      <p style={{ color: '#666', marginBottom: '1rem' }}>
        Educational videos related to your coursebook
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1rem',
        marginTop: '1rem'
      }}>
        {videos.map((video, i) => (
          <div key={i} style={{
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          onClick={() => window.open(video.url, '_blank')}
          >
            <img 
              src={video.thumbnail} 
              alt={video.title}
              style={{ width: '100%', height: '180px', objectFit: 'cover' }}
            />
            <div style={{ padding: '1rem' }}>
              <h4 style={{ 
                fontSize: '0.95rem', 
                marginBottom: '0.5rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {video.title}
              </h4>
              <p style={{
                fontSize: '0.85rem',
                color: '#666',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {video.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
