class PromptTemplates {
    static get systemPrompt() {
        return `You are an expert business process analyst with deep expertise in:
- Business Process Model and Notation (BPMN) 2.0
- Risk management and control frameworks
- Standard Operating Procedures (SOPs)
- Financial services processes

Your task is to analyze business documents and extract structured process information with high accuracy.

Key Guidelines:
1. Focus on identifying distinct business processes within documents
2. Extract sequential steps that form coherent workflows
3. Identify decision points (gateways) where processes branch
4. Recognize risks as potential negative events or vulnerabilities
5. Identify controls as measures designed to mitigate risks
6. Always return valid JSON format as specified
7. Be thorough but concise in descriptions`;
    }

    static processExtractionPrompt(documentText) {
        return `Analyze the following business document and extract all business processes.

DOCUMENT TEXT:
${documentText}

Extract the following information and return as a single, valid JSON object:

{
  "processes": [
    {
      "name": "Process Name (e.g., AP-001: Invoice Processing)",
      "description": "High-level summary of what this process accomplishes",
      "steps": [
        {
          "id": "step_1",
          "name": "Step Name",
          "description": "Detailed description of what happens in this step",
          "type": "task",
          "actor": "Who performs this step",
          "inputs": ["Input documents/data"],
          "outputs": ["Output documents/data"],
          "duration": "Estimated time if mentioned"
        }
      ],
      "gateways": [
        {
          "id": "gateway_1",
          "name": "Decision Point Name",
          "type": "exclusive",
          "condition": "What condition is being evaluated",
          "outcomes": ["Possible outcomes"]
        }
      ],
      "start_events": [
        {
          "id": "start_1",
          "name": "Process Trigger",
          "description": "What initiates this process"
        }
      ],
      "end_events": [
        {
          "id": "end_1",
          "name": "Process Completion",
          "description": "How the process concludes"
        }
      ]
    }
  ]
}

IMPORTANT:
- Extract ALL distinct processes found in the document
- Each step should be atomic and actionable
- Identify clear decision points as gateways
- Use sequential step IDs (step_1, step_2, etc.)
- Return only valid JSON, no additional text`;
    }

    static get riskControlSystemPrompt() {
        return `You are a risk management expert specializing in business process risk assessment and control design.

Your expertise includes:
- Operational risk identification
- Financial risk assessment
- Compliance and regulatory risks
- Control design and effectiveness
- Risk categorization frameworks

Focus on identifying genuine business risks and their corresponding controls within process workflows.`;
    }

    static riskControlPrompt(processText, steps) {
        return `Analyze the following business process and identify associated risks and controls.

PROCESS CONTEXT:
${processText}

PROCESS STEPS:
${JSON.stringify(steps, null, 2)}

Extract risks and controls and return as valid JSON:

{
  "risks": [
    {
      "name": "Risk Name",
      "category": "Risk Category (e.g., Operational Risk, Financial Risk, Compliance Risk)",
      "description": "Detailed description of the risk and its potential impact",
      "likelihood": "High/Medium/Low",
      "impact": "High/Medium/Low",
      "related_steps": ["step_ids where this risk occurs"]
    }
  ],
  "controls": [
    {
      "name": "Control Name",
      "type": "Control Type (e.g., Preventive, Detective, Corrective)",
      "description": "Detailed description of how the control works",
      "effectiveness": "High/Medium/Low",
      "frequency": "How often the control is performed",
      "related_risks": ["Risk names this control addresses"],
      "related_steps": ["step_ids where this control is applied"]
    }
  ]
}

RISK CATEGORIES:
- Operational Risk: Process failures, human error, system failures
- Financial Risk: Fraud, unauthorized transactions, calculation errors
- Compliance Risk: Regulatory violations, policy breaches
- Reputational Risk: Brand damage, customer dissatisfaction
- Strategic Risk: Business model threats, competitive disadvantage

CONTROL TYPES:
- Preventive: Prevent risks from occurring
- Detective: Identify when risks have occurred
- Corrective: Respond to and correct risk events

Return only valid JSON, no additional text.`;
    }

    static get stepEnhancementSystemPrompt() {
        return `You are a business process optimization expert. Your role is to enhance and refine process steps to ensure they are:
- Clear and actionable
- Properly sequenced
- Complete with all necessary details
- Optimized for BPMN modeling`;
    }

    static stepEnhancementPrompt(steps) {
        return `Enhance and refine the following process steps for optimal BPMN modeling:

CURRENT STEPS:
${JSON.stringify(steps, null, 2)}

Return enhanced steps as valid JSON:

{
  "enhanced_steps": [
    {
      "id": "step_id",
      "name": "Clear, action-oriented step name",
      "description": "Detailed description with clear inputs, actions, and outputs",
      "type": "task|userTask|serviceTask|manualTask",
      "actor": "Specific role or system responsible",
      "inputs": ["Specific input requirements"],
      "outputs": ["Specific output deliverables"],
      "prerequisites": ["What must be completed before this step"],
      "validation_criteria": ["How to verify step completion"],
      "estimated_duration": "Time estimate",
      "complexity": "Low/Medium/High",
      "automation_potential": "Manual/Semi-automated/Automated"
    }
  ],
  "sequence_flows": [
    {
      "from": "step_id",
      "to": "step_id",
      "condition": "Condition if applicable"
    }
  ]
}

Focus on:
1. Making each step atomic and measurable
2. Clarifying handoffs between actors
3. Identifying automation opportunities
4. Ensuring logical flow sequence

Return only valid JSON.`;
    }

    static get summarySystemPrompt() {
        return `You are a business analyst expert at creating clear, concise process summaries for executive audiences.`;
    }

    static summaryPrompt(processData) {
        return `Create a high-level executive summary for this business process:

PROCESS DATA:
${JSON.stringify(processData, null, 2)}

Write a 2-3 sentence summary that covers:
1. The main purpose of the process
2. Key stakeholders involved
3. Primary business value delivered

Keep it professional and executive-friendly.`;
    }

    static get validationSystemPrompt() {
        return `You are a process validation expert. Your role is to identify gaps, inconsistencies, and areas for improvement in business process definitions.`;
    }

    static validationPrompt(processData) {
        return `Validate the following process definition and identify any issues:

PROCESS DATA:
${JSON.stringify(processData, null, 2)}

Return validation results as JSON:

{
  "is_valid": true/false,
  "completeness_score": 0-100,
  "issues": [
    {
      "type": "error|warning|suggestion",
      "category": "structure|logic|completeness|clarity",
      "description": "Issue description",
      "location": "Where the issue occurs",
      "recommendation": "How to fix it"
    }
  ],
  "strengths": ["What works well in this process"],
  "overall_assessment": "Summary of process quality"
}

Check for:
- Missing start/end events
- Unclear step sequences
- Incomplete step descriptions
- Missing actor assignments
- Logical inconsistencies
- BPMN modeling concerns

Return only valid JSON.`;
    }
}

module.exports = PromptTemplates;