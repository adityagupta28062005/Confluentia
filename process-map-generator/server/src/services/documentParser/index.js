const pdfParser = require('./pdfParser');
const docxParser = require('./docxParser');
const xlsxParser = require('./xlsxParser');
const path = require('path');
const logger = require('../../utils/logger');

class DocumentParser {
  static async parseDocument(filePath, mimeType) {
    try {
      logger.info(`Parsing document: ${filePath}, type: ${mimeType}`);
      
      switch (mimeType) {
        case 'application/pdf':
          return await pdfParser.parse(filePath);
        
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
          return await docxParser.parse(filePath);
        
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        case 'application/vnd.ms-excel':
          return await xlsxParser.parse(filePath);
        
        default:
          throw new Error(`Unsupported file type: ${mimeType}`);
      }
    } catch (error) {
      logger.error('Document parsing error:', error);
      throw error;
    }
  }

  static getFileType(mimeType) {
    const typeMap = {
      'application/pdf': 'pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/vnd.ms-excel': 'xls'
    };
    
    return typeMap[mimeType] || 'unknown';
  }

  static validateFileType(mimeType) {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    return allowedTypes.includes(mimeType);
  }
}

module.exports = DocumentParser;