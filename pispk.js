require('dotenv').config()
const path = require('path')
const { waitUntilExists } = require('./common')
const url = process.env.PISPK_URL
const selectionTahun = process.env.SELECTION
const inputSelection = process.env.SELECTION_INPUT
const download = process.env.SELECTION_DOWNLOAD

const loginPispk = async (pispk, pusk) => {
  const username = process.env[`PISPK_${pusk.toUpperCase()}_USERNAME`]
  const password = process.env[`PISPK_${pusk.toUpperCase()}_PASSWORD`]
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

const downloadPispk = async (pispk, pusk, tahun) => {
  try{
    await loginPispk(pispk, pusk)

    for (let thisYear of tahun) {
      await pispk.goto(`${url}rawdata_survei`)

      await waitUntilExists(pispk, selectionTahun)
      await pispk.mousedown(selectionTahun).click(selectionTahun)
      await waitUntilExists(pispk, inputSelection)
      await pispk.type(inputSelection, thisYear)
      await pispk.type(inputSelection, '\u000d')
      let dl = await pispk.mousedown(download).click(download).download(path.join(__dirname, 'download', `survei-${pusk}-${thisYear}.xlsx`))
      console.log(dl)

    }


  }catch(err){
    console.log(err)
  }
}
module.exports = {
  downloadPispk
}