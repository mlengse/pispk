require('dotenv').config()

const { getPispk } = require('./nightmarerunner')
const { downloadPispk } = require('./pispk')

module.exports = async () => {
  let pispk = getPispk()
  await downloadPispk(pispk)
  await pispk.end()
}
