# 🚀 Automated Process Map Generator

**IIT BHU Hackathon 2025 Submission**

An intelligent system that automates the transformation of unstructured business documents into structured, visual process maps with BPMN 2.0 standard, while identifying associated risks and controls using AI.

![Process Map Generator](https://img.shields.io/badge/Status-Complete-brightgreen)
![React](https://img.shields.io/badge/React-18.x-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-orange)

## ✨ Features

- 📄 **Document Processing**: PDF, DOCX, XLSX support with intelligent parsing
- 🤖 **AI-Powered Analysis**: GPT-4 integration for process extraction
- 🗺️ **Interactive BPMN**: Zoom, pan, fullscreen BPMN 2.0 diagrams
- ⚠️ **Risk & Control ID**: Automated identification with severity levels
- 📊 **Schema-Compliant Export**: JSON export matching exact requirements
- 🌐 **Modern Web Interface**: Responsive React application with Tailwind CSS

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   # Backend
   cd server && npm install
   
   # Frontend  
   cd ../client && npm install
   ```

2. **Set Environment Variables**
   ```bash
   # Copy and configure environment
   cp server/.env.example server/.env
   # Add your OpenAI API key to server/.env
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

4. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Technology Stack

- **Frontend**: React, bpmn-js, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **AI**: OpenAI GPT-4 for NLP processing
- **Visualization**: BPMN.js for interactive process maps

## Project Structure

```
process-map-generator/
├── client/          # React frontend
├── server/          # Node.js backend
├── shared/          # Shared types and schemas
└── docs/           # Documentation
```

## License

MIT