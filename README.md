# 🚀 Confluentia - Automated Process Map Generator

**IIT BHU Hackathon 2025 MVP Submission**

An intelligent AI-powered system that transforms business documents into professional BPMN process maps in under 30 seconds, featuring value-based approval routing and enterprise-grade visualization.

![Process Map Generator](https://img.shields.io/badge/Status-MVP_Complete-brightgreen)
![React](https://img.shields.io/badge/React-18.x-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-Cloud-green)
![Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-orange)
![Deployed](https://img.shields.io/badge/Deployed-Render-purple)

## 🎯 MVP SUBMISSION & SHOWCASE

### 📌 **Working MVP (Hosted Project)**
🌐 **Live Demo**: [https://confluentia-frontend.onrender.com](https://confluentia-frontend.onrender.com)
🔗 **Backend API**: [https://confluentia-1.onrender.com](https://confluentia-1.onrender.com)

### 📁 **Repository & Documentation**
📂 **GitHub Repository**: [https://github.com/adityagupta28062005/Confluentia](https://github.com/adityagupta28062005/Confluentia)
📖 **Complete Setup Guide**: See [Quick Start](#-quick-start) section below

### 📊 **5-Slide MVP Presentation**

#### **Slide 1: Problem Statement**
- **Challenge**: Manual process mapping takes days/weeks, prone to errors, lacks standardization
- **Pain Point**: Organizations spend thousands of hours on process documentation with inconsistent results
- **Market Gap**: No solution automatically generates professional BPMN from existing business documents

#### **Slide 2: Key Insight**
- **Discovery**: Companies already have process knowledge in SOPs, policies, and procedures
- **Intelligence**: Different process types need different approval thresholds (expense vs invoice routing)
- **Opportunity**: AI can understand business context and generate value-based approval workflows

#### **Slide 3: Solution - Confluentia**
- **AI-Powered**: Google Gemini 1.5 Flash analyzes documents and extracts process intelligence
- **Smart Routing**: Automatic value-based approval workflows (expense: $500/$2K, invoice: $5K/$25K)
- **Professional Output**: Industry-standard BPMN 2.0 with visual decision points and clean layout
- **Instant Results**: 30-second transformation from document to professional process map

#### **Slide 4: Live Demo**
- **Upload**: Drag & drop business document (PDF/DOCX/TXT)
- **Process**: AI analyzes and detects process type automatically
- **Generate**: Professional BPMN with proper branching logic and approval routing
- **Export**: SVG for presentations, JSON for system integration

#### **Slide 5: Next Steps**
- **Short-term**: Enterprise integrations with major BPM platforms (SAP, Oracle)
- **Medium-term**: Multi-language support and industry-specific templates
- **Long-term**: Process optimization AI and compliance automation
- **Market**: Target $10B+ BPM market with SaaS model and consulting partnerships

---

## ✨ Key Features & Innovations

### 🧠 **AI Intelligence**
- **Document Processing**: PDF, DOCX, TXT support with intelligent text extraction
- **Context Understanding**: Gemini 1.5 Flash recognizes business process patterns
- **Process Classification**: Automatic detection of expense, invoice, vendor processes
- **Value-Based Routing**: AI extracts approval thresholds and creates conditional workflows

### 🗺️ **Professional BPMN Generation**
- **Industry Standard**: BPMN 2.0 compliant XML output
- **Visual Excellence**: Red cross markers on decision gateways, perfect alignment
- **Smart Layout**: Automatic positioning with horizontal flow and proper spacing
- **Export Options**: SVG for presentations, JSON for system integration

### 🔧 **Enterprise Architecture**
- **Cloud-Native**: Deployed on Render with MongoDB Atlas
- **Scalable**: Handles concurrent users and large documents
- **Secure**: Environment-based configuration and secure file handling
- **Standards-Compliant**: Works with all major BPM platforms

## 🤖 AI Tools & Technologies Used

### **Primary AI Integration**
- **Google Gemini 1.5 Flash**: Document analysis and process extraction
- **Prompt Engineering**: Sophisticated business context understanding
- **Structured Output**: JSON generation with business rule intelligence

### **Technical Stack**
- **Frontend**: React 18.x, BPMN.js, Tailwind CSS, Axios
- **Backend**: Node.js, Express, MongoDB Atlas, Multer
- **AI Processing**: Google Generative AI SDK, PDF-parse, Mammoth.js
- **Deployment**: Render (Frontend + Backend), MongoDB Atlas (Database)
- **Visualization**: bpmn-js for interactive process diagrams

## 🚀 Quick Start & Setup

### **Prerequisites**
- Node.js 18.x or higher
- MongoDB Atlas account (for local development)
- Google Gemini API key

### **Installation Steps**

1. **Clone Repository**
   ```bash
   git clone https://github.com/adityagupta28062005/Confluentia.git
   cd Confluentia/process-map-generator
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Configuration**
   ```bash
   # Backend environment (server/.env)
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   CLIENT_URL=http://localhost:3000
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   
   # Frontend environment (client/.env)
   REACT_APP_API_URL=http://localhost:5000/api
   ```

5. **Start Development Environment**
   ```bash
   # From project root
   npm run dev
   ```

6. **Access Application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000
   - **Health Check**: http://localhost:5000/health

### **Production Deployment**
- **Frontend**: Deployed on Render Static Site
- **Backend**: Deployed on Render Web Service  
- **Database**: MongoDB Atlas Cloud Database
- **Environment**: Production-ready with secure configuration

## 🎯 Problem-Solution Fit

### **Problem Addressed**
- **Time Inefficiency**: Manual process mapping takes days to weeks
- **Inconsistency**: Human interpretation leads to varying results
- **Compliance Gaps**: Missing proper approval workflows and decision points
- **Resource Waste**: Expensive consultant hours for basic documentation

### **Solution Benefits**
- **Speed**: 30-second generation vs weeks of manual work
- **Consistency**: AI provides standardized, professional output
- **Intelligence**: Automatic value-based routing based on process type
- **Quality**: Industry-standard BPMN 2.0 with proper visual notation
- **Integration**: Immediate export for existing BPM systems

### **Market Impact**
- **Target Market**: Mid-to-large enterprises, consulting firms, compliance teams
- **Value Proposition**: 90%+ time savings with professional-grade results
- **Revenue Model**: SaaS subscriptions, professional services, API licensing
- **Competitive Advantage**: Only solution combining AI document analysis with intelligent workflow generation

## 📈 Technical Achievements

### **AI Integration Excellence**
- Production-ready Gemini 1.5 Flash integration
- Sophisticated prompt engineering for business context
- Intelligent process type detection and routing logic
- Structured JSON output with business rule compliance

### **Software Engineering Quality**
- Full-stack TypeScript/JavaScript application
- RESTful API design with proper error handling
- Cloud-native architecture with MongoDB Atlas
- Industry-standard BPMN 2.0 XML generation
- Professional UI/UX with responsive design

### **Innovation Highlights**
- **Value-Based Routing Intelligence**: AI understands different approval thresholds
- **Process Type Classification**: Automatic workflow selection based on content
- **Visual Excellence**: Professional diagrams with perfect alignment and notation
- **Export Versatility**: Multiple formats for immediate business use

## 📊 Project Structure

```
Confluentia/
├── process-map-generator/
│   ├── client/                     # React Frontend Application
│   │   ├── public/
│   │   │   ├── index.html         # Main HTML template
│   │   │   ├── manifest.json      # PWA manifest
│   │   │   └── confluentia-logo.png # App favicon and logo
│   │   ├── src/
│   │   │   ├── components/        # Reusable UI Components
│   │   │   │   ├── common/        # Shared components
│   │   │   │   │   ├── Header.jsx # App header with branding
│   │   │   │   │   └── Footer.jsx # App footer with attribution
│   │   │   │   ├── FileUpload.jsx # Drag & drop file upload
│   │   │   │   ├── BpmnViewer.jsx # BPMN diagram visualization
│   │   │   │   └── ResultsPanel.jsx # Process results display
│   │   │   ├── pages/             # Application Pages
│   │   │   │   └── Home.jsx       # Main application page
│   │   │   ├── services/          # API Integration
│   │   │   │   └── api.js         # Axios API client configuration
│   │   │   ├── context/           # React Context
│   │   │   │   └── ProcessContext.jsx # Global state management
│   │   │   ├── styles/            # CSS and Styling
│   │   │   │   ├── animations.css # Custom animations
│   │   │   │   └── index.css      # Tailwind CSS imports
│   │   │   ├── App.jsx            # Main React application
│   │   │   └── index.js           # React DOM entry point
│   │   ├── package.json           # Frontend dependencies
│   │   └── .env                   # Frontend environment variables
│   │
│   ├── server/                     # Node.js Backend Application
│   │   ├── src/
│   │   │   ├── routes/            # API Route Handlers
│   │   │   │   ├── documents.js   # Document upload/processing routes
│   │   │   │   ├── processes.js   # Process data routes
│   │   │   │   └── index.js       # Main router configuration
│   │   │   ├── services/          # Business Logic Services
│   │   │   │   ├── bpmn/          # BPMN Generation
│   │   │   │   │   ├── bpmnGenerator.js # Main BPMN XML generator
│   │   │   │   │   └── layoutEngine.js  # Diagram layout engine
│   │   │   │   ├── gemini/        # AI Integration
│   │   │   │   │   ├── geminiService.js # Google Gemini API client
│   │   │   │   │   └── prompts.js      # AI prompt templates
│   │   │   │   ├── documentProcessor.js # File parsing service
│   │   │   │   └── database/      # Database Services
│   │   │   │       └── connection.js   # MongoDB connection
│   │   │   ├── models/            # Database Models
│   │   │   │   ├── Document.js    # Document schema
│   │   │   │   └── Process.js     # Process data schema
│   │   │   ├── middleware/        # Express Middleware
│   │   │   │   ├── upload.js      # File upload middleware
│   │   │   │   ├── auth.js        # Authentication middleware
│   │   │   │   └── errorHandler.js # Global error handling
│   │   │   ├── utils/             # Utility Functions
│   │   │   │   ├── logger.js      # Winston logging configuration
│   │   │   │   └── helpers.js     # Common helper functions
│   │   │   └── app.js             # Express app configuration
│   │   ├── uploads/               # File Storage Directory
│   │   │   └── .gitkeep          # Keep directory in git
│   │   ├── server.js              # Server entry point
│   │   ├── package.json           # Backend dependencies
│   │   ├── .env                   # Backend environment variables
│   │   └── build.sh               # Render deployment script
│   │
│   ├── shared/                     # Shared Resources
│   │   ├── types/                 # TypeScript type definitions
│   │   └── schemas/               # JSON schemas
│   │
│   ├── docs/                       # Documentation
│   │   ├── api.md                 # API documentation
│   │   └── deployment.md          # Deployment guide
│   │
│   ├── scripts/                    # Build and deployment scripts
│   │   └── deploy.sh              # Deployment automation
│   │
│   ├── package.json               # Root package.json for npm scripts
│   ├── .gitignore                 # Git ignore rules
│   ├── README.md                  # Project documentation
│   └── start.sh                   # Local development startup
│
├── .git/                          # Git repository metadata
├── process-data-*.json            # Sample process data files
├── process-map-*.bpmn             # Generated BPMN files
├── *.svg                          # Exported process diagrams
└── .env.production                # Production environment template
```

### 🔧 **Key Files & Their Purpose**

#### **Frontend Architecture**
- **`client/src/App.jsx`**: Main React application with routing
- **`client/src/components/BpmnViewer.jsx`**: BPMN diagram rendering with bpmn.js
- **`client/src/services/api.js`**: Centralized API client with error handling
- **`client/src/context/ProcessContext.jsx`**: Global state management for process data

#### **Backend Architecture**
- **`server/src/app.js`**: Express application setup with middleware
- **`server/src/services/bpmn/bpmnGenerator.js`**: Core BPMN XML generation logic
- **`server/src/services/gemini/geminiService.js`**: AI integration for document analysis
- **`server/src/routes/documents.js`**: File upload and processing API endpoints

#### **AI & Processing**
- **`server/src/services/gemini/prompts.js`**: Sophisticated prompt engineering
- **`server/src/services/documentProcessor.js`**: Multi-format document parsing
- **`server/src/services/bpmn/layoutEngine.js`**: Intelligent diagram positioning

#### **Configuration & Deployment**
- **`.env`** files: Environment-specific configuration
- **`package.json`** files: Dependencies and npm scripts
- **`server/build.sh`**: Render deployment build script

## 🔗 Links & Resources

- **🌐 Live Demo**: [https://confluentia-frontend.onrender.com](https://confluentia-frontend.onrender.com)
- **📂 GitHub Repository**: [https://github.com/adityagupta28062005/Confluentia](https://github.com/adityagupta28062005/Confluentia)
- **🎥 Demo Video**: [Coming Soon]
- **📋 Presentation Slides**: [Available in repository]

## 🏆 Hackathon Context

**Event**: IIT BHU Hackathon 2025  
**Team**: Confluentia Development Team  
**Category**: AI-Powered Business Solutions  
**Timeline**: 48-hour development sprint  
**Achievement**: Complete MVP with production deployment

---

## 📝 License

MIT License - Open source and available for educational and commercial use.

---

**Built with ❤️ by the Confluentia team for IIT BHU Hackathon 2025**
