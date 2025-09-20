const mongoose = require('mongoose');

const controlSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'Preventive',
      'Detective',
      'Corrective',
      'Compensating',
      'Directive'
    ]
  },
  description: {
    type: String,
    required: true
  },
  effectiveness: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  frequency: {
    type: String,
    enum: [
      'Continuous',
      'Daily',
      'Weekly',
      'Monthly',
      'Quarterly',
      'Annually',
      'Ad-hoc',
      'Real-time'
    ],
    default: 'Ad-hoc'
  },
  automation_level: {
    type: String,
    enum: ['Manual', 'Semi-automated', 'Automated'],
    default: 'Manual'
  },
  owner: {
    type: String,
    trim: true
  },
  related_risks: [String],
  related_steps: [String],
  process: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Process',
    required: true
  },
  risks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Risk'
  }],
  implementation: {
    cost: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    complexity: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    timeframe: {
      type: String,
      enum: ['Immediate', 'Short-term', 'Medium-term', 'Long-term'],
      default: 'Medium-term'
    }
  },
  testing: {
    lastTested: Date,
    testFrequency: {
      type: String,
      enum: ['Never', 'Annually', 'Semi-annually', 'Quarterly', 'Monthly'],
      default: 'Never'
    },
    testResults: {
      type: String,
      enum: ['Not Tested', 'Effective', 'Partially Effective', 'Ineffective'],
      default: 'Not Tested'
    }
  },
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

controlSchema.index({ type: 1, effectiveness: 1 });
controlSchema.index({ process: 1 });
controlSchema.index({ automation_level: 1 });
controlSchema.index({ 'testing.testResults': 1 });

controlSchema.virtual('controlScore').get(function() {
  const effectivenessScore = { Low: 1, Medium: 2, High: 3 }[this.effectiveness] || 2;
  const automationScore = { Manual: 1, 'Semi-automated': 2, Automated: 3 }[this.automation_level] || 1;
  return effectivenessScore + automationScore;
});

controlSchema.methods.isTestingOverdue = function() {
  if (!this.testing.lastTested || this.testing.testFrequency === 'Never') {
    return false;
  }
  
  const now = new Date();
  const lastTested = new Date(this.testing.lastTested);
  const monthsMap = {
    'Monthly': 1,
    'Quarterly': 3,
    'Semi-annually': 6,
    'Annually': 12
  };
  
  const monthsToAdd = monthsMap[this.testing.testFrequency] || 12;
  const nextTestDue = new Date(lastTested);
  nextTestDue.setMonth(nextTestDue.getMonth() + monthsToAdd);
  
  return now > nextTestDue;
};

controlSchema.statics.findByType = function(type) {
  return this.find({ type });
};

controlSchema.statics.findEffectiveControls = function() {
  return this.find({ effectiveness: 'High' });
};

controlSchema.statics.findOverdueTests = function() {
  return this.find().then(controls => 
    controls.filter(control => control.isTestingOverdue())
  );
};

module.exports = mongoose.model('Control', controlSchema);