const { IExecuteFunctions } = require('n8n-core');

module.exports = {
  displayName: 'Cursor Parse',
  name: 'cursorParse',
  icon: 'file:text.svg',
  group: ['transform'],
  version: 1,
  description: 'Parse and structure Cursor CLI responses',
  defaults: {
    name: 'Cursor Parse',
    color: '#ff6b35',
  },
  inputs: ['main'],
  outputs: ['main'],
  properties: [
    {
      displayName: 'Output Format',
      name: 'outputFormat',
      type: 'options',
      options: [
        { name: 'JSON', value: 'json' },
        { name: 'Markdown', value: 'markdown' },
        { name: 'Text', value: 'text' },
        { name: 'Auto-detect', value: 'auto' },
      ],
      default: 'auto',
      description: 'Expected output format',
    },
    {
      displayName: 'Extract Code Blocks',
      name: 'extractCodeBlocks',
      type: 'boolean',
      default: true,
      description: 'Extract code blocks from response',
    },
    {
      displayName: 'Extract Suggestions',
      name: 'extractSuggestions',
      type: 'boolean',
      default: true,
      description: 'Extract actionable suggestions',
    },
  ],

  async execute(this: IExecuteFunctions) {
    const items = this.getInputData();
    const returnData = [];

    for (let i = 0; i < items.length; i++) {
      const rawOutput = items[i].json.output || items[i].json.rawOutput;
      const outputFormat = this.getNodeParameter('outputFormat', i) as string;
      const extractCodeBlocks = this.getNodeParameter('extractCodeBlocks', i) as boolean;
      const extractSuggestions = this.getNodeParameter('extractSuggestions', i) as boolean;

      if (!rawOutput) {
        throw new Error('No output provided for parsing');
      }

      const result = {
        originalOutput: rawOutput,
        parsedOutput: null,
        codeBlocks: [],
        suggestions: [],
        metadata: {},
      };

      // Auto-detect format or use specified format
      const format = outputFormat === 'auto' ? this.detectFormat(rawOutput) : outputFormat;

      switch (format) {
        case 'json':
          result.parsedOutput = this.parseJSON(rawOutput);
          break;
        case 'markdown':
          result.parsedOutput = this.parseMarkdown(rawOutput);
          break;
        case 'text':
        default:
          result.parsedOutput = rawOutput.trim();
          break;
      }

      // Extract code blocks if requested
      if (extractCodeBlocks) {
        result.codeBlocks = this.extractCodeBlocks(rawOutput);
      }

      // Extract suggestions if requested
      if (extractSuggestions) {
        result.suggestions = this.extractSuggestions(rawOutput);
      }

      // Add metadata
      result.metadata = {
        format,
        length: rawOutput.length,
        parsedAt: new Date().toISOString(),
      };

      returnData.push({ json: result });
    }

    return [returnData];
  },

  detectFormat(text) {
    // Simple format detection
    if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
      return 'json';
    }
    if (text.includes('#') || text.includes('**') || text.includes('```')) {
      return 'markdown';
    }
    return 'text';
  },

  parseJSON(text) {
    try {
      return JSON.parse(text);
    } catch (error) {
      return { error: 'Invalid JSON', raw: text };
    }
  },

  parseMarkdown(text) {
    return {
      title: this.extractTitle(text),
      sections: this.extractSections(text),
      codeBlocks: this.extractCodeBlocks(text),
      suggestions: this.extractSuggestions(text),
    };
  },

  extractTitle(text) {
    const titleMatch = text.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1] : null;
  },

  extractSections(text) {
    const sectionRegex = /^(#{2,3})\s+(.+)$/gm;
    const sections = [];
    let match;

    while ((match = sectionRegex.exec(text)) !== null) {
      sections.push({
        level: match[1].length,
        title: match[2],
        content: this.getSectionContent(text, match.index, sectionRegex.lastIndex),
      });
    }

    return sections;
  },

  getSectionContent(text, startIndex, endIndex) {
    const sectionText = text.substring(startIndex, endIndex);
    return sectionText.replace(/^#{2,3}\s+.+$/m, '').trim();
  },

  extractCodeBlocks(text) {
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    const blocks = [];
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        content: match[2].trim(),
        fullMatch: match[0],
      });
    }

    return blocks;
  },

  extractSuggestions(text) {
    // Extract lines that look like suggestions
    const suggestionRegex = /(?:suggest|recommend|consider|should|could|propose):\s*(.+)/gi;
    const suggestions = [];
    let match;

    while ((match = suggestionRegex.exec(text)) !== null) {
      suggestions.push(match[1].trim());
    }

    return suggestions;
  },
};
