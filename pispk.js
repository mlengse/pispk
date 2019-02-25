require('dotenv').config()
const { waitUntilExists } = require('./common')
const url = process.env.PISPK_URL
const username = process.env.PISPK_USERNAME
const password = process.env.PISPK_PASSWORD

module.exports = {
  loginPispk,
}

async function loginPispk(pispk) {
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