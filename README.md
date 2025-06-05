# PDF Chatbot

A modern web application that allows users to upload multiple PDF files and chat with them intelligently. The application uses local processing for all operations, ensuring privacy and offline functionality.

## Features

- 📄 Multiple PDF upload with drag-and-drop support
- 💬 Interactive chat interface with typing effects
- 🌓 Light/Dark theme toggle
- 📚 PDF management sidebar
- 🔍 Smart text extraction and chunking
- 🧠 Local vector search using FAISS
- 📊 Source attribution with page numbers
- 🎨 Modern UI with Material-UI components

## Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn

## Setup

### Backend Setup

1. Create a virtual environment:
```bash
python -m venv backend_venv
source backend_venv/bin/activate  # On Windows: backend_venv\Scripts\activate
```

2. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Start the backend server:
```bash
python main.py
```

The backend server will run on http://localhost:8000

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

The frontend will run on http://localhost:3000

## Usage

1. Open http://localhost:3000 in your browser
2. Drag and drop PDF files or click to select them
3. Wait for the files to be processed (you'll see a status indicator)
4. Select the PDFs you want to chat with using the checkboxes in the sidebar
5. Type your questions in the chat interface
6. View the responses with source attribution and page numbers

## Technical Details

- Frontend: React with TypeScript, Material-UI
- Backend: FastAPI
- PDF Processing: PyMuPDF
- Text Embeddings: sentence-transformers
- Vector Search: FAISS
- File Storage: Local filesystem


