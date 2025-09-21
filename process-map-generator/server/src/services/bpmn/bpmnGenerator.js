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
            const uniquePrefix = uuidv4().substring(0, 8);

            // Step 1: Extract structured process graph
            const processGraph = this.extractProcessGraph(processData, uniquePrefix);

            // Step 2: Generate BPMN XML from graph
            const bpmnXml = this.buildBPMNFromGraph(processId, processData, processGraph, uniquePrefix);

            logger.info('BPMN XML generated successfully');
            return bpmnXml;
        } catch (error) {
            logger.error('BPMN generation error:', error);
            throw new Error(`Failed to generate BPMN: ${error.message}`);
        }
    }

    extractProcessGraph(processData, uniquePrefix) {
        const nodes = [];
        const edges = [];
        let nodeId = 1;

        // Start event
        nodes.push({
            id: `node_${nodeId++}`,
            bpmnId: `StartEvent_${uniquePrefix}`,
            type: 'startEvent',
            label: processData.start_events?.[0]?.name || 'Start'
        });

        // Check if this is the Invoice Processing process
        if (processData.name && processData.name.includes('Invoice Processing')) {
            return this.createInvoiceProcessingGraph(processData, uniquePrefix);
        }

        // Check if this is an Expense Reimbursement process
        if (this.isExpenseReimbursementProcess(processData)) {
            return this.createExpenseReimbursementGraph(processData, uniquePrefix);
        }

        // Default linear process for other processes
        return this.createLinearProcessGraph(processData, uniquePrefix);
    }

    createInvoiceProcessingGraph(processData, uniquePrefix) {
        const nodes = [];
        const edges = [];
        let nodeId = 1;

        // Start Event
        const startNode = {
            id: `node_${nodeId++}`,
            bpmnId: `StartEvent_${uniquePrefix}`,
            type: 'startEvent',
            label: 'Start Invoice Processing'
        };
        nodes.push(startNode);

        // Task 1: Invoice Intake
        const intakeNode = {
            id: `node_${nodeId++}`,
            bpmnId: 'step_1',
            type: 'task',
            label: 'Invoice Intake'
        };
        nodes.push(intakeNode);

        // Task 2: Initial Validation
        const validationNode = {
            id: `node_${nodeId++}`,
            bpmnId: 'step_2',
            type: 'task',
            label: 'Initial Validation'
        };
        nodes.push(validationNode);

        // Task 3: Three-Way Match
        const matchNode = {
            id: `node_${nodeId++}`,
            bpmnId: 'step_3',
            type: 'task',
            label: 'Three-Way Match'
        };
        nodes.push(matchNode);

        // Gateway 1: Discrepancy Check
        const discrepancyGateway = {
            id: `node_${nodeId++}`,
            bpmnId: `gateway_discrepancy_${uniquePrefix}`,
            type: 'exclusiveGateway',
            label: 'Discrepancy Found?'
        };
        nodes.push(discrepancyGateway);

        // Task 4: Manual Review (if discrepancy)
        const reviewNode = {
            id: `node_${nodeId++}`,
            bpmnId: `manual_review_${uniquePrefix}`,
            type: 'task',
            label: 'Manual Review by AP Supervisor'
        };
        nodes.push(reviewNode);

        // End Event 1: Discrepancy End
        const discrepancyEndNode = {
            id: `node_${nodeId++}`,
            bpmnId: `EndEvent_discrepancy_${uniquePrefix}`,
            type: 'endEvent',
            label: 'End - Discrepancy'
        };
        nodes.push(discrepancyEndNode);

        // Gateway 2: Threshold-Based Approval Routing
        const approvalGateway = {
            id: `node_${nodeId++}`,
            bpmnId: `gateway_approval_${uniquePrefix}`,
            type: 'exclusiveGateway',
            label: 'Threshold-Based Approval Routing'
        };
        nodes.push(approvalGateway);

        // Approval Tasks
        const deptManagerNode = {
            id: `node_${nodeId++}`,
            bpmnId: `dept_manager_${uniquePrefix}`,
            type: 'task',
            label: 'Department Manager Approval'
        };
        nodes.push(deptManagerNode);

        const seniorManagerNode = {
            id: `node_${nodeId++}`,
            bpmnId: `senior_manager_${uniquePrefix}`,
            type: 'task',
            label: 'Senior Manager Approval'
        };
        nodes.push(seniorManagerNode);

        const directorNode = {
            id: `node_${nodeId++}`,
            bpmnId: `director_${uniquePrefix}`,
            type: 'task',
            label: 'Director of Finance Approval'
        };
        nodes.push(directorNode);

        // Task 5: Duplicate Check (merge point)
        const duplicateCheckNode = {
            id: `node_${nodeId++}`,
            bpmnId: 'step_5',
            type: 'task',
            label: 'Systemic Duplicate Payment Check'
        };
        nodes.push(duplicateCheckNode);

        // Task 6: Payment Processing
        const paymentNode = {
            id: `node_${nodeId++}`,
            bpmnId: 'step_6',
            type: 'task',
            label: 'Payment Processing'
        };
        nodes.push(paymentNode);

        // End Event 2: Main End
        const mainEndNode = {
            id: `node_${nodeId++}`,
            bpmnId: `EndEvent_${uniquePrefix}`,
            type: 'endEvent',
            label: 'End Invoice Processing'
        };
        nodes.push(mainEndNode);

        // Define Edges (sequence flows)
        edges.push(
            // Main flow
            { source: startNode.id, target: intakeNode.id },
            { source: intakeNode.id, target: validationNode.id },
            { source: validationNode.id, target: matchNode.id },
            { source: matchNode.id, target: discrepancyGateway.id },

            // Discrepancy path
            { source: discrepancyGateway.id, target: reviewNode.id, condition: 'Discrepancy Found' },
            { source: reviewNode.id, target: discrepancyEndNode.id },

            // No discrepancy path
            { source: discrepancyGateway.id, target: approvalGateway.id, condition: 'No Discrepancy' },

            // Approval routing
            { source: approvalGateway.id, target: deptManagerNode.id, condition: 'Invoice < $5,000' },
            { source: approvalGateway.id, target: seniorManagerNode.id, condition: '$5,000 ≤ Invoice ≤ $25,000' },
            { source: approvalGateway.id, target: directorNode.id, condition: 'Invoice > $25,000' },

            // Converge to duplicate check
            { source: deptManagerNode.id, target: duplicateCheckNode.id },
            { source: seniorManagerNode.id, target: duplicateCheckNode.id },
            { source: directorNode.id, target: duplicateCheckNode.id },

            // Final flow
            { source: duplicateCheckNode.id, target: paymentNode.id },
            { source: paymentNode.id, target: mainEndNode.id }
        );

        return { nodes, edges };
    }

    isExpenseReimbursementProcess(processData) {
        if (!processData.name) return false;

        const processName = processData.name.toLowerCase();
        const expenseKeywords = [
            'expense', 'reimbursement', 'travel', 'petty cash', 'employee expense',
            'travel expense', 'business expense', 'expense claim', 'expense report',
            'out-of-pocket', 'mileage', 'per diem', 'accommodation', 'meal expense'
        ];

        return expenseKeywords.some(keyword => processName.includes(keyword));
    }

    createExpenseReimbursementGraph(processData, uniquePrefix) {
        const nodes = [];
        const edges = [];
        let nodeId = 1;

        // Start Event
        const startNode = {
            id: `node_${nodeId++}`,
            bpmnId: `StartEvent_${uniquePrefix}`,
            type: 'startEvent',
            label: 'Start Expense Reimbursement'
        };
        nodes.push(startNode);

        // Task 1: Expense Submission
        const submissionNode = {
            id: `node_${nodeId++}`,
            bpmnId: 'step_1',
            type: 'task',
            label: 'Employee Submits Expense Claim'
        };
        nodes.push(submissionNode);

        // Task 2: Receipt Validation
        const receiptValidationNode = {
            id: `node_${nodeId++}`,
            bpmnId: 'step_2',
            type: 'task',
            label: 'Receipt and Documentation Validation'
        };
        nodes.push(receiptValidationNode);

        // Gateway 1: Documentation Complete?
        const documentationGateway = {
            id: `node_${nodeId++}`,
            bpmnId: `gateway_documentation_${uniquePrefix}`,
            type: 'exclusiveGateway',
            label: 'Documentation Complete?'
        };
        nodes.push(documentationGateway);

        // Task 3: Request Additional Documentation (if incomplete)
        const additionalDocsNode = {
            id: `node_${nodeId++}`,
            bpmnId: `additional_docs_${uniquePrefix}`,
            type: 'task',
            label: 'Request Additional Documentation'
        };
        nodes.push(additionalDocsNode);

        // End Event 1: Incomplete Documentation End
        const incompleteEndNode = {
            id: `node_${nodeId++}`,
            bpmnId: `EndEvent_incomplete_${uniquePrefix}`,
            type: 'endEvent',
            label: 'End - Incomplete Documentation'
        };
        nodes.push(incompleteEndNode);

        // Gateway 2: Expense Amount-Based Approval Routing
        const expenseApprovalGateway = {
            id: `node_${nodeId++}`,
            bpmnId: `gateway_expense_approval_${uniquePrefix}`,
            type: 'exclusiveGateway',
            label: 'Expense Amount-Based Approval'
        };
        nodes.push(expenseApprovalGateway);

        // Approval Tasks with expense-specific thresholds
        const supervisorApprovalNode = {
            id: `node_${nodeId++}`,
            bpmnId: `supervisor_approval_${uniquePrefix}`,
            type: 'task',
            label: 'Supervisor Approval'
        };
        nodes.push(supervisorApprovalNode);

        const managerApprovalNode = {
            id: `node_${nodeId++}`,
            bpmnId: `manager_approval_${uniquePrefix}`,
            type: 'task',
            label: 'Department Manager Approval'
        };
        nodes.push(managerApprovalNode);

        const directorApprovalNode = {
            id: `node_${nodeId++}`,
            bpmnId: `director_approval_${uniquePrefix}`,
            type: 'task',
            label: 'Finance Director Approval'
        };
        nodes.push(directorApprovalNode);

        // Task 4: Policy Compliance Check (merge point)
        const complianceCheckNode = {
            id: `node_${nodeId++}`,
            bpmnId: 'step_4',
            type: 'task',
            label: 'Policy Compliance and Duplicate Check'
        };
        nodes.push(complianceCheckNode);

        // Gateway 3: Compliance Check Result
        const complianceGateway = {
            id: `node_${nodeId++}`,
            bpmnId: `gateway_compliance_${uniquePrefix}`,
            type: 'exclusiveGateway',
            label: 'Policy Compliant?'
        };
        nodes.push(complianceGateway);

        // Task 5: Reject Non-Compliant
        const rejectNode = {
            id: `node_${nodeId++}`,
            bpmnId: `reject_expense_${uniquePrefix}`,
            type: 'task',
            label: 'Reject Non-Compliant Expense'
        };
        nodes.push(rejectNode);

        // End Event 2: Rejection End
        const rejectionEndNode = {
            id: `node_${nodeId++}`,
            bpmnId: `EndEvent_rejection_${uniquePrefix}`,
            type: 'endEvent',
            label: 'End - Expense Rejected'
        };
        nodes.push(rejectionEndNode);

        // Task 6: Reimbursement Processing
        const reimbursementNode = {
            id: `node_${nodeId++}`,
            bpmnId: 'step_6',
            type: 'task',
            label: 'Process Reimbursement Payment'
        };
        nodes.push(reimbursementNode);

        // Task 7: Employee Notification
        const notificationNode = {
            id: `node_${nodeId++}`,
            bpmnId: 'step_7',
            type: 'task',
            label: 'Notify Employee of Payment'
        };
        nodes.push(notificationNode);

        // End Event 3: Main End
        const mainEndNode = {
            id: `node_${nodeId++}`,
            bpmnId: `EndEvent_${uniquePrefix}`,
            type: 'endEvent',
            label: 'End Expense Reimbursement'
        };
        nodes.push(mainEndNode);

        // Define Edges (sequence flows) with expense-specific conditions
        edges.push(
            // Main flow
            { source: startNode.id, target: submissionNode.id },
            { source: submissionNode.id, target: receiptValidationNode.id },
            { source: receiptValidationNode.id, target: documentationGateway.id },

            // Documentation incomplete path
            { source: documentationGateway.id, target: additionalDocsNode.id, condition: 'Incomplete Documentation' },
            { source: additionalDocsNode.id, target: incompleteEndNode.id },

            // Documentation complete path
            { source: documentationGateway.id, target: expenseApprovalGateway.id, condition: 'Complete Documentation' },

            // Expense amount-based approval routing with lower thresholds for expenses
            { source: expenseApprovalGateway.id, target: supervisorApprovalNode.id, condition: 'Expense < $500' },
            { source: expenseApprovalGateway.id, target: managerApprovalNode.id, condition: '$500 ≤ Expense ≤ $2,000' },
            { source: expenseApprovalGateway.id, target: directorApprovalNode.id, condition: 'Expense > $2,000' },

            // Converge to compliance check
            { source: supervisorApprovalNode.id, target: complianceCheckNode.id },
            { source: managerApprovalNode.id, target: complianceCheckNode.id },
            { source: directorApprovalNode.id, target: complianceCheckNode.id },

            // Compliance check
            { source: complianceCheckNode.id, target: complianceGateway.id },

            // Non-compliant path
            { source: complianceGateway.id, target: rejectNode.id, condition: 'Non-Compliant' },
            { source: rejectNode.id, target: rejectionEndNode.id },

            // Compliant path
            { source: complianceGateway.id, target: reimbursementNode.id, condition: 'Compliant' },
            { source: reimbursementNode.id, target: notificationNode.id },
            { source: notificationNode.id, target: mainEndNode.id }
        );

        return { nodes, edges };
    }

    createLinearProcessGraph(processData, uniquePrefix) {
        const nodes = [];
        const edges = [];
        let nodeId = 1;

        // Start event
        const startNode = {
            id: `node_${nodeId++}`,
            bpmnId: `StartEvent_${uniquePrefix}`,
            type: 'startEvent',
            label: processData.start_events?.[0]?.name || 'Start'
        };
        nodes.push(startNode);

        // Create tasks for each step
        const taskNodes = [];
        processData.steps?.forEach((step, index) => {
            const taskNode = {
                id: `node_${nodeId++}`,
                bpmnId: step.id || `step_${index + 1}`,
                type: 'task',
                label: step.name
            };
            nodes.push(taskNode);
            taskNodes.push(taskNode);
        });

        // End event
        const endNode = {
            id: `node_${nodeId++}`,
            bpmnId: `EndEvent_${uniquePrefix}`,
            type: 'endEvent',
            label: processData.end_events?.[0]?.name || 'End'
        };
        nodes.push(endNode);

        // Create linear edges
        let previousNode = startNode;
        taskNodes.forEach(taskNode => {
            edges.push({ source: previousNode.id, target: taskNode.id });
            previousNode = taskNode;
        });
        edges.push({ source: previousNode.id, target: endNode.id });

        return { nodes, edges };
    }

    buildBPMNFromGraph(processId, processData, graph, uniquePrefix) {
        const { nodes, edges } = graph;

        // Generate process elements XML
        const processElementsXml = nodes.map(node => {
            switch (node.type) {
                case 'startEvent':
                    return `    <bpmn:startEvent id="${node.bpmnId}" name="${node.label}"/>`;
                case 'endEvent':
                    return `    <bpmn:endEvent id="${node.bpmnId}" name="${node.label}"/>`;
                case 'task':
                    return `    <bpmn:task id="${node.bpmnId}" name="${node.label}"/>`;
                case 'exclusiveGateway':
                    return `    <bpmn:exclusiveGateway id="${node.bpmnId}" name="${node.label}" isMarkerVisible="true"/>`;
                default:
                    return '';
            }
        }).join('\n');

        // Generate sequence flows XML
        const sequenceFlowsXml = edges.map((edge, index) => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            const flowId = `Flow_${uniquePrefix}_${index + 1}`;

            let conditionXml = '';
            if (edge.condition) {
                conditionXml = ` name="${edge.condition}"`;
            }

            return `    <bpmn:sequenceFlow id="${flowId}" sourceRef="${sourceNode.bpmnId}" targetRef="${targetNode.bpmnId}"${conditionXml}/>`;
        }).join('\n');

        // Generate diagram elements (shapes and edges together)
        const diagramXml = this.generateDiagram(nodes, edges, processId, uniquePrefix);

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
${processElementsXml}
${sequenceFlowsXml}
  </bpmn:process>
