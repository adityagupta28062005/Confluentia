const express = require('express');
const uploadRoutes = require('./upload.routes');
const processRoutes = require('./process.routes');
const exportRoutes = require('./export.routes');

const router = express.Router();

// Mount routes
router.use('/upload', uploadRoutes);
router.use('/process', processRoutes);
router.use('/export', exportRoutes);

// Results route - Get process results
router.get('/results/:processId', require('../controllers/processController').getResults);

// Document results route - Get all processes for a document in target format
router.get('/document-results/:documentId', require('../controllers/processController').getDocumentResults);

module.exports = router;