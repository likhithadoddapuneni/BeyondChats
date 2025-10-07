const axios = require('axios');

class YouTubeService {
  async searchVideos(query, maxResults = 5) {
    console.log(`Searching YouTube for videos related to: ${query}`);
    try {
      // Using YouTube Data API v3 (you'll need to add your API key in .env)
      const apiKey = process.env.YOUTUBE_API_KEY;
      
      if (!apiKey) {
        // Fallback: return sample recommendations
        return this.getSampleVideos(query);
      }

      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: query + ' tutorial education',
          type: 'video',
          maxResults,
          key: apiKey,
          relevanceLanguage: 'en',
          safeSearch: 'strict'
        }
      });

      return response.data.items.map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }));
    } catch (error) {
      console.error('YouTube API Error:', error);
      return this.getSampleVideos(query);
    }
  }

  getSampleVideos(query) {
    // Fallback sample data (3 videos)
    return [
      {
        videoId: 'sample1',
        title: `Learn ${query} - Complete Tutorial`,
        description: 'Educational video about ' + query,
        thumbnail: 'https://via.placeholder.com/320x180?text=Video+1',
        url: 'https://www.youtube.com/'
      },
      {
        videoId: 'sample2',
        title: `Introduction to ${query}`,
        description: 'Introductory video for ' + query,
        thumbnail: 'https://via.placeholder.com/320x180?text=Video+2',
        url: 'https://www.youtube.com/'
      },
      {
        videoId: 'sample3',
        title: `${query} Explained Simply`,
        description: 'Simple explanation of ' + query,
        thumbnail: 'https://via.placeholder.com/320x180?text=Video+3',
        url: 'https://www.youtube.com/'
      }
    ];
  }
}

module.exports = YouTubeService;
