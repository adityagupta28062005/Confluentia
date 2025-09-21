const fs = require('fs').promises;
const path = require('path');
const Document = require('../models/Document');
const DocumentParser = require('../services/documentParser');
const logger = require('../utils/logger');

class UploadController {
    constructor() {
        // Bind methods to maintain context
        this.uploadDocument = this.uploadDocument.bind(this);
        this.getUploadStatus = this.getUploadStatus.bind(this);
        this.deleteDocument = this.deleteDocument.bind(this);
    }

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

            // Add upload log before saving
            document.addProcessingLog('upload', 'success', 'File uploaded successfully');
            await document.save();

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

            // Update document with extracted text and metadata
            document.extractedText = parseResult.text;
            document.metadata = {
                ...document.metadata.toObject(),
                wordCount: parseResult.text.split(/\s+/).length,
                characterCount: parseResult.text.length,
                ...parseResult.metadata
            };

            // Add parsing log and update status in one save
            document.addProcessingLog('parsing', 'success', 'Document parsed successfully', parseTime);
            await document.updateProcessingStatus('parsed', `Extracted ${parseResult.text.length} characters`);

            // Automatically trigger process extraction after parsing
            logger.info(`Document ${documentId} parsed successfully. Starting AI extraction...`);
            await this.triggerProcessExtraction(documentId);

        } catch (error) {
            logger.error(`Document processing error for ${documentId}:`, error);

            if (document) {
                document.addProcessingLog('processing', 'error', error.message);
                await document.updateProcessingStatus('failed', `Processing failed: ${error.message}`);
            }
        }
    }

    async triggerProcessExtraction(documentId) {
        try {
            const GeminiService = require('../services/gemini/geminiService');
            const BPMNGenerator = require('../services/bpmn/bpmnGenerator');
            const Process = require('../models/Process');
            const Risk = require('../models/Risk');
            const Control = require('../models/Control');

            const document = await Document.findById(documentId);
            if (!document || !document.extractedText) {
                throw new Error('Document not ready for processing');
            }

            // Update document status
            await document.updateProcessingStatus('extracting', 'Starting AI process extraction');

            const startTime = Date.now();

            // Extract processes using Gemini
            const extractionResult = await GeminiService.extractProcessInfo(document.extractedText);

            const extractionTime = Date.now() - startTime;
            document.addProcessingLog('extraction', 'success', 'AI extraction completed', extractionTime);

            // Process each extracted process
            const savedProcesses = [];

            for (const processData of extractionResult.processes) {
                try {
                    // Extract risks and controls for this process
                    const riskControlData = await GeminiService.identifyRisksAndControls(
                        processData.description,
                        processData.steps
                    );

                    // Generate BPMN
                    const bpmnGenerator = new BPMNGenerator();
                    const bpmnXml = await bpmnGenerator.generateBPMN(processData);

                    // Create process record
                    const process = new Process({
                        name: processData.name,
                        description: processData.description,
                        steps: processData.steps,
                        gateways: processData.gateways || [],
                        start_events: processData.start_events || [],
                        end_events: processData.end_events || [],
                        bpmnXml: bpmnXml,
                        document: document._id,
                        metadata: {
                            aiModel: 'gemini-1.5-flash',
                            confidence: 0.8,
                            extractedAt: new Date()
                        }
                    });

                    const savedProcess = await process.save();

                    // Save risks and controls
                    const savedRisks = [];
                    const savedControls = [];

                    for (const riskData of riskControlData.risks) {
                        const risk = new Risk({
                            name: riskData.name,
                            description: riskData.description,
                            severity: riskData.severity || 'Medium',
                            category: riskData.category || 'Operational',
                            impact: riskData.impact,
                            process: savedProcess._id
                        });
                        const savedRisk = await risk.save();
                        savedRisks.push(savedRisk._id);
                    }

                    for (const controlData of riskControlData.controls) {
                        const control = new Control({
                            name: controlData.name,
                            description: controlData.description,
                            type: controlData.type || 'Preventive',
                            frequency: controlData.frequency,
                            owner: controlData.owner,
                            process: savedProcess._id
                        });
                        const savedControl = await control.save();
                        savedControls.push(savedControl._id);
                    }

                    // Update process with risk and control references
                    savedProcess.risks = savedRisks;
                    savedProcess.controls = savedControls;
                    await savedProcess.save();

                    savedProcesses.push(savedProcess);

                } catch (processError) {
                    logger.error(`Error processing individual process: ${processData.name}`, processError);
                    document.addProcessingLog('extraction', 'warning', `Failed to process: ${processData.name}`);
                }
            }

            // Update document with results
            document.processes = savedProcesses.map(p => p._id);
            document.extractionResults = {
                processesFound: savedProcesses.length,
                risksFound: savedProcesses.reduce((total, p) => total + p.risks.length, 0),
                controlsFound: savedProcesses.reduce((total, p) => total + p.controls.length, 0),
                confidence: 0.8
            };

            await document.updateProcessingStatus('completed', `Extracted ${savedProcesses.length} processes`);
            logger.info(`Process extraction completed for document ${documentId}: ${savedProcesses.length} processes`);

        } catch (error) {
            logger.error(`Process extraction error for ${documentId}:`, error);
            const document = await Document.findById(documentId);
            if (document) {
                document.addProcessingLog('extraction', 'error', error.message);
                await document.updateProcessingStatus('failed', `Extraction failed: ${error.message}`);
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