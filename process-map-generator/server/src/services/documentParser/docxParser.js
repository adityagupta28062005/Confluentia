const fs = require('fs');
const mammoth = require('mammoth');
const logger = require('../../utils/logger');

class DOCXParser {
  static async parse(filePath) {
    try {
      const buffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer });
      
      logger.info(`DOCX parsed successfully: ${result.value.length} characters`);
      
      if (result.messages.length > 0) {
        logger.warn('DOCX parsing warnings:', result.messages);
      }
      
      return {
        text: result.value,
        metadata: {
          messages: result.messages,
          hasImages: result.messages.some(msg => msg.type === 'image')
        },
        raw: result
      };
    } catch (error) {
      logger.error('DOCX parsing error:', error);
      throw new Error(`Failed to parse DOCX: ${error.message}`);
    }
  }

  static async parseWithFormatting(filePath) {
    try {
      const buffer = fs.readFileSync(filePath);
      
      // Extract with basic HTML formatting
      const htmlResult = await mammoth.convertToHtml({ buffer });
      
      // Also extract plain text
      const textResult = await mammoth.extractRawText({ buffer });
      
      return {
        text: textResult.value,
        html: htmlResult.value,
        metadata: {
          textMessages: textResult.messages,
          htmlMessages: htmlResult.messages
        }
      };
    } catch (error) {
      logger.error('DOCX formatting parsing error:', error);
      throw new Error(`Failed to parse DOCX with formatting: ${error.message}`);
    }
  }

  static extractStructure(html) {
    // Extract headings and structure from HTML
    const headings = [];
    const headingRegex = /<h(\d)>(.*?)<\/h\d>/gi;
    let match;
    
    while ((match = headingRegex.exec(html)) !== null) {
      headings.push({
        level: parseInt(match[1]),
        text: match[2].replace(/<[^>]*>/g, '').trim()
      });
    }
    
    return headings;
  }

  static extractParagraphs(text) {
    // Split into paragraphs and clean
    return text
      .split('\n\n')
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(p => p.replace(/\s+/g, ' '));
  }

  static findProcessSections(text) {
    // Look for process-related sections
    const lines = text.split('\n');
    const processSections = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (this.isProcessHeading(line)) {
        // Find the content until the next heading
        const content = [];
        let j = i + 1;
        
        while (j < lines.length && !this.isProcessHeading(lines[j].trim())) {
          if (lines[j].trim()) {
            content.push(lines[j].trim());
          }
          j++;
        }
        
        processSections.push({
          title: line,
          content: content.join(' '),
          startLine: i,
          endLine: j - 1
        });
      }
    }
    
    return processSections;
  }

  static isProcessHeading(text) {
    const processPatterns = [
      /^[A-Z]{2,3}-\d+:/,  // AP-001:, CO-001:
      /^(Process|Procedure|Step)\s+\d+/i,
      /^[A-Z][a-z]+\s+(Process|Procedure|Workflow)/i,
      /^\d+\.\s+[A-Z]/
    ];
    
    return processPatterns.some(pattern => pattern.test(text));
  }
}

module.exports = DOCXParser;