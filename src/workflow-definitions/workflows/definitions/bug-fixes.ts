import { WorkflowDefinition } from '../../workflow-engine/types/workflow';

export const bugFixesWorkflow: WorkflowDefinition = {
  id: 'bug-fixes-workflow',
  name: 'AI Bug Detection & Fixes',
  description: 'Automated bug detection and fixing using Cursor CLI',
  version: '1.0.0',
  tags: ['ai', 'debugging', 'development', 'bug-fixes'],
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
        path: 'bug-fixes',
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
            throw new Error('Bug fix prompt is required');
          }

          return [{
            json: {
              prompt: inputData[0].json.prompt,
              projectPath: inputData[0].json.projectPath || process.cwd(),
              model: inputData[0].json.model || 'claude-4-sonnet',
              bugType: inputData[0].json.bugType || 'general',
              severity: inputData[0].json.severity || 'medium',
              files: inputData[0].json.files || [],
              includeErrorLogs: inputData[0].json.includeErrorLogs || false,
              includeStackTraces: inputData[0].json.includeStackTraces || false,
              testAfterFix: inputData[0].json.testAfterFix !== false,
            }
          }];
        `,
      },
    },
    {
      id: 'cursor-execute',
      name: 'Cursor Execute - Bug Fixes',
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
      name: 'Cursor Parse - Bug Fixes',
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
      name: 'Cursor Validate - Bug Fixes',
      type: 'cursor-validate',
      typeVersion: 1,
      position: [1120, 300],
      parameters: {
        validationRules: {
          contains: ['fix', 'bug', 'error', 'solution', 'corrected'],
          minLength: 150,
          noErrors: true,
          jsonValid: true,
        },
        extractMetrics: true,
        confidenceThreshold: 0.8,
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
          message: 'Bug fix completed successfully',
          bugType: '={{ $json.bugType }}',
          severity: '={{ $json.severity }}',
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
          message: 'Bug fix failed',
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
