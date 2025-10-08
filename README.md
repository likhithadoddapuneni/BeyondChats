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

1. **Clone the Repository**
