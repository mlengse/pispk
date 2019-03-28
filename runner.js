const fs = require('fs')
const path = require('path')
const excelToJson = require("convert-excel-to-json");
const moment = require('moment')
const logUpdate = require("log-update");

const { upsert} = require('./db')
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
`)
};

module.exports = async (pusk) => {
  await download(pusk)

  let fileNames = fs.readdirSync(path.join(__dirname, 'download')).filter(item => item.includes('.xlsx') && item.includes(pusk))

  //let pispk = []

  for (let item of fileNames) {
    item = path.join(__dirname, 'download', item)
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
      let idList = [...new Set(Sheet1.map(e => e['SURVEI ID']))]
      for (let i = 0; i < idList.length; i++) {
        const element = idList[i];

        let arts = Sheet1.filter( e => e['SURVEI ID'] === element)

        let inpObj = {
          ab: [],
          asi: [],
          ht:[],
          imun:[],
          jamban:[],
          jiwa:[],
          jkn:[],
          kb:[],
          rokok:[],
          salinFaskes:[],
          tb:[],
          tumbuh:[]
        }

        if(arts.length) arts.map( obj => {
          if(obj['IKS INTI']) {
            inpObj = Object.assign({}, inpObj, {
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
            })

            inpObj.ab.push(obj['TERSEDIA SARANA AIR BERSIH'] || 'N')
            inpObj.asi.push(obj['ASI EKSLUSIF'] || 'N')
            inpObj.ht.push(obj['MINUM OBAT HIPERTENSI TERATUR'] || 'N')
            inpObj.imun.push(obj['IMUNISASI LENGKAP'] || 'N')
            inpObj.jamban.push(obj['TERSEDIA JAMBAN KELUARGA'] || 'N')
            inpObj.jiwa.push(obj['ART MINUM OBAT GANGGUAN JIWA BERAT TERATUR'] || 'N')
            inpObj.jkn.push(obj['KEPESERTAAN JKN'] || 'N')
            inpObj.kb.push(obj['MENGGUNAKAN KB'] || 'N')
            inpObj.rokok.push(obj['MEROKOK'] || 'N')
            inpObj.salinFaskes.push(obj['PERSALINAN DI FASKES'] || 'N')
            inpObj.tb.push(obj['MINUM OBAT TB TERATUR'] || 'N')
            inpObj.tumbuh.push(obj['PEMANTAUAN PERTUMBUHAN BALITA'] || 'N')

          }
        })

        if(inpObj._key){
          ['ab', 'jamban', 'jiwa'].map(o => {
            inpObj[o] = inpObj[o][0]
          })
          
          ;['asi', 'ht', 'imun', 'jkn', 'kb', 'salinFaskes', 'tb', 'tumbuh'].map( e => {
            if (inpObj[e].filter(a => a === 'Y').length) {
              inpObj[e] = 'Y'
            } else if (inpObj[e].filter(a => a === 'T').length) {
              inpObj[e] = 'T'
            } else {
              inpObj[e] = 'N'
            }
          })

          ;['rokok'].map( e => {
            if(inpObj[e].filter(a=>a==='Y').length){
              inpObj[e] = 'T'
            } else {
              inpObj[e] = "Y";
            }
          })

          let { OLD, NEW } = await upsert( pusk, 'pispk', inpObj)

          //writeStat(item, i, 'from', arts)
          writeStat(item, i, 'init', inpObj)
          writeStat(item, i, 'old', OLD)
          writeStat(item, i, 'new', NEW)
        }
      }
    }
  }

  let res = await iksQuery(pusk)
  console.log(res.length)

}
