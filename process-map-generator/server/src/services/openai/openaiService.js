const openai = require('../../config/openai');
const prompts = require('./prompts');
const responseParser = require('./responseParser');
const logger = require('../../utils/logger');

class OpenAIService {
  constructor() {
    this.model = 'gpt-4';
    this.maxTokens = 4000;
    this.temperature = 0.3;
  }

  async extractProcessInfo(documentText) {
    try {
      logger.info('Starting process extraction with OpenAI');
      
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: prompts.systemPrompt },
          { role: 'user', content: prompts.processExtractionPrompt(documentText) }
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens
      });

      const content = response.choices[0].message.content;
      logger.info('OpenAI process extraction completed');
      
      return responseParser.parseProcessResponse(content);
    } catch (error) {
      logger.error('OpenAI process extraction error:', error);
      throw new Error(`AI process extraction failed: ${error.message}`);
    }
  }

  async identifyRisksAndControls(processText, steps) {
    try {
      logger.info('Starting risk and control identification');
      
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: prompts.riskControlSystemPrompt },
          { role: 'user', content: prompts.riskControlPrompt(processText, steps) }
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens
      });

      const content = response.choices[0].message.content;
      logger.info('Risk and control identification completed');
      
      return responseParser.parseRiskControlResponse(content);
    } catch (error) {
      logger.error('OpenAI risk/control identification error:', error);
      throw new Error(`AI risk/control identification failed: ${error.message}`);
    }
  }

  async enhanceProcessSteps(steps) {
    try {
      logger.info('Enhancing process steps with AI');
      
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: prompts.stepEnhancementSystemPrompt },
          { role: 'user', content: prompts.stepEnhancementPrompt(steps) }
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens
      });

      const content = response.choices[0].message.content;
      logger.info('Process step enhancement completed');
      
      return responseParser.parseStepEnhancementResponse(content);
    } catch (error) {
      logger.error('OpenAI step enhancement error:', error);
      throw new Error(`AI step enhancement failed: ${error.message}`);
    }
  }

  async generateProcessSummary(processData) {
    try {
      logger.info('Generating process summary');
      
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: prompts.summarySystemPrompt },
          { role: 'user', content: prompts.summaryPrompt(processData) }
        ],
        temperature: this.temperature,
        max_tokens: 1000
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      logger.error('OpenAI summary generation error:', error);
      throw new Error(`AI summary generation failed: ${error.message}`);
    }
  }

  async validateProcessStructure(processData) {
    try {
      logger.info('Validating process structure');
      
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: prompts.validationSystemPrompt },
          { role: 'user', content: prompts.validationPrompt(processData) }
        ],
        temperature: 0.1,
        max_tokens: 1000
      });

      return responseParser.parseValidationResponse(response.choices[0].message.content);
    } catch (error) {
      logger.error('OpenAI validation error:', error);
      throw new Error(`AI validation failed: ${error.message}`);
    }
  }
}

module.exports = new OpenAIService();