const { v4: uuidv4 } = require('uuid');

class XMLBuilder {
  constructor() {
    this.namespaces = {
      bpmn: 'http://www.omg.org/spec/BPMN/20100524/MODEL',
      bpmndi: 'http://www.omg.org/spec/BPMN/20100524/DI',
      dc: 'http://www.omg.org/spec/DD/20100524/DC',
      di: 'http://www.omg.org/spec/DD/20100524/DI',
      xsi: 'http://www.w3.org/2001/XMLSchema-instance'
    };
  }

  buildCompleteXML(processData, elements, flows, layout) {
    const processId = this.sanitizeId(processData.name);
    const definitionsId = `Definitions_${uuidv4()}`;
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions ${this.buildNamespaceDeclarations()}
                  id="${definitionsId}"
                  targetNamespace="http://activiti.org/bpmn"
                  exporter="Process Map Generator"
                  exporterVersion="1.0">
  ${this.buildProcess(processId, processData, elements, flows)}
  ${this.buildDiagram(processId, elements, flows, layout)}
</bpmn:definitions>`;
  }

  buildNamespaceDeclarations() {
    return Object.entries(this.namespaces)
      .map(([prefix, uri]) => `xmlns:${prefix}="${uri}"`)
      .join('\n                  ');
  }

  buildProcess(processId, processData, elements, flows) {
    return `  <bpmn:process id="${processId}" name="${this.escapeXml(processData.name)}" isExecutable="false">
${this.buildProcessElements(elements)}
${this.buildSequenceFlows(flows)}
  </bpmn:process>`;
  }

  buildProcessElements(elements) {
    return elements.map(element => {
      return this.buildElement(element);
    }).join('\n');
  }

  buildElement(element) {
    const indent = '    ';
    
    switch (element.type) {
      case 'bpmn:startEvent':
        return `${indent}<bpmn:startEvent id="${element.id}" name="${this.escapeXml(element.name)}"/>`;
      
      case 'bpmn:endEvent':
        return `${indent}<bpmn:endEvent id="${element.id}" name="${this.escapeXml(element.name)}"/>`;
      
      case 'bpmn:task':
      case 'bpmn:userTask':
      case 'bpmn:serviceTask':
      case 'bpmn:manualTask':
        return this.buildTask(element, indent);
      
      case 'bpmn:exclusiveGateway':
        return `${indent}<bpmn:exclusiveGateway id="${element.id}" name="${this.escapeXml(element.name)}"/>`;
      
      case 'bpmn:parallelGateway':
        return `${indent}<bpmn:parallelGateway id="${element.id}" name="${this.escapeXml(element.name)}"/>`;
      
      case 'bpmn:subProcess':
        return this.buildSubProcess(element, indent);
      
      case 'bpmn:intermediateCatchEvent':
        return `${indent}<bpmn:intermediateCatchEvent id="${element.id}" name="${this.escapeXml(element.name)}"/>`;
      
      case 'bpmn:intermediateThrowEvent':
        return `${indent}<bpmn:intermediateThrowEvent id="${element.id}" name="${this.escapeXml(element.name)}"/>`;
      
      default:
        return `${indent}<bpmn:task id="${element.id}" name="${this.escapeXml(element.name)}"/>`;
    }
  }

  buildTask(element, indent) {
    const tagName = element.type.replace('bpmn:', '');
    const hasContent = element.description || (element.properties && element.properties.actor);
    
    if (!hasContent) {
      return `${indent}<bpmn:${tagName} id="${element.id}" name="${this.escapeXml(element.name)}"/>`;
    }
    
    let content = '';
    
    if (element.description) {
      content += `\n${indent}  <bpmn:documentation>${this.escapeXml(element.description)}</bpmn:documentation>`;
    }
    
    if (element.properties && element.properties.actor) {
      content += `\n${indent}  <bpmn:performer>
${indent}    <bpmn:resourceRef>${this.escapeXml(element.properties.actor)}</bpmn:resourceRef>
${indent}  </bpmn:performer>`;
    }
    
    return `${indent}<bpmn:${tagName} id="${element.id}" name="${this.escapeXml(element.name)}">${content}
${indent}</bpmn:${tagName}>`;
  }

  buildSubProcess(element, indent) {
    let content = '';
    
    if (element.description) {
      content += `\n${indent}  <bpmn:documentation>${this.escapeXml(element.description)}</bpmn:documentation>`;
    }
    
    if (element.children && element.children.length > 0) {
      content += '\n' + element.children.map(child => 
        this.buildElement(child).replace(/^    /, indent + '  ')
      ).join('\n');
    }
    
    return `${indent}<bpmn:subProcess id="${element.id}" name="${this.escapeXml(element.name)}">${content}
${indent}</bpmn:subProcess>`;
  }

  buildSequenceFlows(flows) {
    return flows.map(flow => {
      const condition = flow.properties && flow.properties.condition;
      const conditionAttr = condition ? ` name="${this.escapeXml(flow.name || condition)}"` : '';
      
      if (condition) {
        return `    <bpmn:sequenceFlow id="${flow.id}" sourceRef="${flow.sourceRef}" targetRef="${flow.targetRef}"${conditionAttr}>
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">${this.escapeXml(condition)}</bpmn:conditionExpression>
    </bpmn:sequenceFlow>`;
      } else {
        return `    <bpmn:sequenceFlow id="${flow.id}" sourceRef="${flow.sourceRef}" targetRef="${flow.targetRef}"${flow.name ? ` name="${this.escapeXml(flow.name)}"` : ''}/>`;
      }
    }).join('\n');
  }

  buildDiagram(processId, elements, flows, layout) {
    const diagramId = `BPMNDiagram_${uuidv4()}`;
    const planeId = `BPMNPlane_${uuidv4()}`;
    
    return `  <bpmndi:BPMNDiagram id="${diagramId}">
    <bpmndi:BPMNPlane id="${planeId}" bpmnElement="${processId}">
${this.buildShapes(elements, layout)}
${this.buildEdges(flows, layout)}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>`;
  }

  buildShapes(elements, layout) {
    return elements.map(element => {
      const position = layout.elements.get(element.id);
      if (!position) return '';
      
      const shapeId = `${element.id}_di`;
      
      return `      <bpmndi:BPMNShape id="${shapeId}" bpmnElement="${element.id}">
        <dc:Bounds x="${position.x}" y="${position.y}" width="${position.width}" height="${position.height}"/>
        ${this.buildLabel(element, position)}
      </bpmndi:BPMNShape>`;
    }).filter(shape => shape).join('\n');
  }

  buildLabel(element, position) {
    if (!element.name) return '';
    
    // Calculate label position (below the element)
    const labelY = position.y + position.height + 5;
    const labelWidth = Math.max(position.width, element.name.length * 6);
    const labelX = position.x + (position.width - labelWidth) / 2;
    
    return `<bpmndi:BPMNLabel>
          <dc:Bounds x="${labelX}" y="${labelY}" width="${labelWidth}" height="20"/>
        </bpmndi:BPMNLabel>`;
  }

  buildEdges(flows, layout) {
    return flows.map(flow => {
      const flowLayout = layout.flows.get(flow.id);
      if (!flowLayout || !flowLayout.waypoints) return '';
      
      const edgeId = `${flow.id}_di`;
      const waypoints = flowLayout.waypoints.map(wp => 
        `        <di:waypoint x="${wp.x}" y="${wp.y}"/>`
      ).join('\n');
      
      return `      <bpmndi:BPMNEdge id="${edgeId}" bpmnElement="${flow.id}">
${waypoints}
      </bpmndi:BPMNEdge>`;
    }).filter(edge => edge).join('\n');
  }

  buildCollaboration(participants) {
    const collaborationId = `Collaboration_${uuidv4()}`;
    
    return `  <bpmn:collaboration id="${collaborationId}">
${participants.map(participant => 
  `    <bpmn:participant id="${participant.id}" name="${this.escapeXml(participant.name)}" processRef="${participant.processRef}"/>`
).join('\n')}
  </bpmn:collaboration>`;
  }

  buildLanes(lanes, layout) {
    if (!lanes || lanes.length === 0) return '';
    
    return `    <bpmn:laneSet id="LaneSet_${uuidv4()}">
${lanes.map(lane => this.buildLane(lane, layout)).join('\n')}
    </bpmn:laneSet>`;
  }

  buildLane(lane, layout) {
    const flowNodeRefs = lane.flowNodeRefs.map(ref => 
      `        <bpmn:flowNodeRef>${ref}</bpmn:flowNodeRef>`
    ).join('\n');
    
    return `      <bpmn:lane id="${lane.id}" name="${this.escapeXml(lane.name)}">
${flowNodeRefs}
      </bpmn:lane>`;
  }

  escapeXml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  sanitizeId(name) {
    return String(name)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/^[^a-zA-Z_]/, '_')
      .substring(0, 50);
  }

  formatXML(xml) {
    // Basic XML formatting
    let formatted = '';
    let indent = '';
    const lines = xml.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      if (trimmed.startsWith('</')) {
        indent = indent.substring(0, indent.length - 2);
      }
      
      formatted += indent + trimmed + '\n';
      
      if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>') && !trimmed.includes('</')) {
        indent += '  ';
      }
    }
    
    return formatted;
  }
}

module.exports = XMLBuilder;