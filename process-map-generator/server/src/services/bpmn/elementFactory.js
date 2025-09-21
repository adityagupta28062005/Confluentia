const { v4: uuidv4 } = require('uuid');

class ElementFactory {
    static createStartEvent(name = 'Start', id = null) {
        return {
            id: id || `StartEvent_${uuidv4().substring(0, 8)}`,
            type: 'bpmn:startEvent',
            name: name,
            properties: {}
        };
    }

    static createEndEvent(name = 'End', id = null) {
        return {
            id: id || `EndEvent_${uuidv4().substring(0, 8)}`,
            type: 'bpmn:endEvent',
            name: name,
            properties: {}
        };
    }

    static createTask(name, description = '', actor = '', id = null) {
        return {
            id: id || `Task_${uuidv4().substring(0, 8)}`,
            type: 'bpmn:task',
            name: name,
            description: description,
            properties: {
                actor: actor,
                taskType: 'manual'
            }
        };
    }

    static createUserTask(name, description = '', actor = '', id = null) {
        return {
            id: id || `UserTask_${uuidv4().substring(0, 8)}`,
            type: 'bpmn:userTask',
            name: name,
            description: description,
            properties: {
                actor: actor,
                assignee: actor
            }
        };
    }

    static createServiceTask(name, description = '', serviceType = '', id = null) {
        return {
            id: id || `ServiceTask_${uuidv4().substring(0, 8)}`,
            type: 'bpmn:serviceTask',
            name: name,
            description: description,
            properties: {
                implementation: serviceType,
                serviceType: serviceType
            }
        };
    }

    static createExclusiveGateway(name = 'Decision', id = null) {
        return {
            id: id || `ExclusiveGateway_${uuidv4().substring(0, 8)}`,
            type: 'bpmn:exclusiveGateway',
            name: name,
            properties: {
                gatewayDirection: 'Diverging'
            }
        };
    }

    static createParallelGateway(name = 'Parallel', id = null) {
        return {
            id: id || `ParallelGateway_${uuidv4().substring(0, 8)}`,
            type: 'bpmn:parallelGateway',
            name: name,
            properties: {
                gatewayDirection: 'Diverging'
            }
        };
    }

    static createSequenceFlow(sourceRef, targetRef, name = '', condition = '', id = null) {
        return {
            id: id || `Flow_${uuidv4().substring(0, 8)}`,
            type: 'bpmn:sequenceFlow',
            sourceRef: sourceRef,
            targetRef: targetRef,
            name: name,
            properties: {
                condition: condition
            }
        };
    }

    static createSubProcess(name, id = null) {
        return {
            id: id || `SubProcess_${uuidv4().substring(0, 8)}`,
            type: 'bpmn:subProcess',
            name: name,
            properties: {
                triggeredByEvent: false
            },
            children: []
        };
    }

    static createIntermediateCatchEvent(name, eventType = 'message', id = null) {
        return {
            id: id || `IntermediateCatchEvent_${uuidv4().substring(0, 8)}`,
            type: 'bpmn:intermediateCatchEvent',
            name: name,
            properties: {
                eventType: eventType
            }
        };
    }

    static createIntermediateThrowEvent(name, eventType = 'message', id = null) {
        return {
            id: id || `IntermediateThrowEvent_${uuidv4().substring(0, 8)}`,
            type: 'bpmn:intermediateThrowEvent',
            name: name,
            properties: {
                eventType: eventType
            }
        };
    }

    static createLane(name, id = null) {
        return {
            id: id || `Lane_${uuidv4().substring(0, 8)}`,
            type: 'bpmn:lane',
            name: name,
            properties: {},
            flowNodeRefs: []
        };
    }

    static createDataObject(name, id = null) {
        return {
            id: id || `DataObject_${uuidv4().substring(0, 8)}`,
            type: 'bpmn:dataObject',
            name: name,
            properties: {}
        };
    }

    static getTaskTypeFromDescription(description, actor) {
        const lowerDesc = (description || '').toLowerCase();
        const lowerActor = (actor || '').toLowerCase();

        // Determine task type based on content
        if (lowerActor.includes('system') || lowerDesc.includes('automated') || lowerDesc.includes('automatic')) {
            return 'serviceTask';
        } else if (lowerDesc.includes('review') || lowerDesc.includes('approve') || lowerDesc.includes('verify')) {
            return 'userTask';
        } else if (lowerDesc.includes('manual') || lowerDesc.includes('document') || lowerDesc.includes('file')) {
            return 'manualTask';
        } else {
            return 'task';
        }
    }

    static createElementFromStep(step) {
        const taskType = this.getTaskTypeFromDescription(step.description, step.actor);

        switch (taskType) {
            case 'userTask':
                return this.createUserTask(step.name, step.description, step.actor, step.id);
            case 'serviceTask':
                return this.createServiceTask(step.name, step.description, 'system', step.id);
            case 'manualTask':
                return this.createTask(step.name, step.description, step.actor, step.id);
            default:
                return this.createTask(step.name, step.description, step.actor, step.id);
        }
    }

    static createElementFromGateway(gateway) {
        switch (gateway.type) {
            case 'parallel':
                return this.createParallelGateway(gateway.name, gateway.id);
            case 'inclusive':
                return this.createExclusiveGateway(gateway.name, gateway.id);
            default:
                return this.createExclusiveGateway(gateway.name, gateway.id);
        }
    }
}

module.exports = ElementFactory;