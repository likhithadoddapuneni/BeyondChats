
// const axios = require('axios');

// class GeminiService {
//   constructor(apiKey) {
//     if (!apiKey) {
//       throw new Error('Gemini API key is missing. Please set GEMINI_API_KEY in your environment.');
//     }
//     this.apiKey = apiKey;
//     this.baseURL = 'https://generativelanguage.googleapis.com/v1';
//   }

//   async generateQuiz(textContent, quizType, numQuestions = 5) {
//     const prompt = this.buildQuizPrompt(textContent, quizType, numQuestions);
//     try {
//       const response = await axios.post(
//         `${this.baseURL}/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
//         {
//           contents: [{
//             parts: [{ text: prompt }]
//           }],
//           generationConfig: {
//             temperature: 0.7,
//             maxOutputTokens: 2048,
//           }
//         }
//       );
//       const generatedText = response.data.candidates[0].content.parts[0].text;
//       return this.parseQuizResponse(generatedText, quizType);
//     } catch (error) {
//       console.error('Gemini API Error:', error.response?.data || error.message);
//       throw new Error('Failed to generate quiz');
//     }
//   }

//   buildQuizPrompt(textContent, quizType, numQuestions) {
//     const typeDescriptions = {
//       MCQ: 'Multiple Choice Questions with 4 options each',
//       SAQ: 'Short Answer Questions',
//       LAQ: 'Long Answer Questions'
//     };
//     return `Based on the following educational content, generate ${numQuestions} ${typeDescriptions[quizType]}.

// Content:
// ${textContent.slice(0, 3000)}

// Generate exactly ${numQuestions} questions in JSON format with the following structure:
// [
//   {
//     "question": "Question text here",
//     ${quizType === 'MCQ' ? '"options": ["Option A", "Option B", "Option C", "Option D"],' : ''}
//     "correctAnswer": "Correct answer here",
//     "explanation": "Detailed explanation of the answer",
//     "topic": "Main topic of this question"
//   }
// ]

// Return ONLY valid JSON array, no additional text.`;
//   }

//   parseQuizResponse(text, quizType) {
//     try {
//       // Remove all markdown code block markers and trim
//       console.log('Raw response text:', text);
//       let cleanText = text.replace(/```[a-zA-Z]*\n?|```/g, '').trim();

//       // Try to parse directly if it looks like a JSON array
//       if (cleanText.startsWith('[') && cleanText.endsWith(']')) {
//         const questions = JSON.parse(cleanText);
//         return questions.map(q => ({
//           question: q.question,
//           options: quizType === 'MCQ' ? q.options : null,
//           correctAnswer: q.correctAnswer,
//           explanation: q.explanation,
//           topic: q.topic || 'General'
//         }));
//       }

//       // Otherwise, extract the first JSON array from the response
//       const match = cleanText.match(/\[\s*{[\s\S]*?}\s*\]/);
//       if (!match) throw new Error('No JSON array found in response');
//       const jsonArray = match[0];
//       const questions = JSON.parse(jsonArray);
//       return questions.map(q => ({
//         question: q.question,
//         options: quizType === 'MCQ' ? q.options : null,
//         correctAnswer: q.correctAnswer,
//         explanation: q.explanation,
//         topic: q.topic || 'General'
//       }));
//     } catch (error) {
//       console.error('Parse error:', error);
//       throw new Error('Failed to parse quiz questions');
//     }
//   }

//   async generateChatResponse(userMessage, pdfContext) {
//     const prompt = `You are a helpful tutor assistant. Based on the following coursebook content, answer the student's question clearly and concisely.\n\nCoursebook Content:\n${pdfContext.slice(0, 2000)}\n\nStudent Question: ${userMessage}\n\nProvide a clear answer with citations from the content when applicable.`;
//     try {
//       const response = await axios.post(
//         `${this.baseURL}/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
//         {
//           contents: [{
//             parts: [{ text: prompt }]
//           }],
//           generationConfig: {
//             temperature: 0.7,
//             maxOutputTokens: 2048,
//           }
//         }
//       );
//       return response.data.candidates[0].content.parts[0].text;
//     } catch (error) {
//       console.error('Gemini API Error:', error.response?.data || error.message);
//       throw new Error('Failed to generate response');
//     }
//   }

//   // NEW METHOD: RAG-based chat response with citations
//   async generateChatResponseWithRAG(userMessage, relevantChunks) {
//     // Build context from relevant chunks with page numbers
//     const context = relevantChunks.map((chunk, i) => 
//       `[Page ${chunk.pageNumber}, Section ${i+1}]: "${chunk.text}"`
//     ).join('\n\n');

//     const prompt = `You are a helpful tutor assistant. Answer the student's question using ONLY the information from the coursebook provided below. Always cite the page number and quote the relevant text when answering.\n\nCoursebook Content:\n${context}\n\nStudent Question: ${userMessage}\n\nInstructions:\n1. Answer clearly and concisely using ONLY the provided coursebook content\n2. Always cite page numbers like "According to Page X: '...'"\n3. Quote 2-3 relevant lines from the source text\n4. If the answer is not in the provided content, say "I don't have information about this in the selected coursebook. Please try rephrasing your question or select a different section."\n5. Be educational and helpful in your explanations\n\nAnswer:`;

//     try {
//       const response = await axios.post(
//         `${this.baseURL}/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
//         {
//           contents: [{
//             parts: [{ text: prompt }]
//           }],
//           generationConfig: {
//             temperature: 0.3,
//             maxOutputTokens: 1024,
//           }
//         }
//       );
//       return response.data.candidates[0].content.parts[0].text;
//     } catch (error) {
//       console.error('Gemini API Error:', error.response?.data || error.message);
//       throw new Error('Failed to generate response with RAG');
//     }
//   }
// }

// module.exports = GeminiService;


