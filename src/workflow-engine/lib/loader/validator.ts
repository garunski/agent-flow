import { WorkflowDefinition } from '../types/workflow';

export class WorkflowValidator {
  validate(workflow: WorkflowDefinition): ValidationResult {
    const errors: string[] = [];

    // Check required fields
    if (!workflow.id) errors.push('Workflow ID is required');
    if (!workflow.name) errors.push('Workflow name is required');
    if (!workflow.nodes || workflow.nodes.length === 0) errors.push('Workflow must have at least one node');

    // Validate nodes
    this.validateNodes(workflow.nodes, errors);

    // Validate connections
    this.validateConnections(workflow.connections, workflow.nodes, errors);

    // Validate settings if present
    if (workflow.settings) {
      this.validateSettings(workflow.settings, errors);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private validateNodes(nodes: WorkflowDefinition['nodes'], errors: string[]): void {
    const nodeIds = new Set<string>();
    const nodeNames = new Set<string>();

    for (const node of nodes) {
      // Check required node fields
      if (!node.id) errors.push('Node ID is required');
      if (!node.name) errors.push('Node name is required');
      if (!node.type) errors.push('Node type is required');

      // Check for duplicates
      if (nodeIds.has(node.id)) {
        errors.push(`Duplicate node ID: ${node.id}`);
      }
      nodeIds.add(node.id);

      if (nodeNames.has(node.name)) {
        errors.push(`Duplicate node name: ${node.name}`);
      }
      nodeNames.add(node.name);

      // Validate position
      if (!Array.isArray(node.position) || node.position.length !== 2) {
        errors.push(`Invalid node position for ${node.name}: must be [x, y]`);
      }

      // Validate parameters
      if (typeof node.parameters !== 'object') {
        errors.push(`Invalid parameters for ${node.name}: must be an object`);
      }
    }
  }

  private validateConnections(
    connections: WorkflowDefinition['connections'],
    nodes: WorkflowDefinition['nodes'],
    errors: string[]
  ): void {
    const nodeNames = new Set(nodes.map(n => n.name));

    for (const [sourceName, sourceConnections] of Object.entries(connections)) {
      if (!nodeNames.has(sourceName)) {
        errors.push(`Connection source node not found: ${sourceName}`);
        continue;
      }

      // Validate main connections
      if (sourceConnections.main) {
        for (const connection of sourceConnections.main) {
          for (const target of connection) {
            if (!nodeNames.has(target.node)) {
              errors.push(`Connection target node not found: ${target.node} (from ${sourceName})`);
            }
          }
        }
      }

      // Validate other connection types
      for (const [type, typeConnections] of Object.entries(sourceConnections)) {
        if (type === 'main') continue;

        for (const connection of typeConnections) {
          for (const target of connection) {
            if (!nodeNames.has(target.node)) {
              errors.push(`Connection target node not found: ${target.node} (from ${sourceName}, type: ${type})`);
            }
          }
        }
      }
    }
  }

  private validateSettings(settings: WorkflowDefinition['settings'], errors: string[]): void {
    if (settings.executionOrder && !['v0', 'v1'].includes(settings.executionOrder)) {
      errors.push('Invalid executionOrder: must be v0 or v1');
    }

    if (settings.timezone && typeof settings.timezone !== 'string') {
      errors.push('Invalid timezone: must be a string');
    }
  }
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

