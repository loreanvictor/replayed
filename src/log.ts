export type StepEventType =
  | 'step:started'
  | 'step:completed'
  | 'step:error'
  | 'step:retried'
  | 'step:failed'

export type HookEventType =
  | 'hook:bound'
  | 'hook:invoke'

export type RunEventType =
  | 'run:started'
  | 'run:paused'
  | 'run:resumed'
  | 'run:completed'
  | 'run:failed'

export type EventType = StepEventType | HookEventType | RunEventType

export type RunStatus = 'started' | 'paused' | 'resumed' | 'completed' | 'failed'

export interface RunState {
  started: Date
  completed?: Date
  step: number
  workflow: string
  result?: any
  error?: any
  args: any[]
  status: RunStatus
}

export type StepStatus = 'started' | 'completed' | 'failed' | 'error' | 'retried'

export interface StepState {
  started: Date
  completed?: Date
  step: number
  result?: any
  status: StepStatus
  attempts: {on: Date, error?: any}[]
  error?: any
}

export interface HookState {
  bindings: { on: Date, run: string }[]
  invocations: { on: Date, value: any }[]
}

export interface BaseEvent {
  timestamp: Date
  type: EventType
}

export interface BaseRunEvent extends BaseEvent {
  type: RunEventType | StepEventType
  run: string
}

export interface RunStartEvent extends BaseRunEvent {
  type: 'run:started'
  workflow: string
  args: any[]
}

export interface RunPauseEvent extends BaseRunEvent {
  type: 'run:paused'
}

export interface RunResumeEvent extends BaseRunEvent {
  type: 'run:resumed'
}

export interface RunCompleteEvent extends BaseRunEvent {
  type: 'run:completed'
  result: any
}

export interface RunFailedEvent extends BaseRunEvent {
  type: 'run:failed'
  error: any
}

export type RunEvent = RunStartEvent | RunPauseEvent | RunResumeEvent | RunCompleteEvent | RunFailedEvent

export interface BaseStepEvent extends BaseRunEvent {
  type: StepEventType
  step: number
}

export interface StepStartedEvent extends BaseStepEvent {
  type: 'step:started'
}

export interface StepCompletedEvent extends BaseStepEvent {
  type: 'step:completed'
  result: any
}

export interface StepErrorEvent extends BaseStepEvent {
  type: 'step:error'
  error: any
}

export interface StepFailedEvent extends BaseStepEvent {
  type: 'step:failed'
  error: any
}

export interface StepRetriedEvent extends BaseStepEvent {
  type: 'step:retried'
}

export type StepEvent = StepStartedEvent | StepCompletedEvent | StepErrorEvent | StepFailedEvent | StepRetriedEvent

export interface BaseHookEvent extends BaseEvent {
  type: HookEventType
  hook: string
}

export interface HookBoundEvent extends BaseHookEvent {
  type: 'hook:bound'
  run: string
}

export interface HookInvokedEvent extends BaseHookEvent {
  type: 'hook:invoke'
  value: any
}

export type HookEvent = HookBoundEvent | HookInvokedEvent

export type WorkflowEvent = RunEvent | StepEvent | HookEvent

export interface EventLog {
  log(event: WorkflowEvent): Promise<void>
  getRunState(run: string): Promise<RunState | undefined>
  getStepState(run: string, step: number): Promise<StepState | undefined>
  getHookState(hook: string): Promise<HookState | undefined>
}