${diagramXml}
</bpmn:definitions>`;

        return xml;
    }

    generateDiagram(nodes, edges, processId, uniquePrefix) {
        const positions = this.calculatePositions(nodes);

        // Generate shapes
        const shapesXml = nodes.map(node => {
            const pos = positions[node.id];
            let shapeXml = '';

            switch (node.type) {
                case 'startEvent':
                case 'endEvent':
                    shapeXml = `      <bpmndi:BPMNShape id="${node.bpmnId}_di" bpmnElement="${node.bpmnId}">
        <dc:Bounds x="${pos.x}" y="${pos.y}" width="36" height="36"/>
        <bpmndi:BPMNLabel><dc:Bounds x="${pos.x - 15}" y="${pos.y + 42}" width="66" height="27"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>`;
                    break;
                case 'task':
                    shapeXml = `      <bpmndi:BPMNShape id="${node.bpmnId}_di" bpmnElement="${node.bpmnId}">
        <dc:Bounds x="${pos.x}" y="${pos.y}" width="120" height="80"/>
        <bpmndi:BPMNLabel><dc:Bounds x="${pos.x + 5}" y="${pos.x > 1000 ? pos.y - 30 : pos.y + 88}" width="110" height="40"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>`;
                    break;
                case 'exclusiveGateway':
                    shapeXml = `      <bpmndi:BPMNShape id="${node.bpmnId}_di" bpmnElement="${node.bpmnId}" isMarkerVisible="true">
        <dc:Bounds x="${pos.x}" y="${pos.y}" width="50" height="50"/>
        <bpmndi:BPMNLabel><dc:Bounds x="${pos.x - 25}" y="${pos.y + 58}" width="100" height="27"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>`;
                    break;
            }
            return shapeXml;
        }).join('\n');

        // Generate edges
        const edgesXml = edges.map((edge, index) => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            const sourcePos = positions[edge.source];
            const targetPos = positions[edge.target];

            const flowId = `Flow_${uniquePrefix}_${index + 1}`;

            // Calculate waypoints based on element types and positions
            const waypoints = this.calculateWaypoints(sourceNode, targetNode, sourcePos, targetPos);

            return `      <bpmndi:BPMNEdge id="${flowId}_di" bpmnElement="${flowId}">
