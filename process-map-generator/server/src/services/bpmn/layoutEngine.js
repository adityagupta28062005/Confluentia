class LayoutEngine {
  constructor() {
    this.defaultSpacing = {
      horizontal: 150,
      vertical: 100,
      lane: 200
    };
    
    this.elementDimensions = {
      'bpmn:startEvent': { width: 36, height: 36 },
      'bpmn:endEvent': { width: 36, height: 36 },
      'bpmn:task': { width: 100, height: 80 },
      'bpmn:userTask': { width: 100, height: 80 },
      'bpmn:serviceTask': { width: 100, height: 80 },
      'bpmn:manualTask': { width: 100, height: 80 },
      'bpmn:exclusiveGateway': { width: 50, height: 50 },
      'bpmn:parallelGateway': { width: 50, height: 50 },
      'bpmn:subProcess': { width: 200, height: 150 },
      'bpmn:intermediateCatchEvent': { width: 36, height: 36 },
      'bpmn:intermediateThrowEvent': { width: 36, height: 36 }
    };
  }

  calculateLayout(elements, flows, options = {}) {
    const layout = {
      elements: new Map(),
      flows: new Map(),
      bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 }
    };

    // Calculate element positions
    this.positionElements(elements, layout, options);
    
    // Calculate flow waypoints
    this.calculateFlowWaypoints(flows, layout);
    
    // Calculate overall bounds
    this.calculateBounds(layout);
    
    return layout;
  }

  positionElements(elements, layout, options) {
    const startX = options.startX || 100;
    const startY = options.startY || 100;
    const flowDirection = options.flowDirection || 'horizontal';
    
    if (flowDirection === 'horizontal') {
      this.positionHorizontally(elements, layout, startX, startY);
    } else {
      this.positionVertically(elements, layout, startX, startY);
    }
  }

  positionHorizontally(elements, layout, startX, startY) {
    let currentX = startX;
    const y = startY;
    
    elements.forEach((element, index) => {
      const dimensions = this.getElementDimensions(element.type);
      
      // Center elements vertically on the same line
      const elementY = y - (dimensions.height / 2);
      
      layout.elements.set(element.id, {
        x: currentX,
        y: elementY,
        width: dimensions.width,
        height: dimensions.height
      });
      
      // Move to next position
      currentX += dimensions.width + this.defaultSpacing.horizontal;
    });
  }

  positionVertically(elements, layout, startX, startY) {
    const x = startX;
    let currentY = startY;
    
    elements.forEach((element, index) => {
      const dimensions = this.getElementDimensions(element.type);
      
      // Center elements horizontally
      const elementX = x - (dimensions.width / 2);
      
      layout.elements.set(element.id, {
        x: elementX,
        y: currentY,
        width: dimensions.width,
        height: dimensions.height
      });
      
      // Move to next position
      currentY += dimensions.height + this.defaultSpacing.vertical;
    });
  }

  positionWithLanes(elements, flows, lanes) {
    const layout = {
      elements: new Map(),
      flows: new Map(),
      lanes: new Map(),
      bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 }
    };

    let currentY = 100;
    
    lanes.forEach((lane, index) => {
      const laneHeight = this.defaultSpacing.lane;
      
      layout.lanes.set(lane.id, {
        x: 50,
        y: currentY,
        width: 800,
        height: laneHeight
      });
      
      // Position elements within this lane
      const laneElements = elements.filter(el => 
        lane.flowNodeRefs.includes(el.id)
      );
      
      this.positionElementsInLane(laneElements, layout, 100, currentY + 50);
      
      currentY += laneHeight;
    });
    
    return layout;
  }

  positionElementsInLane(elements, layout, startX, y) {
    let currentX = startX;
    
    elements.forEach(element => {
      const dimensions = this.getElementDimensions(element.type);
      
      layout.elements.set(element.id, {
        x: currentX,
        y: y,
        width: dimensions.width,
        height: dimensions.height
      });
      
      currentX += dimensions.width + this.defaultSpacing.horizontal;
    });
  }

  calculateFlowWaypoints(flows, layout) {
    flows.forEach(flow => {
      const sourcePos = layout.elements.get(flow.sourceRef);
      const targetPos = layout.elements.get(flow.targetRef);
      
      if (sourcePos && targetPos) {
        const waypoints = this.calculateStraightConnection(sourcePos, targetPos);
        layout.flows.set(flow.id, { waypoints });
      }
    });
  }

  calculateStraightConnection(sourcePos, targetPos) {
    // Calculate connection points
    const sourceCenter = {
      x: sourcePos.x + (sourcePos.width / 2),
      y: sourcePos.y + (sourcePos.height / 2)
    };
    
    const targetCenter = {
      x: targetPos.x + (targetPos.width / 2),
      y: targetPos.y + (targetPos.height / 2)
    };
    
    // For now, return straight line waypoints
    // In a more sophisticated implementation, you'd avoid overlapping elements
    return [
      { x: sourceCenter.x + (sourcePos.width / 2), y: sourceCenter.y },
      { x: targetCenter.x - (targetPos.width / 2), y: targetCenter.y }
    ];
  }

  calculateBounds(layout) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    layout.elements.forEach(pos => {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + pos.width);
      maxY = Math.max(maxY, pos.y + pos.height);
    });
    
    layout.bounds = {
      minX: minX - 50,
      minY: minY - 50,
      maxX: maxX + 50,
      maxY: maxY + 50
    };
  }

  getElementDimensions(type) {
    return this.elementDimensions[type] || { width: 100, height: 80 };
  }

  optimizeLayout(elements, flows) {
    // Simple optimization: try to minimize crossing flows
    // This is a basic implementation - more sophisticated algorithms exist
    
    const orderedElements = [...elements];
    let improved = true;
    
    while (improved) {
      improved = false;
      
      for (let i = 0; i < orderedElements.length - 1; i++) {
        const crossings1 = this.countCrossings(orderedElements, flows);
        
        // Swap adjacent elements
        [orderedElements[i], orderedElements[i + 1]] = [orderedElements[i + 1], orderedElements[i]];
        
        const crossings2 = this.countCrossings(orderedElements, flows);
        
        if (crossings2 < crossings1) {
          improved = true;
        } else {
          // Swap back if no improvement
          [orderedElements[i], orderedElements[i + 1]] = [orderedElements[i + 1], orderedElements[i]];
        }
      }
    }
    
    return orderedElements;
  }

  countCrossings(elements, flows) {
    // Count how many flows cross each other
    // This is a simplified version
    let crossings = 0;
    
    for (let i = 0; i < flows.length; i++) {
      for (let j = i + 1; j < flows.length; j++) {
        if (this.flowsCross(flows[i], flows[j], elements)) {
          crossings++;
        }
      }
    }
    
    return crossings;
  }

  flowsCross(flow1, flow2, elements) {
    // Simplified crossing detection
    const source1Index = elements.findIndex(el => el.id === flow1.sourceRef);
    const target1Index = elements.findIndex(el => el.id === flow1.targetRef);
    const source2Index = elements.findIndex(el => el.id === flow2.sourceRef);
    const target2Index = elements.findIndex(el => el.id === flow2.targetRef);
    
    // Check if flows cross in terms of element ordering
    return (source1Index < source2Index && target1Index > target2Index) ||
           (source1Index > source2Index && target1Index < target2Index);
  }
}

module.exports = LayoutEngine;