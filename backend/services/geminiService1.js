
// // const axios = require('axios');

// // class OpenRouterService {
// //   constructor(apiKey) {
// //     this.apiKey = apiKey;
// //     this.baseURL = 'https://openrouter.ai/api/v1/chat/completions';
// //   }

// //   async generateQuiz(textContent, quizType, numQuestions = 5) {
// //     const prompt = this.buildQuizPrompt(textContent, quizType, numQuestions);
// //     try {
// //       const response = await axios.post(
// //         this.baseURL,
// //         {
// //           model: 'google/gemma-3n-e2b-it:free',
// //           messages: [
// //             {
// //               role: 'user',
// //               content: prompt
// //             }
// //           ]
// //         },
// //         {
// //           headers: {
// //             'Authorization': 'Bearer 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',
// //             'Content-Type': 'application/json'
// //           }
// //         }
// //       );
// //       const generatedText = response.data.choices[0].message.content;
// //       return this.parseQuizResponse(generatedText, quizType);
// //     } catch (error) {
// //       console.error('OpenRouter API Error:', error.response?.data || error.message);
// //       throw new Error('Failed to generate quiz');
// //     }
// //   }

// //   buildQuizPrompt(textContent, quizType, numQuestions) {
// //     const typeDescriptions = {
// //       MCQ: 'Multiple Choice Questions with 4 options each',
// //       SAQ: 'Short Answer Questions',
// //       LAQ: 'Long Answer Questions'
// //     };
// //     return `Based on the following educational content, generate ${numQuestions} ${typeDescriptions[quizType]}.

// // Content:
// // ${textContent.slice(0, 3000)}

// // Generate exactly ${numQuestions} questions in JSON format with the following structure:
// // [
// //   {
// //     "question": "Question text here",
// //     ${quizType === 'MCQ' ? '"options": ["Option A", "Option B", "Option C", "Option D"],' : ''}
// //     "correctAnswer": "Correct answer here",
// //     "explanation": "Detailed explanation of the answer",
// //     "topic": "Main topic of this question"
// //   }
// // ]

// // Return ONLY valid JSON array, no additional text.`;
// //   }

// //   parseQuizResponse(text, quizType) {
// //     try {
// //       // Remove markdown code block markers if present
// //       console.log('Raw response text:', text);
// //       let cleanText = text.trim();
// //       if (cleanText.startsWith('```')) {
// //         cleanText = cleanText.replace(/^```[a-zA-Z]*\n?|```$/g, '').trim();
// //       }

// //       // Try to parse directly if it looks like a JSON array
// //       if (cleanText.startsWith('[') && cleanText.endsWith(']')) {
// //         const questions = JSON.parse(cleanText);
// //         return questions.map(q => ({
// //           question: q.question,
// //           options: quizType === 'MCQ' ? q.options : null,
// //           correctAnswer: q.correctAnswer,
// //           explanation: q.explanation,
// //           topic: q.topic || 'General'
// //         }));
// //       }

// //       // Otherwise, extract the first JSON array from the response
// //       const match = cleanText.match(/\[\s*{[\s\S]*?}\s*\]/);
// //       if (!match) throw new Error('No JSON array found in response');
// //       const jsonArray = match[0];
// //       const questions = JSON.parse(jsonArray);
// //       return questions.map(q => ({
// //         question: q.question,
// //         options: quizType === 'MCQ' ? q.options : null,
// //         correctAnswer: q.correctAnswer,
// //         explanation: q.explanation,
// //         topic: q.topic || 'General'
// //       }));
// //     } catch (error) {
// //       console.error('Parse error:', error);
// //       throw new Error('Failed to parse quiz questions');
// //     }
// //   }

// //   async generateChatResponse(userMessage, pdfContext) {
// //     const prompt = `You are a helpful tutor assistant. Based on the following coursebook content, answer the student's question clearly and concisely.\n\nCoursebook Content:\n${pdfContext.slice(0, 2000)}\n\nStudent Question: ${userMessage}\n\nProvide a clear answer with citations from the content when applicable.`;
// //     try {
// //       const response = await axios.post(
// //         this.baseURL,
// //         {
// //           model: 'google/gemma-3n-e2b-it:free',
// //           messages: [
// //             {
// //               role: 'user',
// //               content: prompt
// //             }
// //           ]
// //         },
// //         {
// //           headers: {
// //             'Authorization': 'Bearer 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',
// //             'Content-Type': 'application/json'
// //           }
// //         }
// //       );
// //       return response.data.choices[0].message.content;
// //     } catch (error) {
// //       console.error('OpenRouter API Error:', error.response?.data || error.message);
// //       throw new Error('Failed to generate response');
// //     }
// //   }
// // }