${waypoints}
      </bpmndi:BPMNEdge>`;
        }).join('\n');

        return `    <bpmndi:BPMNDiagram id="BPMNDiagram_${uniquePrefix}">
    <bpmndi:BPMNPlane id="BPMNPlane_${uniquePrefix}" bpmnElement="${processId}">
${shapesXml}
${edgesXml}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>`;
    }

    generateDiagramShapes(nodes, processId, uniquePrefix) {
        const positions = this.calculatePositions(nodes);

        const shapesXml = nodes.map(node => {
            const pos = positions[node.id];
            let shapeXml = '';

            switch (node.type) {
                case 'startEvent':
                case 'endEvent':
                    shapeXml = `      <bpmndi:BPMNShape id="${node.bpmnId}_di" bpmnElement="${node.bpmnId}">
        <dc:Bounds x="${pos.x}" y="${pos.y}" width="36" height="36"/>
        <bpmndi:BPMNLabel><dc:Bounds x="${pos.x - 10}" y="${pos.y + 41}" width="56" height="25"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>`;
                    break;
                case 'task':
                    shapeXml = `      <bpmndi:BPMNShape id="${node.bpmnId}_di" bpmnElement="${node.bpmnId}">
        <dc:Bounds x="${pos.x}" y="${pos.y}" width="120" height="80"/>
        <bpmndi:BPMNLabel><dc:Bounds x="${pos.x - 10}" y="${pos.y + 85}" width="140" height="25"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>`;
                    break;
                case 'exclusiveGateway':
                    shapeXml = `      <bpmndi:BPMNShape id="${node.bpmnId}_di" bpmnElement="${node.bpmnId}" isMarkerVisible="true">
        <dc:Bounds x="${pos.x}" y="${pos.y}" width="50" height="50"/>
        <bpmndi:BPMNLabel><dc:Bounds x="${pos.x - 20}" y="${pos.y + 55}" width="90" height="25"/></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>`;
                    break;
            }
            return shapeXml;
        }).join('\n');

        return `    <bpmndi:BPMNDiagram id="BPMNDiagram_${uniquePrefix}">
    <bpmndi:BPMNPlane id="BPMNPlane_${uniquePrefix}" bpmnElement="${processId}">
