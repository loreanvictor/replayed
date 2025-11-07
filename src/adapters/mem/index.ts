export { InMemLog } from './log'

import { ReplayContext } from '../../context'
import { EventEmitterNotifier } from '../../notifier'
import { InMemLog } from './log'

export const inMemContext = (): ReplayContext => ({
  events: new InMemLog(),
  notifier: new EventEmitterNotifier(),
})
