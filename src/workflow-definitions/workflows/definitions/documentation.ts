import { WorkflowDefinition } from '../../workflow-engine/types/workflow';

export const documentationWorkflow: WorkflowDefinition = {
  id: 'documentation-workflow',
  name: 'AI Documentation Generation',
  description: 'Automated documentation generation using Cursor CLI',
  version: '1.0.0',
  tags: ['ai', 'documentation', 'development', 'automation'],
  active: true,

  nodes: [
    {
      id: 'webhook-trigger',
      name: 'Webhook Trigger',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [240, 300],
      parameters: {
        httpMethod: 'POST',
        path: 'documentation',
        responseMode: 'responseNode',
        options: {
          responseContentType: 'json',
        },
      },
    },
    {
      id: 'extract-input',
      name: 'Extract Input Data',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [460, 300],
      parameters: {
        mode: 'runOnceForAllItems',
        jsCode: `
          // Extract and validate input data
          const inputData = $input.all();

          if (!inputData[0]?.json?.prompt) {
            throw new Error('Documentation prompt is required');
          }

          return [{
            json: {
              prompt: inputData[0].json.prompt,
              projectPath: inputData[0].json.projectPath || process.cwd(),
              model: inputData[0].json.model || 'claude-4-sonnet',
              docType: inputData[0].json.docType || 'api',
              format: inputData[0].json.format || 'markdown',
              files: inputData[0].json.files || [],
              includeExamples: inputData[0].json.includeExamples !== false,
              includeCodeSnippets: inputData[0].json.includeCodeSnippets !== false,
              updateExisting: inputData[0].json.updateExisting || false,
            }
          }];
        `,
      },
    },
    {
      id: 'cursor-execute',
      name: 'Cursor Execute - Documentation',
      type: 'cursor-execute',
      typeVersion: 1,
      position: [680, 300],
      parameters: {
        prompt: '={{ $json.prompt }}',
        projectPath: '={{ $json.projectPath }}',
        model: '={{ $json.model }}',
        timeout: 300,
        workingDirectory: '={{ $json.projectPath }}',
      },
    },
    {
      id: 'cursor-parse',
      name: 'Cursor Parse - Documentation',
      type: 'cursor-parse',
      typeVersion: 1,
      position: [900, 300],
      parameters: {
        inputFormat: 'auto',
        extractCodeBlocks: true,
        extractSuggestions: true,
        extractSections: true,
        preserveFormatting: true,
      },
    },
    {
      id: 'cursor-validate',
      name: 'Cursor Validate - Documentation',
      type: 'cursor-validate',
      typeVersion: 1,
      position: [1120, 300],
      parameters: {
        validationRules: {
          contains: ['#', '##', '```', 'function', 'class', 'interface'],
          minLength: 300,
          noErrors: true,
          jsonValid: true,
        },
        extractMetrics: true,
        confidenceThreshold: 0.75,
      },
    },
    {
      id: 'create-github-comment',
      name: 'Create GitHub Comment',
      type: 'n8n-nodes-base.github',
      typeVersion: 1,
      position: [1340, 200],
      parameters: {
        operation: 'createComment',
        repository: '={{ $json.repository }}',
        owner: '={{ $json.owner }}',
        issueNumber: '={{ $json.issueNumber }}',
        body: '={{ $json.parsedOutput }}',
      },
    },
    {
      id: 'success-response',
      name: 'Success Response',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1,
      position: [1560, 200],
      parameters: {
        respondWith: 'json',
        responseBody: {
          success: true,
          message: 'Documentation generation completed successfully',
          docType: '={{ $json.docType }}',
          format: '={{ $json.format }}',
          metrics: '={{ $json.metrics }}',
          confidence: '={{ $json.confidence }}',
          executionTime: '={{ $json.executionTime }}',
        },
      },
    },
    {
      id: 'error-response',
      name: 'Error Response',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1,
      position: [1560, 400],
      parameters: {
        respondWith: 'json',
        responseBody: {
          success: false,
          error: '={{ $json.error }}',
          message: 'Documentation generation failed',
        },
      },
    },
  ],

  connections: {
    'webhook-trigger': {
      main: [
        [
          {
            node: 'extract-input',
            type: 'main',
            index: 0,
          },
        ],
      ],
    },
    'extract-input': {
      main: [
        [
          {
            node: 'cursor-execute',
            type: 'main',
            index: 0,
          },
        ],
      ],
    },
    'cursor-execute': {
      main: [
        [
          {
            node: 'cursor-parse',
            type: 'main',
            index: 0,
          },
        ],
      ],
    },
    'cursor-parse': {
      main: [
        [
          {
            node: 'cursor-validate',
            type: 'main',
            index: 0,
          },
        ],
      ],
    },
    'cursor-validate': {
      main: [
        [
          {
            node: 'create-github-comment',
            type: 'main',
            index: 0,
          },
        ],
      ],
    },
    'create-github-comment': {
      main: [
        [
          {
            node: 'success-response',
            type: 'main',
            index: 0,
          },
        ],
      ],
    },
  },

  settings: {
    executionOrder: 'v1',
    timezone: 'UTC',
  },
};
