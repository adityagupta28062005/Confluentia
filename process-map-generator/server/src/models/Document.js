const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    originalName: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    extractedText: {
        type: String,
        default: ''
    },
    metadata: {
        pages: Number,
        wordCount: Number,
        characterCount: Number,
        language: String,
        encoding: String
    },
    processingStatus: {
        type: String,
        enum: ['uploaded', 'parsing', 'parsed', 'extracting', 'extracted', 'completed', 'failed'],
        default: 'uploaded'
    },
    processingLog: [{
        stage: String,
        status: String,
        message: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        duration: Number
    }],
    extractionResults: {
        processesFound: {
            type: Number,
            default: 0
        },
        risksFound: {
            type: Number,
            default: 0
        },
        controlsFound: {
            type: Number,
            default: 0
        },
        confidence: {
            type: Number,
            min: 0,
            max: 1,
            default: 0
        }
    },
    processes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Process'
    }],
    uploadedBy: {
        type: String,
        default: 'anonymous'
    },
    ipAddress: String,
    userAgent: String
}, {
    timestamps: true
});

documentSchema.index({ processingStatus: 1 });
documentSchema.index({ createdAt: -1 });
documentSchema.index({ mimetype: 1 });

documentSchema.virtual('fileType').get(function () {
    const typeMap = {
        'application/pdf': 'PDF',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
        'application/msword': 'Word Document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
        'application/vnd.ms-excel': 'Excel Spreadsheet'
    };

    return typeMap[this.mimetype] || 'Unknown';
});

documentSchema.virtual('sizeFormatted').get(function () {
    const bytes = this.size;
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

documentSchema.methods.addProcessingLog = function (stage, status, message, duration = null) {
    this.processingLog.push({
        stage,
        status,
        message,
        duration,
        timestamp: new Date()
    });
    // Don't save here - let the caller decide when to save
    return this;
};

documentSchema.methods.updateProcessingStatus = async function (status, message = '') {
    this.processingStatus = status;
    if (message) {
        this.addProcessingLog(status, 'info', message);
    }
    return await this.save();
};

documentSchema.methods.getProcessingSummary = function () {
    return {
        id: this._id,
        filename: this.originalName,
        fileType: this.fileType,
        size: this.sizeFormatted,
        status: this.processingStatus,
        uploadedAt: this.createdAt,
        processesFound: this.extractionResults.processesFound,
        risksFound: this.extractionResults.risksFound,
        controlsFound: this.extractionResults.controlsFound,
        confidence: this.extractionResults.confidence
    };
};

documentSchema.statics.findByStatus = function (status) {
    return this.find({ processingStatus: status });
};

documentSchema.statics.findRecentUploads = function (limit = 10) {
    return this.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('originalName fileType processingStatus createdAt extractionResults');
};

documentSchema.statics.getProcessingStats = function () {
    return this.aggregate([
        {
            $group: {
                _id: '$processingStatus',
                count: { $sum: 1 }
            }
        }
    ]);
};

module.exports = mongoose.model('Document', documentSchema);