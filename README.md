# Social Media Content Analyzer

A web application that extracts text from PDF and image files and provides social media engagement suggestions.

## Development Environment
- **OS**: Windows 11
- **Editor**: VSCode  
- **Node.js**: v18+ 
- **Package Manager**: npm

## Project Structure
social-media-analyzer/
├── backend/ # Node.js API server
│ ├── server.js # Main server file
│ ├── package.json # Backend dependencies
│ └── .env # Backend environment variables
├── frontend/ # React TypeScript app
│ ├── src/ # Source files
│ ├── package.json # Frontend dependencies
│ └── .env # Frontend environment variables
└── README.md


## Tech Stack
- **Frontend**: React with TypeScript, React-Dropzone, Axios
- **Backend**: Node.js, Express, Multer, PDF-Parse, Tesseract.js
- **File Processing**: PDF parsing and OCR capabilities

## Windows Setup Instructions

### Backend Setup
cd backend
npm install
npm run dev


### Frontend Setup  
cd frontend
npm install
npm start


## VSCode Shortcuts
- `Ctrl + ` ` - Open integrated terminal
- `Ctrl + Shift + ` ` - New terminal
- `Ctrl + P` - Quick file open
- `Ctrl + Shift + P` - Command palette

## Development Progress
- [x] Day 1: Project setup and basic structure ✅
- [ ] Day 2: File upload interface
- [ ] Day 3: PDF text extraction
- [ ] Day 4: OCR implementation
- [ ] Day 5: Frontend integration  
- [ ] Day 6: Deployment and documentation

## Current Status (Day 1)
✅ Backend server running on http://localhost:5000  
✅ Frontend app running on http://localhost:3000
✅ Basic connection established between frontend and backend
✅ Windows 11 + VSCode development environment configured

## Next Steps
- Implement file upload functionality
- Add drag-and-drop interface
- Integrate PDF parsing
