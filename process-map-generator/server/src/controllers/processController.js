const Process = require('../models/Process');
const Risk = require('../models/Risk');
const Control = require('../models/Control');
const Document = require('../models/Document');
const OpenAIService = require('../services/openai/openaiService');
const BPMNGenerator = require('../services/bpmn/bpmnGenerator');
const ElementFactory = require('../services/bpmn/elementFactory');
const LayoutEngine = require('../services/bpmn/layoutEngine');
const XMLBuilder = require('../services/bpmn/xmlBuilder');
const logger = require('../utils/logger');

class ProcessController {
  async extractProcesses(req, res, next) {
    try {
      const { documentId } = req.body;
      
      if (!documentId) {
        return res.status(400).json({
          success: false,
          error: 'Document ID is required'
        });
      }

      const document = await Document.findById(documentId);
      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found'
        });
      }

      if (!document.extractedText) {
        return res.status(400).json({
          success: false,
          error: 'Document has not been parsed yet'
        });
      }

      // Update document status
      await document.updateProcessingStatus('extracting', 'Starting AI process extraction');
      
      const startTime = Date.now();

      // Extract processes using OpenAI
      const extractionResult = await OpenAIService.extractProcessInfo(document.extractedText);
      
      const extractionTime = Date.now() - startTime;
      await document.addProcessingLog('extraction', 'success', 'AI extraction completed', extractionTime);

      // Process each extracted process
      const savedProcesses = [];
      
      for (const processData of extractionResult.processes) {
        try {
          // Extract risks and controls for this process
          const riskControlData = await OpenAIService.identifyRisksAndControls(
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
              aiModel: 'gpt-4',
              confidence: 0.8,
              extractedAt: new Date()
            }
          });

          const savedProcess = await process.save();

          // Save risks
          const savedRisks = [];
          for (const riskData of riskControlData.risks || []) {
            const risk = new Risk({
              ...riskData,
              process: savedProcess._id
            });
            const savedRisk = await risk.save();
            savedRisks.push(savedRisk._id);
          }

          // Save controls
          const savedControls = [];
          for (const controlData of riskControlData.controls || []) {
            const control = new Control({
              ...controlData,
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
          await document.addProcessingLog('extraction', 'warning', `Failed to process: ${processData.name}`);
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

      res.json({
        success: true,
        data: {
          documentId: document._id,
          processesExtracted: savedProcesses.length,
          processes: savedProcesses.map(p => ({
            id: p._id,
            name: p.name,
            description: p.description,
            stepsCount: p.steps.length,
            risksCount: p.risks.length,
            controlsCount: p.controls.length
          }))
        },
        message: 'Process extraction completed successfully'
      });

    } catch (error) {
      logger.error('Process extraction error:', error);
      
      // Update document status on error
      if (req.body.documentId) {
        try {
          await Document.findByIdAndUpdate(req.body.documentId, {
            processingStatus: 'failed'
          });
        } catch (updateError) {
          logger.error('Failed to update document status:', updateError);
        }
      }
      
      next(error);
    }
  }

  async getProcess(req, res, next) {
    try {
      const { id } = req.params;
      
      const process = await Process.findById(id)
        .populate('risks')
        .populate('controls')
        .populate('document', 'originalName createdAt');

      if (!process) {
        return res.status(404).json({
          success: false,
          error: 'Process not found'
        });
      }

      res.json({
        success: true,
        data: process
      });

    } catch (error) {
      logger.error('Get process error:', error);
      next(error);
    }
  }

  async getAllProcesses(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const filter = {};
      if (req.query.search) {
        filter.$text = { $search: req.query.search };
      }

      const processes = await Process.find(filter)
        .populate('document', 'originalName createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-bpmnXml -extractedText');

      const total = await Process.countDocuments(filter);

      res.json({
        success: true,
        data: {
          processes,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total,
            hasMore: skip + processes.length < total
          }
        }
      });

    } catch (error) {
      logger.error('Get all processes error:', error);
      next(error);
    }
  }

  async updateProcess(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Validate updates
      const allowedUpdates = ['name', 'description', 'steps', 'gateways', 'start_events', 'end_events'];
      const actualUpdates = Object.keys(updates).filter(key => allowedUpdates.includes(key));
      
      if (actualUpdates.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid updates provided'
        });
      }

      const process = await Process.findById(id);
      if (!process) {
        return res.status(404).json({
          success: false,
          error: 'Process not found'
        });
      }

      // Apply updates
      actualUpdates.forEach(key => {
        process[key] = updates[key];
      });

      // Regenerate BPMN if structure changed
      if (actualUpdates.some(key => ['steps', 'gateways', 'start_events', 'end_events'].includes(key))) {
        try {
          const bpmnGenerator = new BPMNGenerator();
          process.bpmnXml = await bpmnGenerator.generateBPMN(process);
        } catch (bpmnError) {
          logger.error('BPMN regeneration error:', bpmnError);
          // Continue with update even if BPMN generation fails
        }
      }

      const updatedProcess = await process.save();

      res.json({
        success: true,
        data: updatedProcess,
        message: 'Process updated successfully'
      });

    } catch (error) {
      logger.error('Update process error:', error);
      next(error);
    }
  }

  async deleteProcess(req, res, next) {
    try {
      const { id } = req.params;
      
      const process = await Process.findById(id);
      if (!process) {
        return res.status(404).json({
          success: false,
          error: 'Process not found'
        });
      }

      // Delete associated risks and controls
      await Risk.deleteMany({ process: id });
      await Control.deleteMany({ process: id });

      // Remove process from document
      await Document.findByIdAndUpdate(process.document, {
        $pull: { processes: id }
      });

      // Delete the process
      await Process.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Process deleted successfully'
      });

    } catch (error) {
      logger.error('Delete process error:', error);
      next(error);
    }
  }

  async getProcessStatistics(req, res, next) {
    try {
      const stats = await Process.aggregate([
        {
          $group: {
            _id: null,
            totalProcesses: { $sum: 1 },
            avgSteps: { $avg: { $size: '$steps' } },
            avgRisks: { $avg: { $size: '$risks' } },
            avgControls: { $avg: { $size: '$controls' } }
          }
        }
      ]);

      const recentActivity = await Process.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name createdAt metadata.confidence')
        .populate('document', 'originalName');

      res.json({
        success: true,
        data: {
          statistics: stats[0] || {
            totalProcesses: 0,
            avgSteps: 0,
            avgRisks: 0,
            avgControls: 0
          },
          recentActivity
        }
      });

    } catch (error) {
      logger.error('Get process statistics error:', error);
      next(error);
    }
  }
}

module.exports = new ProcessController();