# 🚀 Social Media Content Analyzer

A modern, **AI-powered** web application that extracts and analyzes text from PDF documents and images using OCR technology, then provides intelligent social media engagement optimization suggestions. Built with **React**, **TypeScript**, **Node.js**, and **Tesseract.js**, with a stunning dark-purple glassmorphism UI.

---

## 🌐 Live Demo

[https://your-app-name.vercel.app](https://your-app-name.vercel.app)

## 🛠️ Features

### Document & Image Processing
- Drag & drop or click-to-browse uploads for PDF, JPG, and PNG files (max 10MB)  
- **PDF Parsing** via `pdf-parse` with formatting preservation  
- **OCR** via Tesseract.js for scanned images with confidence metrics  

### AI-Powered Analysis
- **Engagement Scoring** (0–100) with letter grades  
- **Optimization Suggestions**: hashtags, call-to-action, readability, length, and more  
- **Content Metrics**: word count, character count, paragraphs, OCR confidence  

### Modern UI/UX
- **Dark-purple glassmorphism design** with geometric background patterns  
- **Floating animated elements** for social posts, documents, hashtags, analytics, and OCR  
- **Responsive layout**: two-column analysis view collapses to one column on mobile  
- **Smooth animations** and hover effects throughout  
- **Clipboard & Download** buttons for extracted text  

## ⚡️ Technology Stack

| Frontend            | Backend                  | Deployment      |
|---------------------|--------------------------|-----------------|
| React 18 + TypeScript | Node.js + Express       | Vercel (frontend) |
| React Dropzone      | pdf-parse                | Render (backend) |
| Custom CSS (glassmorphism) | Tesseract.js OCR       |                 |
| Responsive design   | Multer file uploads      |                 |

## 🚀 Quick Start

1. **Clone** the repo  
git clone https://github.com/Yashuppal-15/social-media-content-analyzer.git
cd social-media-content-analyzer


2. **Backend**  
cd backend
npm install
cp .env.example .env
npm run dev

Server: http://localhost:5000


3. **Frontend**  
cd ../frontend
npm install
npm start

App: http://localhost:3000



4. **Environment Variables**  
- **Backend (.env)**  
  ```
  PORT=5000
  FRONTEND_URL=http://localhost:3000
  NODE_ENV=development
  ```
- **Frontend (.env)**  
  ```
  REACT_APP_API_URL=http://localhost:5000
  REACT_APP_NAME=Social Media Content Analyzer
  ```

## 📁 Project Structure
social-media-content-analyzer/
├── frontend/ # React + TypeScript SPA
│ ├── public/
│ ├── src/
│ │ ├── components/ # FileUpload, ResultsDisplay
│ │ ├── App.tsx
│ │ └── App.css
│ ├── .env.production
│ └── package.json
├── backend/ # Express API
│ ├── services/ # pdfService, ocrService, engagementService
│ ├── uploads/
│ ├── server.js
│ ├── .env.example
│ └── package.json
├── README.md
└── .gitignore


## 📊 API Endpoints

### POST `/api/extract`
- **Request**: `multipart/form-data` with `file` field (PDF/JPG/PNG)  
- **Response**:  
{
"success": true,
"type": "pdf"|"image",
"text": "Extracted text...",
"stats": { "words": 123, "characters": 789, "paragraphs": 4, "lines": 12 },
"ocr": { "confidence": 90, "recognizedWords": 120, "lowConfidenceWords": 3 },
"engagement": {
"score": 85,
"grade": "A",
"suggestions": [ /* array of suggestion objects / ],
"analysis": { / detailed analysis metrics */ }
}
}


### GET `/health`
- **Response**:
{
"status": "healthy",
"uptime": 12345,
"services": { "pdfParser": "available", "ocrEngine": "available", "engagementAnalyzer": "available" }
}



## ✅ Deployment

- **Frontend** on Vercel: automatic from `frontend/`  
- **Backend** on Render: `npm start` from `backend/`  
- Set production env variables accordingly  

## 🔮 Future Enhancements

- Multi-language OCR support  
- Batch file processing  
- AI-driven text rewriting via GPT  
- Export PDF/CSV reports  
- User accounts & history  
- Real-time progress via WebSockets  

---

Made with ❤️ by YASH UPPAL | GitHub: [Yashuppal-15](https://github.com/Yashuppal-15) | LinkedIn: [Your Profile]  

