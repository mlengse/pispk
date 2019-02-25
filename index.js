const { schedule } = require('node-cron')
const runner = require('./runner')
schedule('5 1 * * 0,5,6', () => {
  console.log('start', new Date())
  runner()  
})