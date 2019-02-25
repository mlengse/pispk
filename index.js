const { schedule } = require('node-cron')
const runner = require('./runner')
schedule('5 1 * * 5,6,7', () => {
  console.log('start', new Date())
  runner()  
})