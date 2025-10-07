const { IExecuteFunctions } = require('n8n-core');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
  displayName: 'Cursor Execute',
  name: 'cursorExecute',
  icon: 'file:cursor.svg',
  group: ['transform'],
  version: 1,
  description: 'Execute Cursor CLI commands with full context',
  defaults: {
    name: 'Cursor Execute',
    color: '#1a73e8',
  },
  inputs: ['main'],
  outputs: ['main'],
  properties: [
    {
      displayName: 'Prompt',
      name: 'prompt',
      type: 'string',
      required: true,
      default: '',
      description: 'The prompt to send to Cursor CLI',
      typeOptions: {
        rows: 4,
      },
    },
    {
      displayName: 'Project Path',
      name: 'projectPath',
      type: 'string',
      required: true,
      default: '',
      description: 'Path to the project directory',
      placeholder: '/path/to/project',
    },
    {
      displayName: 'Model',
      name: 'model',
      type: 'options',
      options: [
        { name: 'Claude 4 Opus', value: 'claude-4-opus' },
        { name: 'Claude 4 Sonnet', value: 'claude-4-sonnet' },
        { name: 'Claude 4 Haiku', value: 'claude-4-haiku' },
        { name: 'GPT-4', value: 'gpt-4' },
        { name: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
      ],
      default: 'claude-4-sonnet',
      description: 'AI model to use for the request',
    },
    {
      displayName: 'Timeout (seconds)',
      name: 'timeout',
      type: 'number',
      default: 300,
      description: 'Maximum execution time in seconds',
    },
    {
      displayName: 'Working Directory',
      name: 'workingDirectory',
      type: 'string',
      default: '',
      description: 'Custom working directory (optional)',
    },
  ],

  async execute(this: IExecuteFunctions) {
    const items = this.getInputData();
    const returnData = [];

    for (let i = 0; i < items.length; i++) {
      const prompt = this.getNodeParameter('prompt', i) as string;
      const projectPath = this.getNodeParameter('projectPath', i) as string;
      const model = this.getNodeParameter('model', i) as string;
      const timeout = this.getNodeParameter('timeout', i) as number;
      const workingDirectory = this.getNodeParameter('workingDirectory', i) as string;

      // Validate project path exists
      if (!fs.existsSync(projectPath)) {
        throw new Error(`Project path does not exist: ${projectPath}`);
      }

      // Prepare command
      const command = `cd "${projectPath}" && cursor-agent chat "${prompt}" --model ${model}`;

      try {
        // Execute Cursor CLI command
        const output = execSync(command, {
          encoding: 'utf8',
          timeout: timeout * 1000,
          cwd: workingDirectory || projectPath,
          env: {
            ...process.env,
            CURSOR_MODEL: model,
            CURSOR_TIMEOUT: timeout.toString(),
          },
        });

        returnData.push({
          json: {
            success: true,
            output: output.trim(),
            prompt,
            projectPath,
            model,
            executedAt: new Date().toISOString(),
          },
        });

      } catch (error) {
        returnData.push({
          json: {
            success: false,
            error: error.message,
            stderr: error.stderr,
            prompt,
            projectPath,
            model,
            executedAt: new Date().toISOString(),
          },
        });
      }
    }

    return [returnData];
  },
};

