const fs = require('fs');
const XLSX = require('xlsx');
const logger = require('../../utils/logger');

class XLSXParser {
  static async parse(filePath) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetNames = workbook.SheetNames;
      
      logger.info(`XLSX parsed successfully: ${sheetNames.length} sheets`);
      
      const sheets = {};
      let allText = '';
      
      for (const sheetName of sheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Convert to text
        const sheetText = this.convertSheetToText(sheetData);
        sheets[sheetName] = {
          data: sheetData,
          text: sheetText
        };
        
        allText += `\n\n=== ${sheetName} ===\n${sheetText}`;
      }
      
      return {
        text: allText.trim(),
        metadata: {
          sheetNames,
          totalSheets: sheetNames.length
        },
        sheets,
        raw: workbook
      };
    } catch (error) {
      logger.error('XLSX parsing error:', error);
      throw new Error(`Failed to parse XLSX: ${error.message}`);
    }
  }

  static convertSheetToText(sheetData) {
    if (!sheetData || sheetData.length === 0) {
      return '';
    }
    
    const textRows = [];
    
    for (const row of sheetData) {
      if (row && row.length > 0) {
        // Filter out empty cells and convert to string
        const nonEmptyCells = row
          .filter(cell => cell !== null && cell !== undefined && cell !== '')
          .map(cell => String(cell).trim());
        
        if (nonEmptyCells.length > 0) {
          textRows.push(nonEmptyCells.join(' | '));
        }
      }
    }
    
    return textRows.join('\n');
  }

  static extractProcessFlows(sheets) {
    // Look for process flows in spreadsheet format
    const processes = [];
    
    for (const [sheetName, sheetInfo] of Object.entries(sheets)) {
      const potentialProcess = this.analyzeSheetForProcess(sheetName, sheetInfo.data);
      if (potentialProcess) {
        processes.push(potentialProcess);
      }
    }
    
    return processes;
  }

  static analyzeSheetForProcess(sheetName, data) {
    if (!data || data.length < 2) return null;
    
    // Look for common process flow patterns
    const headers = data[0] || [];
    const hasProcessColumns = headers.some(header => 
      typeof header === 'string' && 
      /step|task|activity|process|action/i.test(header)
    );
    
    if (!hasProcessColumns) return null;
    
    const steps = [];
    
    // Extract rows that look like process steps
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row && row.length > 0) {
        const step = this.extractStepFromRow(headers, row);
        if (step) {
          steps.push(step);
        }
      }
    }
    
    if (steps.length === 0) return null;
    
    return {
      name: sheetName,
      steps,
      source: 'spreadsheet'
    };
  }

  static extractStepFromRow(headers, row) {
    const step = {};
    
    for (let i = 0; i < Math.min(headers.length, row.length); i++) {
      const header = String(headers[i] || '').toLowerCase();
      const value = row[i];
      
      if (value !== null && value !== undefined && value !== '') {
        if (header.includes('step') || header.includes('task') || header.includes('activity')) {
          step.description = String(value);
        } else if (header.includes('owner') || header.includes('responsible')) {
          step.owner = String(value);
        } else if (header.includes('risk')) {
          step.risks = String(value);
        } else if (header.includes('control')) {
          step.controls = String(value);
        } else if (header.includes('input')) {
          step.inputs = String(value);
        } else if (header.includes('output')) {
          step.outputs = String(value);
        }
      }
    }
    
    return step.description ? step : null;
  }

  static findRiskControlTables(sheets) {
    const riskControls = [];
    
    for (const [sheetName, sheetInfo] of Object.entries(sheets)) {
      const risks = this.extractRisksFromSheet(sheetInfo.data);
      const controls = this.extractControlsFromSheet(sheetInfo.data);
      
      if (risks.length > 0 || controls.length > 0) {
        riskControls.push({
          sheet: sheetName,
          risks,
          controls
        });
      }
    }
    
    return riskControls;
  }

  static extractRisksFromSheet(data) {
    // Implementation for extracting risks from tabular data
    return this.extractItemsByPattern(data, /risk/i);
  }

  static extractControlsFromSheet(data) {
    // Implementation for extracting controls from tabular data
    return this.extractItemsByPattern(data, /control|mitigat/i);
  }

  static extractItemsByPattern(data, pattern) {
    if (!data || data.length < 2) return [];
    
    const headers = data[0] || [];
    const patternColumns = headers
      .map((header, index) => ({ header, index }))
      .filter(({ header }) => typeof header === 'string' && pattern.test(header));
    
    if (patternColumns.length === 0) return [];
    
    const items = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row) {
        for (const { index } of patternColumns) {
          const value = row[index];
          if (value && String(value).trim()) {
            items.push({
              value: String(value).trim(),
              row: i,
              column: index
            });
          }
        }
      }
    }
    
    return items;
  }
}

module.exports = XLSXParser;