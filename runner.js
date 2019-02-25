const fs = require('fs')
const path = require('path')
const excelToJson = require("convert-excel-to-json");
const moment = require('moment')
const logUpdate = require("log-update");

const { upsert } = require('./db')
const { iksQuery } = require('./iks')
const download = require('./download')

moment.locale('id');

const writeStat = (file, no, stat, obj) => {
  
  logUpdate(
`
  file: ${file}
  no: ${no}
  stat: ${stat}
  data: ${JSON.stringify(obj)}
`)};


(async () => {
  //await download()

  let fileNames = fs.readdirSync(path.join(__dirname, 'download')).filter(item => item.includes('.xlsx'))

  //let pispk = []

  for (let item of fileNames) {
    item = path.join(__dirname, 'download', item)
    //console.log(item)
    let { Sheet1 } = excelToJson({
      sourceFile: item,

      header: {
        rows: 4
      },

      columnToKey: {
        '*': '{{columnHeader}}'
      }

    });

    if (Sheet1.length) {
      //console.log(Sheet1.length)
      for (let i = 0; i < Sheet1.length; i++) {
      //for (let obj of Sheet1) {
        let obj = Sheet1[i]
        let inpObj = {
          _key: obj["SURVEI ID"].toString(),
          alamat: obj["ALAMAT"],
          dataID: obj["SURVEI ID"],
          iksBesar: obj['IKS BESAR'],
          iksInti: obj['IKS INTI'],
          jmlArt: obj['JUMLAH ART'],
          jmlArt011: obj['JUMLAH ART USIA 0 - 11 BULAN'],
          jmlArt1054: obj['JUMLAH ART USIA 10 - 54 TAHUN'],
          jmlArt1259: obj['JUMLAH ART USIA 12 - 59 BULAN'],
          jmlArtDewasa: obj['JUMLAH ART DEWASA ( >= 15 TAHUN )'],
          jmlArtWawancara: obj['JUMLAH ART DI WAWANCARA'],
          kel: obj['KELURAHAN'],
          kk: obj['NAMA KK'],
          noKK: obj['NO. URUT KELUARGA'],
          noRumah: obj['NO. URUT BANGUNAN'],
          rt: Number(obj['RT']),
          rw: Number(obj['RW']),
          tgl: moment(obj['TANGGAL SURVEI'], 'YYYY-MM-DD').format('DD/MM/YYYY')
        };

        let { OLD, NEW } = await upsert('pispk', inpObj)

        writeStat(item, i, 'from', obj)
        writeStat(item, i, 'init', inpObj)
        writeStat(item, i, 'old', OLD)
        writeStat(item, i, 'new', NEW)
      }

    }
  }

  let res = await iksQuery()
  console.log(res.length)

})()
