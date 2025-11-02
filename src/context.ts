import { AsyncLocalStorage } from 'node:async_hooks'

import { EventLog } from './log'


export interface WorkflowContext {
  events: EventLog
}

export interface RunContext {
  run: string
  workflow: string
  step: number
  hook: number
}

export interface StepContext {
  step: number
  attempt: number
}

export const workflowCtx = new AsyncLocalStorage<WorkflowContext>()
const runCtx = new AsyncLocalStorage<RunContext>()
const stepCtx = new AsyncLocalStorage<StepContext>()

export const execInWorkflowContext = (events: EventLog, fn: () => void) =>
  workflowCtx.run({ events }, fn)

export const execInRunContext = (run: string, workflow: string, fn: () => void) =>
  runCtx.run({ run, workflow, step: 0, hook: 0 }, fn)

export const execInStepContext = (step: number, attempt: number, fn: () => void) =>
  stepCtx.run({ step, attempt }, fn)


export class OutOfContextExecution extends Error {
  constructor(message: string) {
    super(`Out of context execution: ${message}`)
    this.name = 'OutOfContextExecution'
  }
}

const getContextSafe = <T>(ctx: AsyncLocalStorage<T>, message: string) => {
  const store = ctx.getStore()
  if (!store) {
    throw new OutOfContextExecution(message)
  }

  return store
}

export const getWorkflowContext = () => getContextSafe(workflowCtx, 'must start workflows in a workflow context.')
export const getRunContext = () => getContextSafe(runCtx, 'run context not found.')
export const getStepContext = () => getContextSafe(stepCtx, 'must run step functions in a workflow function, that is also execution in a workflow context.')