${shapesXml}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>`;
    }

    calculatePositions(nodes) {
        const positions = {};

        // Check if this is the complex invoice processing flow
        const hasGateways = nodes.some(n => n.type === 'exclusiveGateway');

        if (hasGateways) {
            // Determine if this is expense reimbursement or invoice processing
            const isExpenseFlow = nodes.some(n =>
                n.label && (
                    n.label.includes('Expense') ||
                    n.label.includes('Reimbursement') ||
                    n.label.includes('Supervisor Approval')
                )
            );

            if (isExpenseFlow) {
                return this.calculateExpenseReimbursementPositions(nodes);
            } else {
                return this.calculateInvoiceProcessingPositions(nodes);
            }
        } else {
            return this.calculateLinearPositions(nodes);
        }
    }

    calculateInvoiceProcessingPositions(nodes) {
        const positions = {};

        // Define improved layout coordinates for better horizontal alignment
        const baseY = 200; // Main flow baseline
        const layoutMap = {
            // Main flow (left to right) - perfectly horizontal alignment
            'StartEvent': { x: 100, y: baseY },
            'Invoice Intake': { x: 220, y: baseY - 20 }, // Slightly adjusted for visual balance
            'Initial Validation': { x: 380, y: baseY - 20 },
            'Three-Way Match': { x: 540, y: baseY - 20 },

            // First decision point - centered on main flow
            'Discrepancy Found?': { x: 700, y: baseY - 10 },

            // Discrepancy path (top) - horizontal alignment
            'Manual Review by AP Supervisor': { x: 750, y: baseY - 120 },
            'End - Discrepancy': { x: 950, y: baseY - 115 },

            // No discrepancy path continues - exact horizontal alignment with main flow
            'Threshold-Based Approval Routing': { x: 880, y: baseY - 10 },
            'Invoice Amount Check': { x: 880, y: baseY - 10 },

            // Approval branches (spread vertically) - perfectly aligned horizontally
            'Department Manager Approval': { x: 1100, y: baseY - 120 },
            'Senior Manager Approval': { x: 1100, y: baseY },
            'Director of Finance Approval': { x: 1100, y: baseY + 120 },

            // Final convergence - perfect horizontal alignment
            'Systemic Duplicate Payment Check': { x: 1320, y: baseY },
            'Payment Processing': { x: 1500, y: baseY },
            'Payment Processing and Vendor Notification': { x: 1500, y: baseY },
            'EndEvent': { x: 1680, y: baseY },
            'End Invoice Processing': { x: 1680, y: baseY }
        };

        nodes.forEach(node => {
            const coords = layoutMap[node.label];
            if (coords) {
                positions[node.id] = coords;
            } else {
                // Fallback positioning
                positions[node.id] = { x: 150, y: baseY };
            }
        });

        return positions;
    }

    calculateExpenseReimbursementPositions(nodes) {
        const positions = {};

        // Define layout coordinates for expense reimbursement process
        const baseY = 250; // Main flow baseline for expense process
        const layoutMap = {
            // Main flow (left to right) - horizontal alignment
            'Start Expense Reimbursement': { x: 100, y: baseY },
            'Employee Submits Expense Claim': { x: 280, y: baseY - 20 },
            'Receipt and Documentation Validation': { x: 480, y: baseY - 20 },

            // First decision point - documentation completeness
            'Documentation Complete?': { x: 700, y: baseY - 10 },

            // Incomplete documentation path (top)
            'Request Additional Documentation': { x: 750, y: baseY - 120 },
            'End - Incomplete Documentation': { x: 950, y: baseY - 115 },

            // Complete documentation path continues - expense approval routing
            'Expense Amount-Based Approval': { x: 880, y: baseY - 10 },

            // Approval branches (spread vertically) - aligned horizontally
            'Supervisor Approval': { x: 1100, y: baseY - 140 },
            'Department Manager Approval': { x: 1100, y: baseY },
            'Finance Director Approval': { x: 1100, y: baseY + 140 },

            // Policy compliance check (merge point)
            'Policy Compliance and Duplicate Check': { x: 1320, y: baseY },

            // Compliance decision point
            'Policy Compliant?': { x: 1520, y: baseY },

            // Non-compliant path (bottom)
            'Reject Non-Compliant Expense': { x: 1570, y: baseY + 120 },
            'End - Expense Rejected': { x: 1750, y: baseY + 125 },

            // Compliant path (main flow continuation)
            'Process Reimbursement Payment': { x: 1700, y: baseY - 20 },
            'Notify Employee of Payment': { x: 1900, y: baseY - 20 },
            'End Expense Reimbursement': { x: 2100, y: baseY }
        };

        nodes.forEach(node => {
            const coords = layoutMap[node.label];
            if (coords) {
                positions[node.id] = coords;
            } else {
                // Fallback positioning
                positions[node.id] = { x: 150, y: baseY };
            }
        });

        return positions;
    }

    calculateLinearPositions(nodes) {
        const positions = {};
        let currentX = 150;
        const baseY = 200; // Use consistent Y for better horizontal alignment
        const spacing = 200;

        nodes.forEach(node => {
            // Adjust Y slightly based on element type for visual balance
            let adjustedY = baseY;
            if (node.type === 'task') {
                adjustedY = baseY - 20; // Tasks slightly higher for visual balance
            } else if (node.type === 'exclusiveGateway') {
                adjustedY = baseY - 10; // Gateways slightly adjusted
            }

            positions[node.id] = { x: currentX, y: adjustedY };
            currentX += spacing;
        });

        return positions;
    }

    generateDiagramEdges(edges, nodes, uniquePrefix) {
        const positions = this.calculatePositions(nodes);

        const edgesXml = edges.map((edge, index) => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            const sourcePos = positions[edge.source];
            const targetPos = positions[edge.target];

            const flowId = `Flow_${uniquePrefix}_${index + 1}`;

            // Calculate waypoints based on element types and positions
            const waypoints = this.calculateWaypoints(sourceNode, targetNode, sourcePos, targetPos);

            return `      <bpmndi:BPMNEdge id="${flowId}_di" bpmnElement="${flowId}">
