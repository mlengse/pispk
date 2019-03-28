const { arango, testDb, upsert } = require('./db')
const logUpdate = require("log-update");
//iksQuery()
module.exports = {
  iksQuery
}

const writeStat = (obj) => {
  logUpdate(
    `
  data: ${JSON.stringify(obj, null, 2)}
`
  );
};


async function iksQuery(pusk) {
  let database = pusk
  let result = []
  try {
    let dbready = await testDb(arango, database);
    await dbready.query(`
			FOR p IN pispk
			UPDATE { 
				_key: p._key,
				rw: TO_NUMBER(p.rw),
				rt: TO_NUMBER(p.rt)
			} IN pispk
			`)
    let kelCursor = await dbready.query(`
			FOR p IN pispk
			SORT p.kel DESC
			RETURN DISTINCT p.kel
			`)
    let kelResult = await kelCursor.all()
    for (kel of kelResult) {
      let rwCursor = await dbready.query({
        query: `
				FOR p IN pispk 
				FILTER p.kel == @kel
				SORT p.rw DESC
				RETURN DISTINCT p.rw
				`,
        bindVars: {
          kel: kel
        }
      })
      let rwResult = await rwCursor.all()
      for (rw of rwResult) {
        let rtCursor = await dbready.query({
          query: `
						FOR p IN pispk
						FILTER p.kel == @kel && p.rw == @rw
						SORT p.rt DESC
						RETURN DISTINCT p.rt
						`,
          bindVars: {
            kel: kel,
            rw: rw
          }
        })
        let rtResult = await rtCursor.all()
        for (rt of rtResult) {
          let iksCursor = await dbready.query({
            query: `
							LET kel = @kel
							LET rw = @rw
							FOR p IN pispk
							FILTER p.kel == kel && p.rw == rw && p.rt == @rt
							COLLECT rt = p.rt INTO rtGroup 
							RETURN {
								kel: kel,
								rw: rw,
								rt: rt,
								kb: rtGroup[*].p.kb,
								salinFaskes: rtGroup[*].p.salinFaskes,
								imun: rtGroup[*].p.imun,
								asi: rtGroup[*].p.asi,
								tumbuh: rtGroup[*].p.tumbuh,
								tb: rtGroup[*].p.tb,
								ht: rtGroup[*].p.ht,
								jiwa: rtGroup[*].p.jiwa,
								rokok: rtGroup[*].p.rokok,
								jkn: rtGroup[*].p.jkn,
								ab: rtGroup[*].p.ab,
								jamban: rtGroup[*].p.jamban,
								rtGroup: rtGroup[*].p.iksInti
							}
						`,
            bindVars: {
              kel: kel,
              rw: rw,
              rt: rt
            }
          })
          let iksResult = await iksCursor.all();
          //info(JSON.stringify(iksResult[0]))
          let iks = {
            kel: iksResult[0].kel,
            rw: iksResult[0].rw,
            rt: iksResult[0].rt
          }
          iks.jml = iksResult[0].rtGroup.length
          iks.sehat = iksResult[0].rtGroup.filter(e => Number(e) > 0.8).length
          iks.tdksehat = iksResult[0].rtGroup.filter(e => Number(e) < 0.5).length
          iks.prasehat = iks.jml - iks.sehat - iks.tdksehat
          for (let each in iksResult[0]) if (['kel', 'rw', 'rt', 'rtGroup'].indexOf(each) < 0) {
            iks[each] = {
              all: iksResult[0][each].length,
              y: iksResult[0][each].filter(e => e == 'Y').length,
              n: iksResult[0][each].filter(e => e == 'N').length,
              t: iksResult[0][each].filter(e => e == 'T').length
            }

            iks[each].penyebut = iks[each].y + iks[each].t //iks[each].all-iks[each].n;
            iks[each].iks = iks[each].y / iks[each].penyebut || 0
          }
          //iks.rw = Number(iks.rw)
          //iks.rt = Number(iks.rt)
          //info(iks.rw)
          //info(iks.rt)
          result.push(iks)
          iks._key = ['iks', iks.kel.split(' ').join('_'), iks.rw, iks.rt].join('-')
          let { NEW } = await upsert(pusk, 'iks', iks)
          writeStat(NEW)
        }
        let iks = {
          kel: kel,
          rw: rw,
          rt: 'Semua',
        }
        let filt = result.filter(e => e.kel == iks.kel && e.rw == iks.rw)
        //info(JSON.stringify(filt))
        iks.jml = filt.map(e => e.jml).reduce((a, b) => a + b, 0)
        iks.sehat = filt.map(e => e.sehat).reduce((a, b) => a + b, 0)
        iks.prasehat = filt.map(e => e.prasehat).reduce((a, b) => a + b, 0)
        iks.tdksehat = filt.map(e => e.tdksehat).reduce((a, b) => a + b, 0)
        //info(iks)
        for (let each of ['kb', 'salinFaskes', 'imun', 'asi', 'tumbuh', 'tb', 'ht', 'jiwa', 'rokok', 'jkn', 'ab', 'jamban']) {
          iks[each] = {
            all: 0,
            y: 0,
            n: 0,
            t: 0
          }
          for (let f of filt) {
            iks[each].all += f[each].all;
            iks[each].y += f[each].y;
            iks[each].n += f[each].n;
            iks[each].t += f[each].t;
          }
          iks[each].penyebut = iks[each].y + iks[each].t;
          iks[each].iks = iks[each].y / iks[each].penyebut
        }
        //iks.rw = Number(iks.rw)
        //info(iks.rw)
        //info(iks.rt)
        result.push(iks)
        iks._key = ['iks', iks.kel.split(' ').join('_'), iks.rw, iks.rt].join('-')
        let { NEW } = await upsert(pusk, 'iks', iks)
        writeStat(NEW)
      }
      let iks = {
        kel: kel,
        rw: 'Semua',
        rt: 'Semua'
      }
      let filt = result.filter(e => e.kel == iks.kel && e.rt == 'Semua')
      iks.jml = filt.map(e => e.jml).reduce((a, b) => a + b, 0)
      iks.sehat = filt.map(e => e.sehat).reduce((a, b) => a + b, 0)
      iks.prasehat = filt.map(e => e.prasehat).reduce((a, b) => a + b, 0)
      iks.tdksehat = filt.map(e => e.tdksehat).reduce((a, b) => a + b, 0)
      //info(iks)
      for (let each of ['kb', 'salinFaskes', 'imun', 'asi', 'tumbuh', 'tb', 'ht', 'jiwa', 'rokok', 'jkn', 'ab', 'jamban']) {
        iks[each] = {
          all: 0,
          y: 0,
          n: 0,
          t: 0
        }
        for (let f of filt) {
          iks[each].all += f[each].all;
          iks[each].y += f[each].y;
          iks[each].n += f[each].n;
          iks[each].t += f[each].t;
        }
        iks[each].penyebut = iks[each].y + iks[each].t;
        iks[each].iks = iks[each].y / iks[each].penyebut
      }
      //info(iks)
      result.push(iks)
      iks._key = ['iks', iks.kel.split(' ').join('_'), iks.rw, iks.rt].join('-')
      let { NEW } = await upsert(pusk, 'iks', iks)
      writeStat(NEW)

    }
    let iks = {
      kel: 'Semua',
      rw: 'Semua',
      rt: 'Semua'
    }
    let filt = result.filter(e => e.rw == 'Semua')
    iks.jml = filt.map(e => e.jml).reduce((a, b) => a + b, 0)
    iks.sehat = filt.map(e => e.sehat).reduce((a, b) => a + b, 0)
    iks.prasehat = filt.map(e => e.prasehat).reduce((a, b) => a + b, 0)
    iks.tdksehat = filt.map(e => e.tdksehat).reduce((a, b) => a + b, 0)
    //info(iks)
    for (let each of ['kb', 'salinFaskes', 'imun', 'asi', 'tumbuh', 'tb', 'ht', 'jiwa', 'rokok', 'jkn', 'ab', 'jamban']) {
      iks[each] = {
        all: 0,
        y: 0,
        n: 0,
        t: 0
      }
      for (let f of filt) {
        iks[each].all += f[each].all;
        iks[each].y += f[each].y;
        iks[each].n += f[each].n;
        iks[each].t += f[each].t;
      }
      iks[each].penyebut = iks[each].y + iks[each].t;
      iks[each].iks = iks[each].y / iks[each].penyebut
    }
    result.push(iks)
    iks._key = ['iks', iks.kel.split(' ').join('_'), iks.rw, iks.rt].join('-')
    let { NEW } = await upsert( pusk, 'iks', iks)
    writeStat(NEW)
  } catch (err) {
    console.log(err)
  }
  return result
}
