const fs = require('fs').promises;
const path = require('path');
const Document = require('../models/Document');
const DocumentParser = require('../services/documentParser');
const logger = require('../utils/logger');

class UploadController {
  async uploadDocument(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      const { originalname, filename, mimetype, size, path: filePath } = req.file;
      
      logger.info(`File uploaded: ${originalname}, size: ${size}, type: ${mimetype}`);

      // Validate file type
      if (!DocumentParser.validateFileType(mimetype)) {
        // Clean up uploaded file
        await this.cleanupFile(filePath);
        return res.status(400).json({
          success: false,
          error: 'Invalid file type. Only PDF, DOCX, and XLSX files are allowed.'
        });
      }

      // Create document record
      const document = new Document({
        originalName: originalname,
        filename,
        mimetype,
        size,
        path: filePath,
        uploadedBy: req.ip,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        processingStatus: 'uploaded'
      });

      await document.save();
      await document.addProcessingLog('upload', 'success', 'File uploaded successfully');

      // Start background processing
      this.processDocumentAsync(document._id);

      res.status(201).json({
        success: true,
        data: {
          documentId: document._id,
          filename: originalname,
          fileType: document.fileType,
          size: document.sizeFormatted,
          status: document.processingStatus
        },
        message: 'File uploaded successfully. Processing started.'
      });

    } catch (error) {
      logger.error('Upload error:', error);
      
      // Clean up file if upload failed
      if (req.file && req.file.path) {
        await this.cleanupFile(req.file.path);
      }
      
      next(error);
    }
  }

  async getUploadStatus(req, res, next) {
    try {
      const { id } = req.params;
      
      const document = await Document.findById(id)
        .populate('processes')
        .select('-extractedText -processingLog');

      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      const status = {
        id: document._id,
        filename: document.originalName,
        fileType: document.fileType,
        size: document.sizeFormatted,
        status: document.processingStatus,
        uploadedAt: document.createdAt,
        extractionResults: document.extractionResults,
        processes: document.processes.map(process => ({
          id: process._id,
          name: process.name,
          description: process.description,
          stepsCount: process.steps.length,
          risksCount: process.risks.length,
          controlsCount: process.controls.length
        }))
      };

      res.json({
        success: true,
        data: status
      });

    } catch (error) {
      logger.error('Get upload status error:', error);
      next(error);
    }
  }

  async processDocumentAsync(documentId) {
    let document;
    
    try {
      document = await Document.findById(documentId);
      if (!document) {
        logger.error(`Document not found: ${documentId}`);
        return;
      }

      // Update status to parsing
      await document.updateProcessingStatus('parsing', 'Starting document parsing');
      
      const startTime = Date.now();
      
      // Parse document
      const parseResult = await DocumentParser.parseDocument(document.path, document.mimetype);
      
      const parseTime = Date.now() - startTime;
      await document.addProcessingLog('parsing', 'success', 'Document parsed successfully', parseTime);

      // Update document with extracted text and metadata
      document.extractedText = parseResult.text;
      document.metadata = {
        ...document.metadata.toObject(),
        wordCount: parseResult.text.split(/\s+/).length,
        characterCount: parseResult.text.length,
        ...parseResult.metadata
      };
      
      await document.updateProcessingStatus('parsed', `Extracted ${parseResult.text.length} characters`);

      // Continue with process extraction (this would be implemented in processController)
      logger.info(`Document ${documentId} parsed successfully`);

    } catch (error) {
      logger.error(`Document processing error for ${documentId}:`, error);
      
      if (document) {
        await document.updateProcessingStatus('failed', `Processing failed: ${error.message}`);
        await document.addProcessingLog('processing', 'error', error.message);
      }
    }
  }

  async cleanupFile(filePath) {
    try {
      await fs.unlink(filePath);
      logger.info(`Cleaned up file: ${filePath}`);
    } catch (error) {
      logger.error(`Failed to cleanup file ${filePath}:`, error);
    }
  }

  async getRecentUploads(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const documents = await Document.findRecentUploads(limit);

      res.json({
        success: true,
        data: documents.map(doc => doc.getProcessingSummary())
      });

    } catch (error) {
      logger.error('Get recent uploads error:', error);
      next(error);
    }
  }

  async deleteDocument(req, res, next) {
    try {
      const { id } = req.params;
      
      const document = await Document.findById(id);
      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      // Clean up file
      await this.cleanupFile(document.path);

      // Delete from database
      await Document.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });

    } catch (error) {
      logger.error('Delete document error:', error);
      next(error);
    }
  }
}

module.exports = new UploadController();