export class StepPendingError extends Error {
  replayable: string
  run: string
  step: number

  constructor(replayable: string, run: string, step: number) {
    super(`Step ${step} of replayable ${replayable} (run ${run}) is still pending.`)
    this.name = 'StepPendingError'
    this.replayable = replayable
    this.run = run
    this.step = step
  }
}


export class HookPendingError extends Error {
  hookId: string
  constructor(hookId: string) {
    super(`Hook ${hookId} is still pending.`)
    this.name = 'HookPendingError'
    this.hookId = hookId
  }
}


export const isPendingError = error => {
  return error instanceof StepPendingError
    || error instanceof HookPendingError
    || (
      error instanceof AggregateError &&
      !error.errors.some(e => !isPendingError(e))
    )
}


export class FatalError extends Error {
  source: Error

  constructor(source: Error) {
    super(source.message)
    this.name = 'FatalError'
    this.source = source
  }
}

export class Retry extends Error {
  delay = 0

  constructor(delay) {
    super('Retry')
    this.name = 'Retry'
    this.delay = delay
  }
}
