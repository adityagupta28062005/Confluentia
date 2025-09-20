# Testing Guide

## Prerequisites

1. **MongoDB**: Ensure MongoDB is running locally
   ```bash
   brew services start mongodb/brew/mongodb-community
   # or
   mongod --dbpath /usr/local/var/mongodb
   ```

2. **OpenAI API Key**: Get your API key from https://platform.openai.com/
   - Copy `server/.env.example` to `server/.env`
   - Update `OPENAI_API_KEY` with your actual key

3. **Dependencies**: Install all dependencies
   ```bash
   # Backend dependencies
   cd server && npm install
   
   # Frontend dependencies  
   cd ../client && npm install
   ```

## Quick Start

1. **Start the application**:
   ```bash
   ./start.sh
   ```

2. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Manual Testing Steps

### Test 1: File Upload
1. Open http://localhost:3000
2. Drag and drop a PDF, DOCX, or XLSX file
3. Click "Process Document"
4. Verify upload progress indicator appears

### Test 2: Document Processing
1. After successful upload, processing should begin automatically
2. Wait for AI analysis (30-60 seconds)
3. Verify loading indicators and status messages

### Test 3: BPMN Visualization
1. Once processing completes, BPMN diagram should appear
2. Test zoom controls (zoom in, zoom out, fit to screen)
3. Try fullscreen mode
4. Export diagram as SVG

### Test 4: Results Panel
1. Check the results panel shows:
   - Process overview with counts
   - Activities list with details
   - Risks with severity levels
   - Controls with types
2. Test expanding/collapsing sections

### Test 5: Export Functionality
1. Export process data as JSON
2. Export BPMN diagram as XML
3. Verify downloaded files are valid

## API Testing

### Test Backend Endpoints

```bash
# Health check
curl http://localhost:5000/api/health

# Upload a file
curl -X POST http://localhost:5000/api/upload \
  -F "document=@/path/to/your/test/file.pdf"

# Check processing status
curl http://localhost:5000/api/process/status/{documentId}
```

## Test Files

Create test documents with the following content:

### Sample Process Document (test.txt)
```
Customer Onboarding Process

1. Customer submits application form
2. Compliance team reviews documents
3. Background check is performed
4. Risk assessment is conducted
5. Account is approved or rejected
6. Customer is notified of decision
7. If approved, account setup is completed

Risks:
- Identity fraud risk during document submission
- Regulatory compliance risk in review process
- Data privacy risk in background check

Controls:
- Document verification system
- Compliance checklist review
- Automated risk scoring
- Audit trail maintenance
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running: `brew services list | grep mongodb`
   - Check connection string in `.env`

2. **OpenAI API Error**
   - Verify API key is correct
   - Check OpenAI account has credits
   - Ensure API key has necessary permissions

3. **File Upload Issues**
   - Check file size (max 10MB)
   - Verify file format (PDF, DOCX, XLSX)
   - Ensure upload directory exists and is writable

4. **BPMN Rendering Issues**
   - Check browser console for JavaScript errors
   - Verify bpmn-js library loaded correctly
   - Try refreshing the page

5. **Port Conflicts**
   - Frontend: Change port in `client/package.json`
   - Backend: Change PORT in `server/.env`

## Performance Testing

### Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Create load test config
cat > load-test.yml << EOF
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Upload and process documents"
    flow:
      - post:
          url: "/api/upload"
          formData:
            document: "@test-file.pdf"
EOF

# Run load test
artillery run load-test.yml
```

## Browser Compatibility

Test the application on:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Mobile Testing

- Test responsive design on mobile devices
- Verify touch interactions work properly
- Check file upload on mobile browsers

## Security Testing

1. **File Upload Security**
   - Try uploading malicious files
   - Test file size limits
   - Verify file type validation

2. **API Security**
   - Test rate limiting
   - Verify CORS configuration
   - Check for injection vulnerabilities

## Success Criteria

✅ **Basic Functionality**
- File upload works for PDF, DOCX, XLSX
- Document processing completes successfully
- BPMN diagram renders correctly
- Export functions work

✅ **User Experience**
- Clear progress indicators
- Helpful error messages
- Responsive design
- Intuitive navigation

✅ **Performance**
- Processing completes within 60 seconds
- UI remains responsive during processing
- Large files (up to 10MB) handled correctly

✅ **Reliability**
- Graceful error handling
- No crashes or freezes
- Consistent results for same input