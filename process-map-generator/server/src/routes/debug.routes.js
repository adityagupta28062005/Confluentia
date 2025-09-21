const express = require('express');
const Document = require('../models/Document');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/debug/document/:id - Debug document processing status
router.get('/document/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const document = await Document.findById(id);
        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found'
            });
        }

        res.json({
            success: true,
            data: {
                id: document._id,
                status: document.processingStatus,
                filename: document.originalName,
                hasExtractedText: !!document.extractedText,
                extractedTextLength: document.extractedText?.length || 0,
                processingLog: document.processingLog,
                processes: document.processes,
                extractionResults: document.extractionResults,
                createdAt: document.createdAt,
                updatedAt: document.updatedAt
            }
        });

    } catch (error) {
        logger.error('Debug document error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/debug/retry/:id - Retry processing for a document
router.post('/retry/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const document = await Document.findById(id);
        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found'
            });
        }

        // Reset status and retry processing
        await document.updateProcessingStatus('uploaded', 'Retrying processing');

        const uploadController = require('../controllers/uploadController');
        uploadController.processDocumentAsync(id);

        res.json({
            success: true,
            message: 'Processing restarted'
        });

    } catch (error) {
        logger.error('Debug retry error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;