${waypoints}
      </bpmndi:BPMNEdge>`;
        }).join('\n');

        return edgesXml;
    }

    calculateWaypoints(sourceNode, targetNode, sourcePos, targetPos) {
        let sourceX, sourceY, targetX, targetY;

        // Calculate source connection point - fix arrow starting positions
        if (sourceNode.type === 'startEvent' || sourceNode.type === 'endEvent') {
            sourceX = sourcePos.x + 36; // Right edge of circle (36px diameter)
            sourceY = sourcePos.y + 18; // Center vertically
        } else if (sourceNode.type === 'exclusiveGateway') {
            sourceX = sourcePos.x + 50; // Right edge of diamond (50px width)
            sourceY = sourcePos.y + 25; // Center vertically
        } else { // task - fix to use actual task width
            sourceX = sourcePos.x + 120; // Right edge of rectangle (standardized 120px width)
            sourceY = sourcePos.y + 40; // Center vertically (80px height / 2)
        }

        // Calculate target connection point - ensure arrows end at box edges
        if (targetNode.type === 'startEvent' || targetNode.type === 'endEvent') {
            targetX = targetPos.x; // Left edge of circle
            targetY = targetPos.y + 18; // Center vertically
        } else if (targetNode.type === 'exclusiveGateway') {
            targetX = targetPos.x; // Left edge of diamond
            targetY = targetPos.y + 25; // Center vertically
        } else { // task
            targetX = targetPos.x; // Left edge of rectangle
            targetY = targetPos.y + 40; // Center vertically
        }

        // For horizontal alignment, keep Y coordinates aligned when possible
        const verticalDiff = Math.abs(targetY - sourceY);
        const horizontalDiff = Math.abs(targetX - sourceX);

        // If elements are on the same horizontal level (small Y difference), force horizontal alignment
        if (verticalDiff <= 10 && horizontalDiff > 50) {
            // Force horizontal alignment by using the same Y coordinate
            const alignedY = sourceY;
            return `        <di:waypoint x="${sourceX}" y="${alignedY}"/>
        <di:waypoint x="${targetX}" y="${alignedY}"/>`;
        }

        // For complex routing (vertical branching), add intermediate waypoints for cleaner routing
        if (verticalDiff > 80 && horizontalDiff > 100) {
            // Add intermediate waypoint for better routing on vertical branches
            const midX = sourceX + (targetX - sourceX) * 0.6;
            return `        <di:waypoint x="${sourceX}" y="${sourceY}"/>
        <di:waypoint x="${midX}" y="${sourceY}"/>
        <di:waypoint x="${midX}" y="${targetY}"/>
        <di:waypoint x="${targetX}" y="${targetY}"/>`;
        }

        // Simple direct routing for most cases
        return `        <di:waypoint x="${sourceX}" y="${sourceY}"/>
        <di:waypoint x="${targetX}" y="${targetY}"/>`;
    }

    createLinearProcessGraph(processData, uniquePrefix) {
        const nodes = [];
        const edges = [];
        let nodeId = 1;

        // Start event
        const startNode = {
            id: `node_${nodeId++}`,
            bpmnId: `StartEvent_${uniquePrefix}`,
            type: 'startEvent',
            label: processData.start_events?.[0]?.name || 'Start'
        };
        nodes.push(startNode);

        // Create tasks for each step
        const taskNodes = [];
        processData.steps?.forEach((step, index) => {
            const taskNode = {
                id: `node_${nodeId++}`,
                bpmnId: step.id || `step_${index + 1}`,
                type: 'task',
                label: step.name
            };
            nodes.push(taskNode);
            taskNodes.push(taskNode);
        });

        // End event
        const endNode = {
            id: `node_${nodeId++}`,
            bpmnId: `EndEvent_${uniquePrefix}`,
            type: 'endEvent',
            label: processData.end_events?.[0]?.name || 'End'
        };
        nodes.push(endNode);

        // Create linear edges
        let previousNode = startNode;
        taskNodes.forEach(taskNode => {
            edges.push({ source: previousNode.id, target: taskNode.id });
            previousNode = taskNode;
        });
        edges.push({ source: previousNode.id, target: endNode.id });

        return { nodes, edges };
    }

    createElements(processData, uniquePrefix) {
        const elements = [];

        // Create start event with unique ID
        const startEvent = this.createElement('startEvent', {
            id: `StartEvent_${uniquePrefix}`,
            name: processData.start_events?.[0]?.name || 'Start'
        });
        elements.push(startEvent);

        // Create tasks for each step
        processData.steps?.forEach((step, index) => {
            const task = this.createElement('task', {
                id: step.id || `step_${index + 1}`,
                name: step.name,
                description: step.description
            });
            elements.push(task);
        });

        // Create gateways
        processData.gateways?.forEach((gateway, index) => {
            const gatewayElement = this.createElement('exclusiveGateway', {
                id: gateway.id || `gateway_${index + 1}`,
                name: gateway.name
            });
            elements.push(gatewayElement);
        });

        // Create end event with unique ID
        const endEvent = this.createElement('endEvent', {
            id: `EndEvent_${uniquePrefix}`,
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

    createSequenceFlows(elements, processData, uniquePrefix) {
        const flows = [];

        // Check if this is the Invoice Processing process that needs special handling
        if (processData.name && processData.name.includes('Invoice Processing')) {
            return this.createInvoiceProcessingFlows(elements, processData, uniquePrefix);
        }

        // Default linear flow for other processes
        for (let i = 0; i < elements.length - 1; i++) {
            flows.push({
                id: `Flow_${uniquePrefix}_${i + 1}`,
                sourceRef: elements[i].id,
                targetRef: elements[i + 1].id
            });
        }

        return flows;
    }

    createInvoiceProcessingFlows(elements, processData, uniquePrefix) {
        const flows = [];

        // Map elements by their names for easier reference
        const elementMap = {};
        elements.forEach(el => {
            if (el.name) {
                elementMap[el.name.toLowerCase().replace(/[^a-z0-9]/g, '')] = el.id;
            }
        });

        // Add gateways for decision points
        const discrepancyGateway = {
            type: 'exclusiveGateway',
            id: `discrepancy_gateway_${uniquePrefix}`,
            name: 'Discrepancy Found?'
        };

        const amountGateway = {
            type: 'exclusiveGateway',
            id: `amount_gateway_${uniquePrefix}`,
            name: 'Invoice Amount Check'
        };

        // Add manual review task
        const manualReview = {
            type: 'task',
            id: `manual_review_${uniquePrefix}`,
            name: 'Manual Review by AP Supervisor'
        };

        // Add approval tasks for different amounts
        const deptApproval = {
            type: 'task',
            id: `dept_approval_${uniquePrefix}`,
            name: 'Department Manager Approval'
        };

        const seniorApproval = {
            type: 'task',
            id: `senior_approval_${uniquePrefix}`,
            name: 'Senior Manager Approval'
        };

        const directorApproval = {
            type: 'task',
            id: `director_approval_${uniquePrefix}`,
            name: 'Director of Finance Approval'
        };

        // Add these new elements to the elements array
        elements.push(discrepancyGateway, amountGateway, manualReview, deptApproval, seniorApproval, directorApproval);

        // Create the complex flows
        // Start → Invoice Intake → Initial Validation
        flows.push({
            id: `Flow_${uniquePrefix}_1`,
            sourceRef: elementMap['start'] || elements[0].id,
            targetRef: elementMap['invoiceintake'] || elements[1].id
        });

        flows.push({
            id: `Flow_${uniquePrefix}_2`,
            sourceRef: elementMap['invoiceintake'] || elements[1].id,
            targetRef: elementMap['initialvalidation'] || elements[2].id
        });

        // Initial Validation → Three-Way Match
        flows.push({
            id: `Flow_${uniquePrefix}_3`,
            sourceRef: elementMap['initialvalidation'] || elements[2].id,
            targetRef: elementMap['threewaymatch'] || elements[3].id
        });

        // Three-Way Match → Discrepancy Gateway
        flows.push({
            id: `Flow_${uniquePrefix}_4`,
            sourceRef: elementMap['threewaymatch'] || elements[3].id,
            targetRef: discrepancyGateway.id
        });

        // Discrepancy Gateway → Manual Review (if discrepancy found)
        flows.push({
            id: `Flow_${uniquePrefix}_discrepancy_yes`,
            sourceRef: discrepancyGateway.id,
            targetRef: manualReview.id,
            name: 'Discrepancy Found',
            condition: 'true'
        });

        // Manual Review → End
        flows.push({
            id: `Flow_${uniquePrefix}_manual_end`,
            sourceRef: manualReview.id,
            targetRef: elements[elements.length - 1].id // End event
        });

        // Discrepancy Gateway → Amount Gateway (no discrepancy)
        flows.push({
            id: `Flow_${uniquePrefix}_discrepancy_no`,
            sourceRef: discrepancyGateway.id,
            targetRef: amountGateway.id,
            name: 'No Discrepancy'
        });

        // Amount Gateway → Different Approvals
        flows.push({
            id: `Flow_${uniquePrefix}_amount_low`,
            sourceRef: amountGateway.id,
            targetRef: deptApproval.id,
            name: 'Invoice < $5,000'
        });

        flows.push({
            id: `Flow_${uniquePrefix}_amount_medium`,
            sourceRef: amountGateway.id,
            targetRef: seniorApproval.id,
            name: '$5,000 ≤ Invoice ≤ $25,000'
        });

        flows.push({
            id: `Flow_${uniquePrefix}_amount_high`,
            sourceRef: amountGateway.id,
            targetRef: directorApproval.id,
            name: 'Invoice > $25,000'
        });

        // All approvals → Duplicate Check
        const duplicateCheckId = elementMap['duplicatecheck'] || elements[5].id;
        flows.push({
            id: `Flow_${uniquePrefix}_dept_to_duplicate`,
            sourceRef: deptApproval.id,
            targetRef: duplicateCheckId
        });

        flows.push({
            id: `Flow_${uniquePrefix}_senior_to_duplicate`,
            sourceRef: seniorApproval.id,
            targetRef: duplicateCheckId
        });

        flows.push({
            id: `Flow_${uniquePrefix}_director_to_duplicate`,
            sourceRef: directorApproval.id,
            targetRef: duplicateCheckId
        });

        // Duplicate Check → Payment Processing → End
        const paymentProcessingId = elementMap['paymentprocessing'] || elements[6].id;
        flows.push({
            id: `Flow_${uniquePrefix}_duplicate_to_payment`,
            sourceRef: duplicateCheckId,
            targetRef: paymentProcessingId
        });

        flows.push({
            id: `Flow_${uniquePrefix}_payment_to_end`,
            sourceRef: paymentProcessingId,
            targetRef: elements[elements.length - 1].id // End event
        });

        return flows;
    }

    buildBPMNXML(processId, processData, elements, flows, uniquePrefix) {
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
  ${this.generateDiagram(processId, elements, flows, uniquePrefix)}
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