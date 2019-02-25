const Nightmare = require('nightmare');

module.exports = {
  getPispk,
}

function getPispk() {
  return new Nightmare({
    show: true,
    width: 1900,
    gotoTimeout: 300000,
    webPreferences: {
      partition: "persist:pispk3",
      zoomFactor: 0.75,
      image: false
    }
  })
}
