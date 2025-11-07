import sleep from 'sleep-promise'

import { hook, trigger, step, replayable, use, once } from '../src'
import { inMemContext } from '../src/adapters/mem'

use(inMemContext())

const stepA = step(async () => { console.log('A') })
const stepB = step(async () => { console.log('B') })
const stepC = step(async () => (await sleep(250), console.log('C'), 42))

const sample = replayable('sample', async () => {
  const confirm = await hook('confirm')
  await once(() => console.log('O'))
  await stepA()
  await stepB()

  const value = await Promise.race([
    confirm.once(),
    stepC(),
  ])

  console.log('D', value)
})

sample()

setTimeout(() => trigger({ id: 'confirm' }, 64), 200)

// ---- DEBUG ----

import { getReplayContext } from '../src'

const context = getReplayContext()
setTimeout(() => {
  console.log(context.events)
}, 500)
