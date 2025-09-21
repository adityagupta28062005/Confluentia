const mongoose = require('mongoose');

const riskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Operational Risk',
            'Financial Risk',
            'Compliance Risk',
            'Reputational Risk',
            'Strategic Risk',
            'Technology Risk',
            'Credit Risk',
            'Market Risk',
            'Liquidity Risk',
            'Legal Risk'
        ]
    },
    description: {
        type: String,
        required: true
    },
    likelihood: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    impact: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    riskScore: {
        type: Number,
        min: 1,
        max: 9,
        default: 5
    },
    related_steps: [String],
    process: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Process',
        required: true
    },
    controls: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Control'
    }],
    metadata: {
        identifiedAt: {
            type: Date,
            default: Date.now
        },
        source: {
            type: String,
            enum: ['ai_extraction', 'manual_entry', 'document_analysis'],
            default: 'ai_extraction'
        },
        confidence: {
            type: Number,
            min: 0,
            max: 1,
            default: 0.7
        }
    }
}, {
    timestamps: true
});

riskSchema.index({ category: 1, likelihood: 1, impact: 1 });
riskSchema.index({ process: 1 });
riskSchema.index({ riskScore: -1 });

riskSchema.virtual('riskLevel').get(function () {
    if (this.riskScore <= 3) return 'Low';
    if (this.riskScore <= 6) return 'Medium';
    return 'High';
});

riskSchema.methods.calculateRiskScore = function () {
    const likelihoodScore = { Low: 1, Medium: 2, High: 3 }[this.likelihood] || 2;
    const impactScore = { Low: 1, Medium: 2, High: 3 }[this.impact] || 2;
    this.riskScore = likelihoodScore * impactScore;
    return this.riskScore;
};

riskSchema.statics.findByCategory = function (category) {
    return this.find({ category });
};

riskSchema.statics.findHighRisks = function () {
    return this.find({ riskScore: { $gte: 7 } });
};

module.exports = mongoose.model('Risk', riskSchema);