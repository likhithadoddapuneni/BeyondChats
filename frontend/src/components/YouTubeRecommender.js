
import axios from 'axios';
import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:5001/api';

export default function YouTubeRecommender({ pdfId, cachedVideos, onCacheVideos, onRefresh }) {
  const [videos, setVideos] = useState(cachedVideos || []);
  const [loading, setLoading] = useState(false);

  // Load from cache or fetch if not present
  useEffect(() => {
    if (!pdfId) return;
    if (cachedVideos && cachedVideos.length > 0) {
      setVideos(cachedVideos);
      setLoading(false);
    } else {
      fetchVideos();
    }
    // eslint-disable-next-line
  }, [pdfId, cachedVideos]);

  // Fetch videos from API and cache them
  const fetchVideos = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const url = forceRefresh
        ? `${API_URL}/youtube/recommend/${pdfId}?refresh=true`
        : `${API_URL}/youtube/recommend/${pdfId}`;
      const { data } = await axios.get(url);
      setVideos(data.videos);
      if (onCacheVideos) onCacheVideos(data.videos);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    if (onRefresh) onRefresh();
    fetchVideos(true);
  };

  if (!pdfId) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
        <h3>🎥 No PDF Selected</h3>
        <p>Select a PDF to see recommended videos</p>
      </div>
    );
  }

  return (
    <div className="youtube-recommender">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }}>🎥 Recommended Videos</h3>
        <button
          onClick={handleRefresh}
          style={{
            background: '#e6f7ff',
            border: 'none',
            borderRadius: '6px',
            padding: '0.5rem 1rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '1rem',
            marginLeft: '1rem'
          }}
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>
      <p style={{ color: '#666', marginBottom: '1rem' }}>
        Educational videos related to your coursebook
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>⏳ Loading videos...</div>
      ) : videos.length === 0 ? (
        <div style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>
          <span>No videos found for this PDF.</span>
        </div>
      ) : (
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
      )}
    </div>
  );
}
