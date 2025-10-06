const { PdfChunk } = require('../models/models');

class RAGService {
  // Chunk PDF text into smaller pieces
  *chunkTextGenerator(text, chunkSize = 3000, overlap = 200) {
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      yield text.slice(start, end);
      start = end - overlap;
    }
  }

  // Store chunks in database
  async storeChunks(pdfId, text, pageNumber = 1, chunkSize = 3000) {
    const BATCH_SIZE = 100;
    let totalInserted = 0;
    let batch = [];
    let chunkIndex = 0;
    for (const chunk of this.chunkTextGenerator(text, chunkSize, 200)) {
      batch.push({
        pdfId,
        pageNumber,
        chunkIndex,
        text: chunk,
        embedding: []
      });
      chunkIndex++;
      if (batch.length === BATCH_SIZE) {
        await PdfChunk.insertMany(batch);
        totalInserted += batch.length;
        if ((Math.ceil(chunkIndex/BATCH_SIZE) % 100) === 0) {
          console.log(`Inserted batch ${Math.ceil(chunkIndex/BATCH_SIZE)}: ${batch.length} chunks`);
        }
        batch = [];
      }
    }
    if (batch.length > 0) {
      await PdfChunk.insertMany(batch);
      totalInserted += batch.length;
      console.log(`Inserted final batch: ${batch.length} chunks`);
    }
    return totalInserted;
  }

  // Simple keyword-based search (can be upgraded to vector search)
  async searchChunks(pdfId, query, limit = 5) {
    const keywords = query.toLowerCase().split(' ');
    
    const chunks = await PdfChunk.find({ pdfId })
      .limit(50) // Get more chunks for better filtering
      .lean();
    
    console.log(`Found ${chunks.length} chunks for PDF ${pdfId}`);
    if (chunks.length > 0) {
      console.log('First chunk example:', chunks[0]);
    }

    // Score chunks based on keyword matches
    const scoredChunks = chunks.map(chunk => {
      const text = chunk.text.toLowerCase();
      const score = keywords.reduce((acc, keyword) => {
        return acc + (text.includes(keyword) ? 1 : 0);
      }, 0);
      
      return { ...chunk, score };
    });

    console.log('Search query:', query);
    console.log('Scored chunks:', scoredChunks.length);

    // Sort by score and return top results
    const topChunks = scoredChunks
      .filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    console.log('Top chunks found:', topChunks.length);
    if (topChunks.length > 0) {
      console.log('Top chunk example:', topChunks[0]);
    }

    return topChunks;
  }
}

module.exports = RAGService;
