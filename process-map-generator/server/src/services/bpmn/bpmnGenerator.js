const { v4: uuidv4 } = require('uuid');
const logger = require('../../utils/logger');

class BPMNGenerator {
  constructor() {
    this.namespace = 'http://bpmn.io/schema/bpmn';
    this.targetNamespace = 'http://activiti.org/bpmn';
  }

  async generateBPMN(processData) {
    try {
      logger.info(`Generating BPMN for process: ${processData.name}`);
      
      const processId = this.sanitizeId(processData.name);
      const elements = this.createElements(processData);
      const flows = this.createSequenceFlows(elements, processData);
      
      const bpmnXml = this.buildBPMNXML(processId, processData, elements, flows);
      
      logger.info('BPMN XML generated successfully');
      return bpmnXml;
    } catch (error) {
      logger.error('BPMN generation error:', error);
      throw new Error(`Failed to generate BPMN: ${error.message}`);
    }
  }

  createElements(processData) {
    const elements = [];
    
    // Create start event
    const startEvent = this.createElement('startEvent', {
      id: 'StartEvent_1',
      name: processData.start_events?.[0]?.name || 'Start'
    });
    elements.push(startEvent);
    
    // Create tasks for each step
    processData.steps?.forEach((step, index) => {
      const task = this.createElement('task', {
        id: step.id || `Task_${index + 1}`,
        name: step.name,
        description: step.description
      });
      elements.push(task);
    });
    
    // Create gateways
    processData.gateways?.forEach((gateway, index) => {
      const gatewayElement = this.createElement('exclusiveGateway', {
        id: gateway.id || `Gateway_${index + 1}`,
        name: gateway.name
      });
      elements.push(gatewayElement);
    });
    
    // Create end event
    const endEvent = this.createElement('endEvent', {
      id: 'EndEvent_1',
      name: processData.end_events?.[0]?.name || 'End'
    });
    elements.push(endEvent);
    
    return elements;
  }

  createElement(type, attributes) {
    return {
      type,
      id: attributes.id || this.generateId(type),
      name: attributes.name || '',
      description: attributes.description || ''
    };
  }

  createSequenceFlows(elements, processData) {
    const flows = [];
    
    // Simple linear flow for now
    for (let i = 0; i < elements.length - 1; i++) {
      flows.push({
        id: `Flow_${i + 1}`,
        sourceRef: elements[i].id,
        targetRef: elements[i + 1].id
      });
    }
    
    return flows;
  }

  buildBPMNXML(processId, processData, elements, flows) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                  id="Definitions_${uuidv4()}" 
                  targetNamespace="${this.targetNamespace}" 
                  exporter="Process Map Generator" 
                  exporterVersion="1.0">
  <bpmn:process id="${processId}" name="${processData.name}" isExecutable="false">
    ${this.generateProcessElements(elements)}
    ${this.generateSequenceFlows(flows)}
  </bpmn:process>
  ${this.generateDiagram(processId, elements, flows)}
</bpmn:definitions>`;

    return xml;
  }

  generateProcessElements(elements) {
    return elements.map(element => {
      switch (element.type) {
        case 'startEvent':
          return `    <bpmn:startEvent id="${element.id}" name="${this.escapeXml(element.name)}"/>`;
        case 'endEvent':
          return `    <bpmn:endEvent id="${element.id}" name="${this.escapeXml(element.name)}"/>`;
        case 'task':
          return `    <bpmn:task id="${element.id}" name="${this.escapeXml(element.name)}">
      ${element.description ? `<bpmn:documentation>${this.escapeXml(element.description)}</bpmn:documentation>` : ''}
    </bpmn:task>`;
        case 'exclusiveGateway':
          return `    <bpmn:exclusiveGateway id="${element.id}" name="${this.escapeXml(element.name)}"/>`;
        default:
          return `    <bpmn:task id="${element.id}" name="${this.escapeXml(element.name)}"/>`;
      }
    }).join('\n');
  }

  generateSequenceFlows(flows) {
    return flows.map(flow => 
      `    <bpmn:sequenceFlow id="${flow.id}" sourceRef="${flow.sourceRef}" targetRef="${flow.targetRef}"/>`
    ).join('\n');
  }

  generateDiagram(processId, elements, flows) {
    const shapes = this.generateShapes(elements);
    const edges = this.generateEdges(flows);
    
    return `  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${processId}">
      ${shapes}
      ${edges}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>`;
  }

  generateShapes(elements) {
    let x = 150;
    const y = 150;
    const spacing = 200;
    
    return elements.map(element => {
      const currentX = x;
      x += spacing;
      
      const dimensions = this.getElementDimensions(element.type);
      
      return `      <bpmndi:BPMNShape id="${element.id}_di" bpmnElement="${element.id}">
        <dc:Bounds x="${currentX}" y="${y}" width="${dimensions.width}" height="${dimensions.height}"/>
        ${element.name ? `<bpmndi:BPMNLabel><dc:Bounds x="${currentX}" y="${y + dimensions.height + 10}" width="${dimensions.width}" height="20"/></bpmndi:BPMNLabel>` : ''}
      </bpmndi:BPMNShape>`;
    }).join('\n');
  }

  generateEdges(flows) {
    // For now, generate simple straight lines
    // In a more sophisticated implementation, you'd calculate proper waypoints
    return flows.map(flow => 
      `      <bpmndi:BPMNEdge id="${flow.id}_di" bpmnElement="${flow.id}">
        <di:waypoint x="0" y="0"/>
        <di:waypoint x="0" y="0"/>
      </bpmndi:BPMNEdge>`
    ).join('\n');
  }

  getElementDimensions(type) {
    const dimensions = {
      'startEvent': { width: 36, height: 36 },
      'endEvent': { width: 36, height: 36 },
      'task': { width: 100, height: 80 },
      'exclusiveGateway': { width: 50, height: 50 }
    };
    
    return dimensions[type] || { width: 100, height: 80 };
  }

  sanitizeId(name) {
    return name
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/^[^a-zA-Z_]/, '_')
      .substring(0, 50);
  }

  generateId(prefix) {
    return `${prefix}_${uuidv4().substring(0, 8)}`;
  }

  escapeXml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

module.exports = BPMNGenerator;