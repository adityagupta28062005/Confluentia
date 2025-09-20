const express = require('express');
const uploadRoutes = require('./upload.routes');
const processRoutes = require('./process.routes');
const exportRoutes = require('./export.routes');

const router = express.Router();

// Mount routes
router.use('/upload', uploadRoutes);
router.use('/process', processRoutes);
router.use('/export', exportRoutes);

module.exports = router;