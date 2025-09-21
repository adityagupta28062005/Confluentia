const mongoose = require('mongoose');

const processSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    steps: [{
        id: String,
        name: String,
        description: String,
        type: {
            type: String,
            enum: ['task', 'userTask', 'serviceTask', 'manualTask', 'gateway'],
            default: 'task'
        },
        actor: String,
        inputs: [String],
        outputs: [String],
        duration: String
    }],
    gateways: [{
        id: String,
        name: String,
        type: {
            type: String,
            enum: ['exclusive', 'parallel', 'inclusive'],
            default: 'exclusive'
        },
        condition: String,
        outcomes: [String]
    }],
    start_events: [{
        id: String,
        name: String,
        description: String
    }],
    end_events: [{
        id: String,
        name: String,
        description: String
    }],
    bpmnXml: {
        type: String,
        default: ''
    },
    risks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Risk'
    }],
    controls: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Control'
    }],
    document: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
    },
    metadata: {
        extractedAt: {
            type: Date,
            default: Date.now
        },
        aiModel: String,
        confidence: Number,
        validationStatus: {
            type: String,
            enum: ['pending', 'validated', 'rejected'],
            default: 'pending'
        }
    }
}, {
    timestamps: true
});

processSchema.index({ name: 'text', description: 'text' });
processSchema.index({ 'metadata.extractedAt': -1 });

processSchema.methods.toOutputFormat = function () {
    return {
        process_name: this.name,
        process_description: this.description,
        process_map_bpmn_xml: this.bpmnXml,
        risk_taxonomy: this.risks.map(risk => ({
            name: risk.name,
            category: risk.category,
            description: risk.description
        })),
        controls: this.controls.map(control => ({
            name: control.name,
            type: control.type,
            description: control.description
        }))
    };
};

module.exports = mongoose.model('Process', processSchema);