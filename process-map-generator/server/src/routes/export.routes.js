const express = require('express');
const exportController = require('../controllers/exportController');

const router = express.Router();

// POST /api/export/json - Export process as JSON
router.post('/json', exportController.exportAsJSON);

// GET /api/export/bpmn/:processId - Export BPMN XML
router.get('/bpmn/:processId', exportController.exportBPMN);

// GET /api/export/document/:documentId - Export document results in target format
router.get('/document/:documentId', exportController.exportDocumentResults);

module.exports = router;