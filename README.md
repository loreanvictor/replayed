<br/>

<img src="./logo-dark.svg#gh-dark-mode-only" height="48px"/>
<img src="./logo-light.svg#gh-light-mode-only" height="48px"/>

<br/>

long running workflows that can be resumed:

```ts
import { replayable, step, sleep, hook } from 'replayed'


//
// the workflow itself is a registered replayable,
// which will be replayed upon pauses, after interrupts, etc.
//
const verifyEmail = replayable('verify-email', async (userid, email) => {
  //
  // the data here is fetched once and cached,
  // and the cached value is used in replays instead
  // of fetching again.
  //
  const { name } = await fetchUserData(userid)

  //
  // a hook is a point where we wait for
  // an external event, which can also take
  // a long time to occur, like the user confirming
  // their email address.
  //
  const confirm = hook()
  await sendVerificationEmail(email, name, confirm.token)

  //
  // we wait one day for the user to confirm
  // the email address, after that the hook
  // won't work anymore.
  //
  const approved = await Promise.race([
    sleep('1 day'),
    confirm.once(),
  ])

  if (approved) {
    await markEmailVerified(userid, email)
    await ('30 days')
    await sendFollowUpEmail(email)
  } else {
    await sleep('2 days')
    await sendReminderEmail(email)
  }
})
```
