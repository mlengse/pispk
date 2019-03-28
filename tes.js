const runner = require('./runner')
console.log('start', new Date());
(async() => {
  for (let pusk of ['sibela', 'purwosari']) {
    await runner(pusk)
  }
})()
