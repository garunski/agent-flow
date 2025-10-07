const { IExecuteFunctions } = require('n8n-core');

module.exports = {
  displayName: 'Cursor Validate',
  name: 'cursorValidate',
  icon: 'file:check.svg',
  group: ['transform'],
  version: 1,
  description: 'Validate Cursor CLI responses and extract insights',
  defaults: {
    name: 'Cursor Validate',
    color: '#00c851',
  },
  inputs: ['main'],
  outputs: ['main'],
  properties: [
    {
      displayName: 'Validation Rules',
      name: 'validationRules',
      type: 'fixedCollection',
      typeOptions: {
        multipleValues: true,
      },
      default: {},
      options: [
        {
          name: 'rules',
          displayName: 'Rule',
          values: [
            {
              displayName: 'Rule Type',
              name: 'type',
              type: 'options',
              options: [
                { name: 'Contains Text', value: 'contains' },
                { name: 'Min Length', value: 'minLength' },
                { name: 'Max Length', value: 'maxLength' },
                { name: 'Regex Match', value: 'regex' },
                { name: 'JSON Valid', value: 'jsonValid' },
                { name: 'No Errors', value: 'noErrors' },
              ],
              default: 'contains',
            },
            {
              displayName: 'Value',
              name: 'value',
              type: 'string',
              default: '',
              description: 'Value to check against',
            },
          ],
        },
      ],
    },
    {
      displayName: 'Extract Metrics',
      name: 'extractMetrics',
      type: 'boolean',
      default: true,
      description: 'Extract performance and quality metrics',
    },
  ],

  async execute(this: IExecuteFunctions) {
    const items = this.getInputData();
    const returnData = [];

    for (let i = 0; i < items.length; i++) {
      const output = items[i].json.output || items[i].json.parsedOutput;
      const validationRules = this.getNodeParameter('validationRules', i) as any;
      const extractMetrics = this.getNodeParameter('extractMetrics', i) as boolean;

      if (!output) {
        throw new Error('No output provided for validation');
      }

      const result = {
        isValid: true,
        issues: [],
        confidence: 0.8,
        metrics: {},
        validatedAt: new Date().toISOString(),
      };

      // Apply validation rules
      if (validationRules?.rules) {
        for (const rule of validationRules.rules) {
          const issue = this.validateRule(output, rule);
          if (issue) {
            result.isValid = false;
            result.issues.push(issue);
          }
        }
      }

      // Calculate confidence score
      result.confidence = this.calculateConfidence(output, result.issues);

      // Extract metrics if requested
      if (extractMetrics) {
        result.metrics = this.extractMetrics(output);
      }

      returnData.push({ json: result });
    }

    return [returnData];
  },

  validateRule(output, rule) {
    const { type, value } = rule;

    switch (type) {
      case 'contains':
        if (!output.includes(value)) {
          return `Output does not contain: ${value}`;
        }
        break;

      case 'minLength':
        if (output.length < parseInt(value)) {
          return `Output too short: ${output.length} < ${value}`;
        }
        break;

      case 'maxLength':
        if (output.length > parseInt(value)) {
          return `Output too long: ${output.length} > ${value}`;
        }
        break;

      case 'regex':
        if (!new RegExp(value).test(output)) {
          return `Output does not match regex: ${value}`;
        }
        break;

      case 'jsonValid':
        try {
          JSON.parse(output);
        } catch (error) {
          return `Output is not valid JSON: ${error.message}`;
        }
        break;

      case 'noErrors':
        if (output.includes('error') || output.includes('Error') || output.includes('ERROR')) {
          return 'Output contains error indicators';
        }
        break;
    }

    return null;
  },

  calculateConfidence(output, issues) {
    let confidence = 1.0;

    // Reduce confidence for issues
    confidence -= issues.length * 0.2;

    // Reduce confidence for very short outputs
    if (output.length < 100) {
      confidence -= 0.1;
    }

    // Boost confidence for structured outputs
    if (output.includes('{') && output.includes('}')) {
      confidence += 0.1;
    }

    return Math.max(0, Math.min(1, confidence));
  },

  extractMetrics(output) {
    return {
      wordCount: output.split(/\s+/).length,
      characterCount: output.length,
      lineCount: output.split('\n').length,
      codeBlockCount: (output.match(/```/g) || []).length / 2,
      suggestionCount: (output.match(/(?:suggest|recommend|consider)/gi) || []).length,
    };
  },
};
