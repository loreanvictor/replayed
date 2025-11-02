import sleep from 'sleep-promise'

import { getRunContext, getWorkflowContext, execInStepContext } from './context'


export class StepPendingError extends Error {
  workflow: string
  run: string
  step: number

  constructor(workflow: string, run: string, step: number) {
    super(`Step ${step} of workflow ${workflow} (${run}) is still pending.`)
    this.name = 'StepPendingError'
    this.workflow = workflow
    this.run = run
    this.step = step
  }
}


export const step = <T, Fn extends ((...args: any[]) => Promise<T>)>(fn: Fn): Fn => {
  return (async (...args: Parameters<Fn>): Promise<T> => {
    const { events } = getWorkflowContext()
    const context = getRunContext()
    context.step = context.step + 1

    const state = await events.getStepState(context.run, context.step)

    if (!state || state.status === 'error') {
      events.log({
        type: state ? 'step:retried' : 'step:started',
        run: context.run,
        step: context.step,
        timestamp: new Date()
      })

      await sleep(0)
      setImmediate(() => {
        execInStepContext(context.step, (state?.attempts.length ?? 0) + 1, () => {
          fn(...args)
            .then(result => {
              events.log({
                type: 'step:completed',
                run: context.run,
                step: context.step,
                timestamp: new Date(),
                result
              })
              // TODO: also resume run
            })
            .catch(error => {
              // TODO: handle errors, and retry accordingly
            })
        })
      })
      throw new StepPendingError(context.workflow, context.run, context.step)
    } else if (state.status === 'started' || state.status === 'retried') {
      await sleep(0)
      throw new StepPendingError(context.workflow, context.run, context.step)
    } else if (state.status === 'failed') {
      throw state.error
    } else {
      return state.result as T
    }
  }) as Fn
}
