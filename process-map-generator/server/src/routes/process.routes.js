const express = require('express');
const processController = require('../controllers/processController');

const router = express.Router();

// POST /api/process/extract - Extract processes from document
router.post('/extract', processController.extractProcesses);

// GET /api/process/:id - Get process details
router.get('/:id', processController.getProcess);

// GET /api/process - Get all processes
router.get('/', processController.getAllProcesses);

module.exports = router;