// // module.exports = OpenRouterService;




// const axios = require('axios');

// class OpenRouterService {
//   constructor(apiKey) {
//     this.apiKey = apiKey;
//     this.baseURL = 'https://openrouter.ai/api/v1/chat/completions';
//   }

//   async generateQuiz(textContent, quizType, numQuestions = 5) {
//     const prompt = this.buildQuizPrompt(textContent, quizType, numQuestions);
//     try {
//       const response = await axios.post(
//         this.baseURL,
//         {
//           model: 'google/gemma-3n-e2b-it:free',
//           messages: [
//             {
//               role: 'user',
//               content: prompt
//             }
//           ]
//         },
//         {
//           headers: {
//             'Authorization': `Bearer ${this.apiKey}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
//       const generatedText = response.data.choices[0].message.content;
//       return this.parseQuizResponse(generatedText, quizType);
//     } catch (error) {
//       console.error('OpenRouter API Error:', error.response?.data || error.message);
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
//       // Remove markdown code block markers if present
//       console.log('Raw response text:', text);
//       let cleanText = text.trim();
//       if (cleanText.startsWith('```
//         cleanText = cleanText.replace(/^```[a-zA-Z]*\n?|```
// }

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
//       const match = cleanText.match(/$$\s*{[\s\S]*?}\s*$$/);
//       if (!match) throw new Error('No JSON array found in response');
//       const jsonArray = match;
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
//     const prompt = `You are a helpful tutor assistant. Based on the following coursebook content, answer the student's question clearly and concisely.

// Coursebook Content:
// ${pdfContext.slice(0, 2000)}

// Student Question: ${userMessage}

// Provide a clear answer with citations from the content when applicable.`;

//     try {
//       const response = await axios.post(
//         this.baseURL,
//         {
//           model: 'google/gemma-3n-e2b-it:free',
//           messages: [
//             {
//               role: 'user',
//               content: prompt
//             }
//           ]
//         },
//         {
//           headers: {
//             'Authorization': `Bearer ${this.apiKey}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
//       return response.data.choices.message.content;
//     } catch (error) {
//       console.error('OpenRouter API Error:', error.response?.data || error.message);
//       throw new Error('Failed to generate response');
//     }
//   }

//   // NEW METHOD: RAG-based chat response with citations
//   async generateChatResponseWithRAG(userMessage, relevantChunks) {
//     // Build context from relevant chunks with page numbers
//     const context = relevantChunks.map((chunk, i) => 
//       `[Page ${chunk.pageNumber}, Section ${i+1}]: "${chunk.text}"`
//     ).join('\n\n');

//     const prompt = `You are a helpful tutor assistant. Answer the student's question using ONLY the information from the coursebook provided below. Always cite the page number and quote the relevant text when answering.

// Coursebook Content:
// ${context}

// Student Question: ${userMessage}

// Instructions:
// 1. Answer clearly and concisely using ONLY the provided coursebook content
// 2. Always cite page numbers like "According to Page X: '...'"
// 3. Quote 2-3 relevant lines from the source text
// 4. If the answer is not in the provided content, say "I don't have information about this in the selected coursebook. Please try rephrasing your question or select a different section."
// 5. Be educational and helpful in your explanations

// Answer:`;

//     try {
//       const response = await axios.post(
//         this.baseURL,
//         {
//           model: 'google/gemma-3n-e2b-it:free',
//           messages: [
//             {
//               role: 'system',
//               content: 'You are an educational tutor assistant that provides accurate answers with citations from coursebook content.'
//             },
//             {
//               role: 'user',
//               content: prompt
//             }
//           ],
//           temperature: 0.3, // Lower temperature for more factual responses
//           max_tokens: 1024
//         },
//         {
//           headers: {
//             'Authorization': `Bearer ${this.apiKey}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       return response.data.choices.message.content;
//     } catch (error) {
//       console.error('OpenRouter API Error:', error.response?.data || error.message);
//       throw new Error('Failed to generate response with RAG');
//     }
//   }
// }

// module.exports = OpenRouterService;
