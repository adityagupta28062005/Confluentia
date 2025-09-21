const express = require('express');
const processController = require('../controllers/processController');

const router = express.Router();

// POST /api/process - Process document (what frontend expects)
router.post('/', processController.extractProcesses);

// POST /api/process/extract - Extract processes from document
router.post('/extract', processController.extractProcesses);

// GET /api/process/:id - Get process details
router.get('/:id', processController.getProcess);

// GET /api/process/document/:documentId - Get all processes for a document
router.get('/document/:documentId', processController.getProcessesForDocument);

// GET /api/process - Get all processes
router.get('/', processController.getAllProcesses);

module.exports = router;