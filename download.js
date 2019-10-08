require('dotenv').config()
const moment = require("moment");

const { getPispk } = require('./nightmarerunner')
const { downloadPispk } = require('./pispk')

module.exports = async (pusk) => {
  let pispk = getPispk()

  

  let tahun = ['2016']
  let thisYear = moment().format("YYYY");

  while( thisYear !== tahun[0]) {
    tahun.push(thisYear)
    thisYear = moment(thisYear, 'YYYY').subtract(1, 'y').format('YYYY')
  }
  
 //let tahun = [ moment().format('YYYY')]

  //console.log(tahun)
  await downloadPispk(pispk, pusk, tahun)
  await pispk.end()
}
