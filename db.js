require('dotenv').config()
const { Database } = require('arangojs')

const host = process.env.ARANGODB_HOST
const port = process.env.ARANGODB_PORT
const database = process.env.ARANGODB_DB
const dbUsername = process.env.ARANGODB_USERNAME
const dbPassword = process.env.ARANGODB_PASSWORD
const arango = new Database({
  url: `http://${dbUsername}:${dbPassword}@${host}:${port}`
});

const testDb = async (arango) => {
  try {
    arango.useDatabase(database);
    return arango;
  } catch (err) {
    console.log(err)
  }
}

const testCol = async (db, coll) => {
  try {
    let collnames = await db.collections(true);
    let names = collnames.map(collname => {
      let name = collname.name;
      return name;
    });
    let collready = db.collection(coll);
    if (names.indexOf(coll) == -1) {
      await collready.create();
    }
  } catch (err) {
    console.log(err)
  }
}

const testing = async (arango, collname) => {
  try {
    let dbready = await testDb(arango);
    await testCol(dbready, collname);
    return dbready
  } catch (err) {
    console.log(err)
  }
}

const upsert = async (collname, doc) => {
  try {
    let dbready = await testing(arango, collname)
    let cursor = await dbready.query({
      query: 'UPSERT { _key : @_key } INSERT @doc UPDATE @doc IN @@collname RETURN { OLD, NEW }',
      bindVars: {
        "@collname": collname,
        _key: doc._key,
        doc: doc
      }
    });
    let result = await cursor.all();
    return result[0];
  } catch (err) {
    console.log(err)
  }
}

module.exports = {
  upsert,
  arango,
  database,
  testDb,
}
