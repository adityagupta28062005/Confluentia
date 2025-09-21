const { GoogleGenerativeAI } = require('@google/generative-ai');
const prompts = require('../openai/prompts');
const responseParser = require('../openai/responseParser');
const logger = require('../../utils/logger');

class GeminiService {
    constructor() {
        logger.info('Initializing GeminiService...');
        this.apiKey = process.env.GEMINI_API_KEY;
        logger.info(`API Key found: ${this.apiKey ? 'Yes' : 'No'}`);
        if (this.apiKey) {
            logger.info(`API Key format: ${this.apiKey.substring(0, 10)}...`);
        }

        if (!this.apiKey) {
            logger.error('GEMINI_API_KEY is required');
            throw new Error('GEMINI_API_KEY is required');
        }

        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        this.temperature = 0.3;
        logger.info('GeminiService initialized successfully');
    }

    async extractProcessInfo(documentText) {
        try {
            logger.info('Starting process extraction with Gemini');

            const prompt = `${prompts.systemPrompt}\n\n${prompts.processExtractionPrompt(documentText)}`;

            const result = await this.callGeminiWithRetry(async () => {
                return await this.model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: this.temperature,
                        maxOutputTokens: 4000,
                    },
                });
            });

            const content = result.response.text();
            logger.info('Gemini process extraction completed');

            return responseParser.parseProcessResponse(content);
        } catch (error) {
            logger.error('Gemini process extraction error:', error);

            // If quota exceeded, return a minimal fallback response
            if (error.message.includes('quota') || error.message.includes('429')) {
                logger.warn('Quota exceeded, returning fallback process data');
                return this.getFallbackProcessData();
            }

            throw new Error(`AI process extraction failed: ${error.message}`);
        }
    }

    async identifyRisksAndControls(processText, steps) {
        try {
            logger.info('Starting risk and control identification with Gemini');

            const prompt = `${prompts.riskControlSystemPrompt}\n\n${prompts.riskControlPrompt(processText, steps)}`;

            const result = await this.callGeminiWithRetry(async () => {
                return await this.model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: this.temperature,
                        maxOutputTokens: 4000,
                    },
                });
            });

            const content = result.response.text();
            logger.info('Risk and control identification completed');

            return responseParser.parseRiskControlResponse(content);
        } catch (error) {
            logger.error('Gemini risk/control identification error:', error);

            // If quota exceeded, return a fallback response
            if (error.message.includes('quota') || error.message.includes('429')) {
                logger.warn('Quota exceeded, returning fallback risk/control data');
                return this.getFallbackRiskControlData();
            }

            throw new Error(`AI risk/control identification failed: ${error.message}`);
        }
    }

    async callGeminiWithRetry(apiCall, maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await apiCall();
            } catch (error) {
                const isQuotaError = error.message.includes('quota') || error.message.includes('429');
                const isLastAttempt = attempt === maxRetries;

                if (isQuotaError || isLastAttempt) {
                    throw error;
                }

                // Wait before retry (exponential backoff)
                const delay = Math.pow(2, attempt) * 1000;
                logger.warn(`API call failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    getFallbackRiskControlData() {
        return {
            risks: [
                {
                    id: 'RISK_001',
                    description: 'Data processing errors due to manual intervention',
                    category: 'Operational',
                    likelihood: 'Medium',
                    impact: 'Medium',
                    riskLevel: 'Medium'
                },
                {
                    id: 'RISK_002',
                    description: 'Compliance violations due to inadequate documentation',
                    category: 'Compliance',
                    likelihood: 'Low',
                    impact: 'High',
                    riskLevel: 'Medium'
                }
            ],
            controls: [
                {
                    id: 'CTRL_001',
                    description: 'Automated validation checks for data integrity',
                    type: 'Preventive',
                    frequency: 'Continuous',
                    owner: 'System Administrator',
                    effectiveness: 'High'
                },
                {
                    id: 'CTRL_002',
                    description: 'Regular audit trails and documentation reviews',
                    type: 'Detective',
                    frequency: 'Monthly',
                    owner: 'Compliance Officer',
                    effectiveness: 'Medium'
                }
            ]
        };
    }

    getFallbackProcessData() {
        return {
            found_processes: true,
            process_count: 1,
            processes: [
                {
                    process_id: "FALLBACK_001",
                    process_name: "Document Processing Workflow",
                    process_description: "Standard document processing workflow with approval steps",
                    process_type: "Operational",
                    stakeholders: ["Document Owner", "Approver", "Administrator"],
                    process_steps: [
                        {
                            step_number: 1,
                            step_name: "Document Submission",
                            step_description: "Submit document for processing",
                            responsible_party: "Document Owner",
                            inputs: ["Document"],
                            outputs: ["Submitted Document"],
                            controls: ["Document validation check"]
                        },
                        {
                            step_number: 2,
                            step_name: "Review and Approval",
                            step_description: "Review document and provide approval",
                            responsible_party: "Approver",
                            inputs: ["Submitted Document"],
                            outputs: ["Approved Document"],
                            controls: ["Authorization verification"]
                        },
                        {
                            step_number: 3,
                            step_name: "Final Processing",
                            step_description: "Complete document processing",
                            responsible_party: "Administrator",
                            inputs: ["Approved Document"],
                            outputs: ["Processed Document"],
                            controls: ["Completion verification"]
                        }
                    ]
                }
            ]
        };
    }

    async enhanceProcessSteps(steps) {
        try {
            logger.info('Enhancing process steps with Gemini');

            const prompt = `${prompts.stepEnhancementSystemPrompt}\n\n${prompts.stepEnhancementPrompt(steps)}`;

            const result = await this.callGeminiWithRetry(async () => {
                return await this.model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: this.temperature,
                        maxOutputTokens: 4000,
                    },
                });
            });

            const content = result.response.text();
            logger.info('Process step enhancement completed');

            return responseParser.parseStepEnhancementResponse(content);
        } catch (error) {
            logger.error('Gemini step enhancement error:', error);

            // If quota exceeded, return original steps
            if (error.message.includes('quota') || error.message.includes('429')) {
                logger.warn('Quota exceeded, returning original steps without enhancement');
                return { enhanced_steps: steps };
            }

            throw new Error(`AI step enhancement failed: ${error.message}`);
        }
    }

    async generateProcessSummary(processData) {
        try {
            logger.info('Generating process summary with Gemini');

            const prompt = `${prompts.summarySystemPrompt}\n\n${prompts.summaryPrompt(processData)}`;

            const result = await this.callGeminiWithRetry(async () => {
                return await this.model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: this.temperature,
                        maxOutputTokens: 1000,
                    },
                });
            });

            return result.response.text().trim();
        } catch (error) {
            logger.error('Gemini summary generation error:', error);

            // If quota exceeded, return a basic summary
            if (error.message.includes('quota') || error.message.includes('429')) {
                logger.warn('Quota exceeded, returning basic process summary');
                return `Process Summary: ${processData.process_name || 'Business Process'} - A ${processData.process_type || 'standard'} business process with ${processData.process_steps?.length || 0} steps.`;
            }

            throw new Error(`AI summary generation failed: ${error.message}`);
        }
    }

    async validateProcessStructure(processData) {
        try {
            logger.info('Validating process structure with Gemini');

            const prompt = `${prompts.validationSystemPrompt}\n\n${prompts.validationPrompt(processData)}`;

            const result = await this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 1000,
                },
            });

            return responseParser.parseValidationResponse(result.response.text());
        } catch (error) {
            logger.error('Gemini validation error:', error);
            throw new Error(`AI validation failed: ${error.message}`);
        }
    }
}

module.exports = new GeminiService();