export type WorkflowFn = (...args: unknown[]) => unknown

const _registry = new Map<string, WorkflowFn>()

export const registerWorkflow = (name: string, fn: WorkflowFn) => _registry.set(name, fn)
export const getWorkflow = (name: string) => _registry.get(name)
