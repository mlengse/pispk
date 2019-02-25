const { getPispk } = require('./nightmarerunner')
const { loginPispk } = require('./pispk')

module.exports = async () => {
  let pispk = getPispk()
  pispk.on('page', function (type, message) {
    ty = type;
    msg = message;
  });

  await loginPispk(pispk)
  console.log('done')
  await pispk.end()
}
