const logger = require('../../utils/logger');

class ResponseParser {
  static parseProcessResponse(response) {
    try {
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = this.cleanJsonResponse(response);
      const parsed = JSON.parse(cleanedResponse);
      
      // Validate the structure
      if (!parsed.processes || !Array.isArray(parsed.processes)) {
        throw new Error('Invalid process response structure: missing processes array');
      }
      
      // Enhance and validate each process
      parsed.processes = parsed.processes.map(process => this.validateProcess(process));
      
      logger.info(`Parsed ${parsed.processes.length} processes from AI response`);
      return parsed;
    } catch (error) {
      logger.error('Process response parsing error:', error);
      logger.error('Raw response:', response);
      throw new Error(`Failed to parse process response: ${error.message}`);
    }
  }

  static parseRiskControlResponse(response) {
    try {
      const cleanedResponse = this.cleanJsonResponse(response);
      const parsed = JSON.parse(cleanedResponse);
      
      // Validate structure
      if (!parsed.risks) parsed.risks = [];
      if (!parsed.controls) parsed.controls = [];
      
      if (!Array.isArray(parsed.risks)) {
        throw new Error('Invalid risks structure: must be array');
      }
      
      if (!Array.isArray(parsed.controls)) {
        throw new Error('Invalid controls structure: must be array');
      }
      
      // Validate and enhance risks
      parsed.risks = parsed.risks.map(risk => this.validateRisk(risk));
      
      // Validate and enhance controls
      parsed.controls = parsed.controls.map(control => this.validateControl(control));
      
      logger.info(`Parsed ${parsed.risks.length} risks and ${parsed.controls.length} controls`);
      return parsed;
    } catch (error) {
      logger.error('Risk/control response parsing error:', error);
      logger.error('Raw response:', response);
      throw new Error(`Failed to parse risk/control response: ${error.message}`);
    }
  }

  static parseStepEnhancementResponse(response) {
    try {
      const cleanedResponse = this.cleanJsonResponse(response);
      const parsed = JSON.parse(cleanedResponse);
      
      if (!parsed.enhanced_steps || !Array.isArray(parsed.enhanced_steps)) {
        throw new Error('Invalid step enhancement response: missing enhanced_steps array');
      }
      
      if (!parsed.sequence_flows) parsed.sequence_flows = [];
      
      parsed.enhanced_steps = parsed.enhanced_steps.map(step => this.validateEnhancedStep(step));
      
      logger.info(`Parsed ${parsed.enhanced_steps.length} enhanced steps`);
      return parsed;
    } catch (error) {
      logger.error('Step enhancement response parsing error:', error);
      throw new Error(`Failed to parse step enhancement response: ${error.message}`);
    }
  }

  static parseValidationResponse(response) {
    try {
      const cleanedResponse = this.cleanJsonResponse(response);
      const parsed = JSON.parse(cleanedResponse);
      
      // Set defaults
      if (typeof parsed.is_valid !== 'boolean') parsed.is_valid = false;
      if (typeof parsed.completeness_score !== 'number') parsed.completeness_score = 0;
      if (!Array.isArray(parsed.issues)) parsed.issues = [];
      if (!Array.isArray(parsed.strengths)) parsed.strengths = [];
      if (typeof parsed.overall_assessment !== 'string') parsed.overall_assessment = '';
      
      return parsed;
    } catch (error) {
      logger.error('Validation response parsing error:', error);
      throw new Error(`Failed to parse validation response: ${error.message}`);
    }
  }

  static cleanJsonResponse(response) {
    // Remove any markdown code blocks
    let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();
    
    // If there's text before the JSON, try to extract just the JSON part
    const jsonMatch = cleaned.match(/\{.*\}/s);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
    
    return cleaned;
  }

  static validateProcess(process) {
    const validated = {
      name: process.name || 'Unnamed Process',
      description: process.description || '',
      steps: [],
      gateways: [],
      start_events: [],
      end_events: []
    };
    
    // Validate steps
    if (Array.isArray(process.steps)) {
      validated.steps = process.steps.map(step => this.validateStep(step));
    }
    
    // Validate gateways
    if (Array.isArray(process.gateways)) {
      validated.gateways = process.gateways.map(gateway => this.validateGateway(gateway));
    }
    
    // Validate start events
    if (Array.isArray(process.start_events)) {
      validated.start_events = process.start_events.map(event => this.validateEvent(event));
    }
    
    // Validate end events
    if (Array.isArray(process.end_events)) {
      validated.end_events = process.end_events.map(event => this.validateEvent(event));
    }
    
    return validated;
  }

  static validateStep(step) {
    return {
      id: step.id || `step_${Date.now()}`,
      name: step.name || 'Unnamed Step',
      description: step.description || '',
      type: step.type || 'task',
      actor: step.actor || '',
      inputs: Array.isArray(step.inputs) ? step.inputs : [],
      outputs: Array.isArray(step.outputs) ? step.outputs : [],
      duration: step.duration || ''
    };
  }

  static validateGateway(gateway) {
    return {
      id: gateway.id || `gateway_${Date.now()}`,
      name: gateway.name || 'Decision Point',
      type: gateway.type || 'exclusive',
      condition: gateway.condition || '',
      outcomes: Array.isArray(gateway.outcomes) ? gateway.outcomes : []
    };
  }

  static validateEvent(event) {
    return {
      id: event.id || `event_${Date.now()}`,
      name: event.name || 'Event',
      description: event.description || ''
    };
  }

  static validateRisk(risk) {
    return {
      name: risk.name || 'Unnamed Risk',
      category: risk.category || 'Operational Risk',
      description: risk.description || '',
      likelihood: risk.likelihood || 'Medium',
      impact: risk.impact || 'Medium',
      related_steps: Array.isArray(risk.related_steps) ? risk.related_steps : []
    };
  }

  static validateControl(control) {
    return {
      name: control.name || 'Unnamed Control',
      type: control.type || 'Preventive',
      description: control.description || '',
      effectiveness: control.effectiveness || 'Medium',
      frequency: control.frequency || '',
      related_risks: Array.isArray(control.related_risks) ? control.related_risks : [],
      related_steps: Array.isArray(control.related_steps) ? control.related_steps : []
    };
  }

  static validateEnhancedStep(step) {
    return {
      id: step.id || `step_${Date.now()}`,
      name: step.name || 'Unnamed Step',
      description: step.description || '',
      type: step.type || 'task',
      actor: step.actor || '',
      inputs: Array.isArray(step.inputs) ? step.inputs : [],
      outputs: Array.isArray(step.outputs) ? step.outputs : [],
      prerequisites: Array.isArray(step.prerequisites) ? step.prerequisites : [],
      validation_criteria: Array.isArray(step.validation_criteria) ? step.validation_criteria : [],
      estimated_duration: step.estimated_duration || '',
      complexity: step.complexity || 'Medium',
      automation_potential: step.automation_potential || 'Manual'
    };
  }
}

module.exports = ResponseParser;