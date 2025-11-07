export type ReplayableFn = (...args: unknown[]) => Promise<unknown>


export class UnregisteredReplayableError extends Error {
  replayableId

  constructor(replayableId: string) {
    super(`Replayable ${replayableId} is not registered`)
    this.replayableId = replayableId
  }
}


const _registry = new Map<string, ReplayableFn>()

export const register = (name: string, fn: ReplayableFn) => _registry.set(name, fn)
export const getReplayable = (name: string) => {
  const candidate = _registry.get(name)

  if (candidate) {
    return candidate
  } else {
    throw new UnregisteredReplayableError(name)
  }
}
