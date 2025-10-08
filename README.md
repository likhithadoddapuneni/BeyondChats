# BeyondChats: School Revision Web App

This repository contains a fully functional, responsive web application designed to help school students revise from their coursebooks. The app leverages modern web technologies and heavy usage of LLM coding tools to quickly build and iterate on features. It includes features such as a source selector, integrated PDF viewer, quiz generation engine, progress tracking dashboard, chat-based virtual teacher support, and a YouTube video recommender.

## Features

### A. Must-Have Features

#### Source Selector
- Simple selector to choose: "All uploaded PDFs" or "Specific PDF"
- Pre-seeded with PDFs from NCERT Class XI Physics
- Supports uploading custom PDF coursebooks

#### PDF Viewer
- Displays the selected PDF alongside a chat window (either in a tab or split view)

#### Quiz Generator Engine
- Generates multiple choice questions (MCQs), short answer questions (SAQs), and long answer questions (LAQs) from the selected/uploaded PDFs
- Renders quizzes, captures user answers, scores submissions, and provides explanations
- Option to generate a new set of questions

#### Progress Tracking
- Tracks and stores user strengths and weaknesses through quizzes
- Provides a dashboard to monitor the learning journey

### B. Nice-to-Have Features

#### Chat UI (ChatGPT-inspired)
- Virtual teacher/teaching companion
- Contains a left drawer for chat history, a main chat window, and an input box
- Supports starting a new chat and switching between existing chats
- Designed with a clean, mobile-responsive UI

#### RAG Answers with Citations
- Ingests selected PDF(s), performs chunking and embedding
- Chatbot responses include citations with page numbers and quoted snippets

#### YouTube Videos Recommender
- Suggests educational YouTube videos relevant to the selected/uploaded PDFs

## How to Run

### Local Setup

**1. Clone the Repository**

git clone https://github.com/likhithadoddapuneni/BeyondChats.git
cd BeyondChats

**2. Backend Setup**

Navigate to the backend folder:

cd backend
npm install

Create a `.env` file (if required) and configure it.

Start the backend server:

npm start

**3. Frontend Setup**

Open a new terminal and navigate to the frontend folder:

cd frontend
npm install

Start the development server:

npm start

### Deployment Details

- **Backend**: Deployed on Render
- **Frontend**: Deployed on Vercel at https://beyond-chats-hazel.vercel.app/

## Project Structure

├── backend
│   ├── models
│   │   └── models.js
│   ├── routes
│   │   ├── chatRoutes.js
│   │   ├── pdfRoutes.js
│   │   ├── progressRoutes.js
│   │   └── quizRoutes.js
│   ├── server.js
│   └── package.json
└── frontend
    ├── public
    │   └── index.html
    ├── src
    │   ├── App.js
    │   ├── App.css
    │   ├── index.js
    │   └── components
    │       ├── ChatUI.js
    │       ├── Layout.js
    │       ├── PdfViewer.js
    │       ├── ProgressDashboard.js
    │       ├── QuizGenerator.js
    │       ├── SourceSelector.js
    │       └── YouTubeRecommender.js
    └── package.json

## How It Was Built

- **Backend**: Built using Node.js, Express, and Mongoose for MongoDB. Implemented endpoints to support multi-session chat functionality with unique session IDs (using the uuid package)
- **Frontend**: Built using React for a responsive interface. The app handles simultaneous display of PDFs and chat, dynamic quiz generation, progress tracking, and caters to user interactivity by storing session data for persistence across refreshes
- **LLM Usage**: Leveraged LLM coding tools to rapidly develop and iterate on features such as the chat interface and quiz engine

## What's Done and What's Missing

### Completed
- Complete implementation of must-have features: source selector, PDF viewer, quiz generation engine, progress tracking
- Nice-to-have features like the Chat UI and YouTube video recommender have been implemented with emphasis on responsiveness and clean design
- Multi-session chat functionality with persistent session data
- Backend and frontend deployed on Render and Vercel respectively

### Missing/To Improve
- Further UI/UX enhancements for mobile responsiveness and visual polish
- Additional testing and refinements in areas of scalability and error handling
- Further optimization in leveraging LLM tools for feature expansion

## Development Journey

The development process was fully tracked via verifiable commits. Each significant change—from initial scaffolding to final feature adjustments—can be reviewed in the commit history.

Decisions on the technology stack and architectural design were informed by both rapid prototyping and iterative feedback sessions.

## Live Demo

🚀 **[Try BeyondChats Live](https://beyond-chats-hazel.vercel.app/)**

## Acknowledgments

Thanks to the BeyondChats team for this challenging assignment. I look forward to the opportunity to work alongside you.

All code written is my property, and the submission reflects my best efforts in terms of coding, design, and problem-solving.

---

**Good luck and Happy Revising!**
