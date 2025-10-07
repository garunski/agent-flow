import { WorkflowDefinition } from '../types/workflow';

export class WorkflowRegistry {
  private workflows = new Map<string, WorkflowDefinition>();
  private listeners = new Set<(workflow: WorkflowDefinition) => void>();

  register(workflow: WorkflowDefinition): void {
    this.workflows.set(workflow.id, workflow);
    this.notifyListeners(workflow);
  }

  unregister(workflowId: string): boolean {
    return this.workflows.delete(workflowId);
  }

  update(workflow: WorkflowDefinition): void {
    if (this.workflows.has(workflow.id)) {
      this.workflows.set(workflow.id, workflow);
      this.notifyListeners(workflow);
    } else {
      this.register(workflow);
    }
  }

  get(workflowId: string): WorkflowDefinition | undefined {
    return this.workflows.get(workflowId);
  }

  getAll(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  has(workflowId: string): boolean {
    return this.workflows.has(workflowId);
  }

  clear(): void {
    this.workflows.clear();
  }

  size(): number {
    return this.workflows.size;
  }

  // Event system for workflow changes
  addListener(listener: (workflow: WorkflowDefinition) => void): void {
    this.listeners.add(listener);
  }

  removeListener(listener: (workflow: WorkflowDefinition) => void): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(workflow: WorkflowDefinition): void {
    this.listeners.forEach(listener => {
      try {
        listener(workflow);
      } catch (error) {
        console.error('Error in workflow listener:', error);
      }
    });
  }

  // Utility methods
  findByTag(tag: string): WorkflowDefinition[] {
    return this.getAll().filter(workflow =>
      workflow.tags && workflow.tags.includes(tag)
    );
  }

  findByName(name: string): WorkflowDefinition | undefined {
    return this.getAll().find(workflow =>
      workflow.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  getActiveWorkflows(): WorkflowDefinition[] {
    return this.getAll().filter(workflow => workflow.active);
  }
}

