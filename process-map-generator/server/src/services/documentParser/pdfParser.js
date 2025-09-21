const fs = require('fs');
const pdf = require('pdf-parse');
const logger = require('../../utils/logger');

class PDFParser {
    static async parse(filePath) {
        try {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);

            logger.info(`PDF parsed successfully: ${data.numpages} pages, ${data.text.length} characters`);

            return {
                text: data.text,
                metadata: {
                    pages: data.numpages,
                    info: data.info,
                    version: data.version
                },
                raw: data
            };
        } catch (error) {
            logger.error('PDF parsing error:', error);
            throw new Error(`Failed to parse PDF: ${error.message}`);
        }
    }

    static cleanText(text) {
        // Remove excessive whitespace and normalize line breaks
        return text
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n')
            .trim();
    }

    static extractSections(text) {
        // Try to identify different sections based on common patterns
        const sections = [];
        const lines = text.split('\n');

        let currentSection = null;
        let currentContent = [];

        for (const line of lines) {
            const trimmed = line.trim();

            // Check if this looks like a heading (various patterns)
            if (this.isHeading(trimmed)) {
                // Save previous section if exists
                if (currentSection) {
                    sections.push({
                        title: currentSection,
                        content: currentContent.join('\n').trim()
                    });
                }

                // Start new section
                currentSection = trimmed;
                currentContent = [];
            } else if (currentSection && trimmed) {
                currentContent.push(trimmed);
            }
        }

        // Add the last section
        if (currentSection) {
            sections.push({
                title: currentSection,
                content: currentContent.join('\n').trim()
            });
        }

        return sections;
    }

    static isHeading(text) {
        // Various patterns that might indicate a heading
        const headingPatterns = [
            /^[A-Z][A-Z\s-]+[A-Z]$/, // ALL CAPS
            /^\d+\.\s/, // Numbered sections
            /^[A-Z]{2,3}-\d+:/, // Process codes like AP-001:
            /^(PROCESS|PROCEDURE|STEP|SECTION)/i,
            /^[A-Z][a-z]+(\s[A-Z][a-z]+)*:$/ // Title Case with colon
        ];

        return headingPatterns.some(pattern => pattern.test(text));
    }
}

module.exports = PDFParser;