const Process = require('../models/Process');
const Document = require('../models/Document');
const Joi = require('joi');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class ExportController {
    async exportAsJSON(req, res, next) {
        try {
            const { processId } = req.body;

            if (!processId) {
                return res.status(400).json({
                    success: false,
                    error: 'Process ID is required'
                });
            }

            const process = await Process.findById(processId)
                .populate('risks')
                .populate('controls');

            if (!process) {
                return res.status(404).json({
                    success: false,
                    error: 'Process not found'
                });
            }

            // Generate the output in the required schema format
            const outputData = {
                process_name: process.name,
                process_description: process.description,
                process_map_bpmn_xml: process.bpmnXml,
                risk_taxonomy: process.risks.map(risk => ({
                    name: risk.name,
                    category: risk.category,
                    description: risk.description
                })),
                controls: process.controls.map(control => ({
                    name: control.name,
                    type: control.type,
                    description: control.description
                }))
            };

            // Validate against schema
            const validationResult = this.validateOutputSchema(outputData);
            if (!validationResult.isValid) {
                logger.error('Schema validation failed:', validationResult.errors);
                return res.status(500).json({
                    success: false,
                    error: 'Generated data does not match required schema',
                    details: validationResult.errors
                });
            }

            // Set headers for file download
            const filename = `${process.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.json`;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            res.json(outputData);

        } catch (error) {
            logger.error('JSON export error:', error);
            next(error);
        }
    }

    async exportBPMN(req, res, next) {
        try {
            const { processId } = req.params;

            const process = await Process.findById(processId);
            if (!process) {
                return res.status(404).json({
                    success: false,
                    error: 'Process not found'
                });
            }

            if (!process.bpmnXml) {
                return res.status(400).json({
                    success: false,
                    error: 'BPMN XML not available for this process'
                });
            }

            // Set headers for BPMN file download
            const filename = `${process.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.bpmn`;
            res.setHeader('Content-Type', 'application/xml');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            res.send(process.bpmnXml);

        } catch (error) {
            logger.error('BPMN export error:', error);
            next(error);
        }
    }

    async exportMultipleProcesses(req, res, next) {
        try {
            const { processIds } = req.body;

            if (!Array.isArray(processIds) || processIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Process IDs array is required'
                });
            }

            const processes = await Process.find({ _id: { $in: processIds } })
                .populate('risks')
                .populate('controls');

            if (processes.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'No processes found'
                });
            }

            // Generate combined export data
            const exportData = {
                export_timestamp: new Date().toISOString(),
                total_processes: processes.length,
                processes: processes.map(process => ({
                    process_name: process.name,
                    process_description: process.description,
                    process_map_bpmn_xml: process.bpmnXml,
                    risk_taxonomy: process.risks.map(risk => ({
                        name: risk.name,
                        category: risk.category,
                        description: risk.description
                    })),
                    controls: process.controls.map(control => ({
                        name: control.name,
                        type: control.type,
                        description: control.description
                    }))
                }))
            };

            // Set headers for file download
            const filename = `multiple_processes_${Date.now()}.json`;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            res.json(exportData);

        } catch (error) {
            logger.error('Multiple processes export error:', error);
            next(error);
        }
    }

    async exportDocumentResults(req, res, next) {
        try {
            const { documentId } = req.params;

            if (!documentId) {
                return res.status(400).json({
                    success: false,
                    error: 'Document ID is required'
                });
            }

            // Find document and populate all related processes
            const document = await Document.findById(documentId).populate({
                path: 'processes',
                populate: [
                    { path: 'risks' },
                    { path: 'controls' }
                ]
            });

            if (!document) {
                return res.status(404).json({
                    success: false,
                    error: 'Document not found'
                });
            }

            if (!document.processes || document.processes.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'No processes found for this document'
                });
            }

            // Generate the target format
            const exportData = {
                found_processes: true,
                process_count: document.processes.length,
                processes: document.processes.map(process => ({
                    process_name: process.name,
                    process_description: process.description,
                    process_map_bpmn_xml: process.bpmnXml || "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<bpmn:definitions ... >...</bpmn:definitions>\n",
                    risk_taxonomy: process.risks.map(risk => ({
                        category: risk.category,
                        risk_name: risk.name,
                        description: risk.description
                    })),
                    controls: process.controls.map(control => ({
                        control_name: control.name,
                        control_type: control.type,
                        description: control.description
                    }))
                }))
            };

            // Set headers for file download
            const filename = `json_output_${document.originalName.replace(/\.[^/.]+$/, "")}.json`;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            res.json(exportData);

        } catch (error) {
            logger.error('Document results export error:', error);
            next(error);
        }
    }

    async getExportFormats(req, res, next) {
        try {
            const formats = [
                {
                    name: 'JSON',
                    description: 'Schema-compliant JSON format',
                    extension: '.json',
                    mimeType: 'application/json',
                    endpoint: '/api/export/json'
                },
                {
                    name: 'BPMN',
                    description: 'BPMN 2.0 XML format',
                    extension: '.bpmn',
                    mimeType: 'application/xml',
                    endpoint: '/api/export/bpmn'
                },
                {
                    name: 'CSV',
                    description: 'Comma-separated values (risks and controls)',
                    extension: '.csv',
                    mimeType: 'text/csv',
                    endpoint: '/api/export/csv',
                    status: 'coming_soon'
                },
                {
                    name: 'PDF Report',
                    description: 'Formatted PDF report',
                    extension: '.pdf',
                    mimeType: 'application/pdf',
                    endpoint: '/api/export/pdf',
                    status: 'coming_soon'
                }
            ];

            res.json({
                success: true,
                data: formats
            });

        } catch (error) {
            logger.error('Get export formats error:', error);
            next(error);
        }
    }

    validateOutputSchema(data) {
        const schema = Joi.object({
            process_name: Joi.string().required(),
            process_description: Joi.string().required(),
            process_map_bpmn_xml: Joi.string().required(),
            risk_taxonomy: Joi.array().items(
                Joi.object({
                    name: Joi.string().required(),
                    category: Joi.string().required(),
                    description: Joi.string().required()
                })
            ).required(),
            controls: Joi.array().items(
                Joi.object({
                    name: Joi.string().required(),
                    type: Joi.string().required(),
                    description: Joi.string().required()
                })
            ).required()
        });

        const { error } = schema.validate(data);

        return {
            isValid: !error,
            errors: error ? error.details.map(detail => detail.message) : []
        };
    }

    async generateProcessReport(req, res, next) {
        try {
            const { processId } = req.params;

            const process = await Process.findById(processId)
                .populate('risks')
                .populate('controls')
                .populate('document', 'originalName createdAt');

            if (!process) {
                return res.status(404).json({
                    success: false,
                    error: 'Process not found'
                });
            }

            // Generate comprehensive process report
            const report = {
                metadata: {
                    reportGenerated: new Date().toISOString(),
                    processId: process._id,
                    sourceDocument: process.document ? {
                        name: process.document.originalName,
                        uploadedAt: process.document.createdAt
                    } : null
                },
                process: {
                    name: process.name,
                    description: process.description,
                    stepsCount: process.steps.length,
                    steps: process.steps,
                    gateways: process.gateways,
                    startEvents: process.start_events,
                    endEvents: process.end_events
                },
                riskAnalysis: {
                    totalRisks: process.risks.length,
                    risksByCategory: this.groupRisksByCategory(process.risks),
                    highRisks: process.risks.filter(risk => risk.riskScore >= 7),
                    risks: process.risks
                },
                controlAnalysis: {
                    totalControls: process.controls.length,
                    controlsByType: this.groupControlsByType(process.controls),
                    controlEffectiveness: this.analyzeControlEffectiveness(process.controls),
                    controls: process.controls
                },
                bpmn: {
                    hasVisualization: !!process.bpmnXml,
                    xmlSize: process.bpmnXml ? process.bpmnXml.length : 0
                }
            };

            res.json({
                success: true,
                data: report
            });

        } catch (error) {
            logger.error('Generate process report error:', error);
            next(error);
        }
    }

    groupRisksByCategory(risks) {
        return risks.reduce((acc, risk) => {
            const category = risk.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(risk);
            return acc;
        }, {});
    }

    groupControlsByType(controls) {
        return controls.reduce((acc, control) => {
            const type = control.type || 'Uncategorized';
            if (!acc[type]) {
                acc[type] = [];
            }
            acc[type].push(control);
            return acc;
        }, {});
    }

    analyzeControlEffectiveness(controls) {
        const effectiveness = { High: 0, Medium: 0, Low: 0 };

        controls.forEach(control => {
            const level = control.effectiveness || 'Medium';
            effectiveness[level]++;
        });

        return effectiveness;
    }
}

module.exports = new ExportController();