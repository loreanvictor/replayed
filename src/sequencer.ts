export interface SequencedEvent { seq: number }

/**
 *
 * Ensures events are replayed according to given
 * sequence. This helps ensure that replaying functions will yield
 * stable results based on the order of output events. Take the following
 * example:
 *
 * ```ts
 * const res = await Promise.race([stepA(), stepB()])
 * ```
 *
 * If `stepB` completes first, then initially `res` will be set to its result.
 * However, if until some future replay, `stepA` has also completed, the result of this
 * expression, without sequencing, will be `stepA`'s result, meaning replays will
 * behave differently.
 *
 * To fix this issue, we use the sequencer to ensure that `stepA()` and `stepB()`
 * will complete in the same order as in the event log. Each step/hook that is already completed,
 * waits for the sequencer of each run before returning its value or throwing its failure error,
 * and the sequencer allows these steps/hooks to proceed based on the order determined
 * by the given sequence.
 *
 * @param events the sequence of events that should be enforced
 * @returns an object with a `turn()` method. Assuming the enforced sequence is [..., i, j, ...],
 *          calling `turn(j)` yields a Promise that is only resolved after `turn(i)`
 *          has been called and its Promise resolved, i.e. after all prior events have been handled.
 */
export const sequencer = (events: SequencedEvent[]) => {
  const iterator = events[Symbol.iterator]()
  //
  // we only resolve promises for calls
  // to the sequence pointed to by the cursor, and anyone else will just
  // be enqueued and will have to wait.
  //
  let cursor = iterator.next()

  //
  // holds a queue for all the waiters. each sequence number
  // can have multiple waiters, and we won't proceed to the next
  // sequence until all waiters have been resolved.
  //
  const queue = new Map<number, (() => void)[]>()

  //
  // puts a waiter in the queue for given sequence.
  //
  const enqueue = (seq: number, fn: () => void) => {
    const fns = queue.get(seq)
    if (fns) {
      fns.push(fn)
    } else {
      queue.set(seq, [fn])
    }
  }

  //
  // removes a specific waiter from the queue of given sequence.
  // if no other waiters remain, will also remove the queue.
  //
  const dequeue = (seq: number, fn: () => void) => {
    if (queue.has(seq)) {
      const fns = queue.get(seq)!
      const index = fns.indexOf(fn)
      if (index > -1) {
        fns.splice(index, 1)
        if (fns.length === 0) {
          queue.delete(seq)
        }
      }
    }
  }

  //
  // checks whether we should proceed to the next sequence.
  // the caller must have current sequence, which is the input argument
  // that is checked against the current sequence.
  //
  // if there are other waiters for the current sequence, won't proceed
  // to the next one, and calls the next waiter. each waiter in turn then
  // calls this function when they are resolved.
  //
  // if no further waiters remain for current sequence, we go to the next
  // sequence, and if there are any waiters, will call the first one.
  //
  const next = (seq: number) => {
    if (cursor.done) { return }
    if (cursor.value.seq !== seq) {
      return
    }
    if (queue.has(cursor.value.seq)) {
      const fns = queue.get(cursor.value.seq)!
      fns[0]!()

      return
    }

    setImmediate(() => {
      cursor = iterator.next()
      if (!cursor.done) {
        const fns = queue.get(cursor.value.seq)
        fns && fns[0]!()
      }
    })
  }

  return {
    turn: (seq: number) => new Promise<void>((resolve, reject) => {
      //
      // checks whether the current sequence is the one
      // that we are waiting for with this `turn()` call.
      //
      const check = () => {
        if (cursor.done) {
          //
          // actually no more events in the sequence,
          // there must have been an error that needs resolving.
          //
          reject()

          return false
        } else if (seq === cursor.value.seq) {
          //
          // ok we are at the correct sequence, so we can remove ourselves
          // from the queue, and call on the next handler or next sequence
          // if there are no more handlers for current seq.
          //
          dequeue(seq, check)
          next(seq)
          resolve()

          return false
        }

        //
        // eh, we should wait apparently, so
        // lets just enqueue ourselves and wait.
        //
        return true
      }

      if (check()) {
        enqueue(seq, check)
      }
    })
  }
}
