const express = require('express');
const uploadController = require('../controllers/uploadController');
const upload = require('../config/multer');

const router = express.Router();

// POST /api/upload - Upload document
router.post('/', upload.single('document'), uploadController.uploadDocument);

// GET /api/upload/status/:id - Get upload status
router.get('/status/:id', uploadController.getUploadStatus);

module.exports = router;