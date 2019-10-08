const fs = require('fs');
const cheerio = require('cheerio')
const csv = require('fast-csv');

const $ = cheerio.load(fs.readFileSync('./download/Aplikasi Keluarga Sehat.html'));
let all =[]

$('table#tbl-survei > tbody > tr').each( ( tri, trElem) => {
  let obj = { 
    kel : '',
    iksInti: 1
  }
  if(!$(trElem).text().includes('Belum Lengkap')) $(trElem).children().each( ( tdi, tdElem) => {
    let td = $(tdElem).text()
    if(td){
      switch (tdi) {
        case 0:
          obj.noRmh = td
          break;
        case 1:
          obj.noKK = td
          break
        case 2:
          obj.tglSrv = td
          break
        case 3:
          obj.namaKK = td
          break
        case 7:
          obj.kel = td
          break
        case 8:
          obj.rw = td
          break
        case 9:
          obj.rt = td
          break
        case 10:
          obj.iksInti = td
          obj.id = $(tdElem).children().first().attr('data-id')
        case 11:
          obj.iksBesar = td
        default:
          break;
      }
    } else {
      obj.link = $(tdElem).has('.row-edit').children().first().attr('href')
    }

  })
  if(obj.kel === 'MOJOSONGO' && obj.iksInti <= 0.8){
    all.push(obj)
    //console.log(obj)
  }
})

//console.log(all)
csv.writeToPath('./download/allfromhtml.csv', all, {
  headers: true,
  delimiter: ';'
})
    .on('error', err => console.error(err))
    .on('finish', () => console.log('Done writing.'));