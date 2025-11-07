import { use, getReplayContext } from '../context'


describe('use()', () => {
  it('should set replay context', () => {
    const replay = { events: {} as any, notifier: {} as any }
    use(replay)
    expect(getReplayContext()).toBe(replay)
  })
})
