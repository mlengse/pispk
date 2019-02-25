require('dotenv').config()
const moment = require('moment')
const { waitUntilExists } = require('./common')
const url = process.env.PISPK_URL
const username = process.env.PISPK_USERNAME
const password = process.env.PISPK_PASSWORD
const selectionTahun = process.env.SELECTION
const inputSelection = process.env.SELECTION_INPUT
const download = process.env.SELECTION_DOWNLOAD

const thisYear = moment().format('YYYY')

const loginPispk = async pispk => {
  try {
    await pispk.goto(url)
      .insert('#username', username)
      .insert('#password', password)
      .click('button.btn-block.btn.btn-primary');
    await waitUntilExists(pispk, 'li > ul > li > a[href="' + url + 'rawdata_survei"]')
  } catch (err) {
    console.log(err)
  }
}

const downloadPispk = async pispk => {
  try{
    await loginPispk(pispk)
    await pispk.goto(`${url}rawdata_survei`)
    await waitUntilExists(pispk, selectionTahun)
    await pispk.mousedown(selectionTahun).click(selectionTahun)
    await waitUntilExists(pispk, inputSelection)
    await pispk.type(inputSelection, thisYear)
    await pispk.type(inputSelection, '\u000d')
    let dl = await pispk.mousedown(download).click(download).download()
    console.log(dl)

  }catch(err){
    console.log(err)
  }
}
module.exports = {
  downloadPispk
}