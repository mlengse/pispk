const path = require('path')
const Nightmare = require('nightmare');
require('nightmare-inline-download')(Nightmare);
module.exports = {
  getPispk,
}

function getPispk() {
  return new Nightmare({
    show: false,
    width: 1900,
    //gotoTimeout: 300000,
    webPreferences: {
      partition: "persist:pispk1",
      zoomFactor: 0.75,
      image: false
    },
    paths: {
      downloads: path.join(__dirname, 'download')
    }
  })
}
