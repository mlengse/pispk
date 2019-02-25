const pad = d => d < 10 ? '0' + d.toString() : d.toString()
const selExists = async (nightmare, sel) => {
  let a = await nightmare.evaluate(function (selector) {
    if ($(selector).length) {
      return true;
    }
    return false;
  }, sel);
  return a;
}
const waitSelExists = async (nightmare, sel) => {
  let se = false;
  while (!se) {
    se = await selExists(nightmare, sel);
  }
}

const waitUntilExists = async (pispk, sel) => {
  let done;
  while (!done) {
    done = await pispk.exists(sel)
  }
}

module.exports = {
  waitUntilExists,
  waitSelExists,
  selExists,
  pad
}