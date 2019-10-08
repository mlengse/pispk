const { schedule } = require('node-cron')
const runner = require('./runner')
schedule('5 1 * * 0,6', async () => {
// ;(async() => {
  for (let pusk of ['sibela', 'purwosari']) {
    console.log('start', pusk, new Date())
    await runner(pusk)
  }
// })()
})