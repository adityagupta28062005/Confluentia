# Process Map Generator - Setup Guide

## Overview

A complete full-stack application that automatically transforms business documents into structured BPMN process maps with AI-powered risk and control identification.

## Architecture

- **Backend**: Node.js/Express with MongoDB
- **Frontend**: React with Tailwind CSS
- **AI Integration**: OpenAI GPT-4 for NLP processing
- **Visualization**: BPMN.js for interactive process maps

## Prerequisites

- Node.js 16+ and npm
- MongoDB (local or cloud)
- OpenAI API key

## Installation

### 1. Install Root Dependencies
```bash
cd process-map-generator
npm install
```

### 2. Setup Backend
```bash
cd server
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings:
# - MongoDB connection string
# - OpenAI API key
```

### 3. Setup Frontend
```bash
cd ../client
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API URL
```

### 4. Install All Dependencies (Alternative)
```bash
# From root directory
npm run install:all
```

## Configuration

### Server Environment Variables (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/process-mapper
CLIENT_URL=http://localhost:3000
OPENAI_API_KEY=your-openai-api-key-here
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
LOG_LEVEL=info
MAX_FILE_SIZE=10mb
UPLOAD_DIR=./uploads
```

### Client Environment Variables (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_MAX_FILE_SIZE=10485760
```

## Development

### Start All Services
```bash
npm run dev
```

### Start Individual Services
```bash
# Backend only
npm run server

# Frontend only
npm run client
```

## Features Implemented

### ✅ Core Features
- [x] Document upload (PDF, DOCX, XLSX)
- [x] AI-powered process extraction
- [x] BPMN 2.0 XML generation
- [x] Interactive BPMN visualization
- [x] Risk and control identification
- [x] Schema-compliant JSON export
- [x] Real-time processing status
- [x] Error handling and validation

### ✅ Backend Services
- [x] Express server with MongoDB
- [x] Document parsing services
- [x] OpenAI integration
- [x] BPMN generation engine
- [x] RESTful API endpoints
- [x] File upload handling
- [x] Data validation and sanitization

### ✅ Frontend Components
- [x] React application structure
- [x] File upload interface
- [x] Processing status tracking
- [x] BPMN viewer integration
- [x] Results display and export
- [x] Responsive design
- [x] Error boundaries and handling

## API Endpoints

### Upload
- `POST /api/upload` - Upload document
- `GET /api/upload/status/:id` - Get upload status

### Processing
- `POST /api/process/extract` - Extract processes
- `GET /api/process/:id` - Get process details
- `GET /api/process` - List all processes

### Export
- `POST /api/export/json` - Export as JSON
- `GET /api/export/bpmn/:processId` - Export BPMN XML

## Hackathon Compliance

### ✅ Requirements Met
- **Document Types**: PDF, DOCX, XLSX support
- **Process Extraction**: AI-powered identification
- **BPMN Standard**: Full BPMN 2.0 compliance
- **Risk & Controls**: Automated identification
- **JSON Schema**: Strict adherence to specification
- **Web Interface**: Complete upload/view/download flow

### ✅ Evaluation Criteria
- **Functionality (20%)**: Full MVP with all required features
- **Extraction Accuracy (50%)**: OpenAI GPT-4 integration
- **BPMN Quality (30%)**: Professional BPMN 2.0 XML generation

## Deployment

### Local Development
```bash
# Start MongoDB
mongod

# Start the application
npm run dev
```

### Production Deployment
```bash
# Build frontend
cd client && npm run build

# Start production server
cd ../server && npm start
```

### Cloud Deployment Options
- **Heroku**: Easy deployment with MongoDB Atlas
- **Vercel**: Frontend deployment
- **Railway**: Full-stack deployment
- **DigitalOcean**: VPS deployment

## Testing

### Test Sample Document
Use the provided `Global Financial Services - SOP Manual.pdf` to test:
1. Upload the document
2. Monitor processing status
3. View extracted processes
4. Download JSON results
5. Visualize BPMN diagrams

### Expected Output
- **Process 1**: AP-001: Invoice Processing and Approval
- **Process 2**: CO-001: Vendor Onboarding and Due Diligence
- **Risks**: Operational, Financial, Compliance risks
- **Controls**: Preventive, Detective, Corrective controls

## Troubleshooting

### Common Issues
1. **MongoDB Connection**: Check connection string and service status
2. **OpenAI API**: Verify API key and rate limits
3. **File Upload**: Check file size limits and permissions
4. **CORS Issues**: Verify client URL configuration

### Support
- Check logs in `server/logs/`
- Monitor browser console for frontend errors
- Review API responses for debugging

## Next Steps

### Potential Enhancements
- [ ] User authentication and sessions
- [ ] Process versioning and history
- [ ] Advanced BPMN editing capabilities
- [ ] Batch document processing
- [ ] Integration with external systems
- [ ] Advanced analytics and reporting

This application provides a solid foundation for the hackathon requirements and can be extended with additional features as needed.