import { step } from '../step'


describe('step', () => {
  it('should be the same function with same signature in other contexts.', () => {
    const fn = step(async (x: number) => x * 2)
    expect(fn(2)).resolves.toBe(4)
  })
})
