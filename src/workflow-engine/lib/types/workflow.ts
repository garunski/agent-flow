export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  version: string;
  tags?: string[];
  active: boolean;
  nodes: WorkflowNode[];
  connections: WorkflowConnections;
  settings?: WorkflowSettings;
  staticData?: Record<string, unknown>;
  pinData?: Record<string, unknown>;
  meta?: WorkflowMeta;
}

export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  disabled?: boolean;
  webhookId?: string;
  credentials?: Record<string, any>;
}

export interface WorkflowConnections {
  [nodeName: string]: {
    main?: Array<Array<{
      node: string;
      type: 'main' | 'success' | 'error';
      index: number;
    }>>;
    [outputType: string]: Array<Array<{
      node: string;
      type: string;
      index: number;
    }>>;
  };
}

export interface WorkflowSettings {
  executionOrder: 'v0' | 'v1';
  saveExecutionProgress: boolean;
  saveManualExecutions: boolean;
  saveDataErrorExecution: string;
  saveDataSuccessExecution: string;
  errorWorkflow?: string;
  timezone: string;
  saveDataSuccessExecution: string;
}

export interface WorkflowMeta {
  instanceId?: string;
  templateId?: string;
  templateCredsSetupCompleted?: boolean;
}

export interface WorkflowExecutionResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  executionId?: string;
  duration?: number;
}

