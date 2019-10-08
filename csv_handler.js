const fs = require('fs');
const csv = require('fast-csv');
const stream = csv.format({
  headers: true,
  delimiter: ';'
});


let fromhtml = []

csv
.parseFile('./download/allfromhtml.csv', {
  headers: true,
  delimiter: ';'
})
.on('error', error => console.error(error))
.on('data', row => fromhtml.push(row))
.on('end', rowCount => {
  console.log(`Parsed from html ${rowCount} rows`)
  stream.pipe(fs.createWriteStream("./download/allwithlink.csv"));
  csv
  .parseFile('./download/allnotsehat.csv', {
    headers: true,
    delimiter: ';'
  })
  .on('error', error => console.error(error))
  .on('data', row => {
    let link = fromhtml.filter( e => e.id == row['SURVEI ID'])
    if( link.length ) {
      row.link = link[0].link
      console.log(row)
    }
    stream.write(row);
  })
  .on('end', rowCount => {
    stream.end();
    console.log(`Parsed not sehat ${rowCount} rows`)
  });
});


