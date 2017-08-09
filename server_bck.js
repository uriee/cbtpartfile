var sql = require('mssql');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');

var config = {
    user: '',
    password: '',
    server: '',
    database: '',
    pool: {
        max: 15,
        min: 0,
        idleTimeoutMillis: 30000
    }    
}

var simpleQuery = async function (key,query) {
    try {
    const pool = await new sql.ConnectionPool(config, async err => {
        let result = await pool.request()
            .input('key', sql.Int, key) 
            .query(query)
        return result.recordset
      })
    return pool;
    } catch (err) {
              console.log("error in query: ",err,query)
      }
}

var recursive = async function (part,level,query,pool) {
    try {
        let result = await pool.request()
            .input('part', sql.Int, part) 
            .input('level', sql.Char, level.toString())
            .query(query)
        var data = result.recordset
        if(data.length != 0) {
            var rest = await data.map(async function(x){
                var ret =  await recursive(x.PART,level+1,query,pool)
                return ret;
            })
           return [].concat.apply(data, await Promise.all(rest)).filter((x)=> x.length != 0);
        }
        return [];
 
    } catch (err) {
              console.log("error in recursive: ",err)
      }
}

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
var port = process.env.PORT || 4001;
var router = express.Router();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Cache-Control', 'no-cache');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

router.get('/', function(req, res) {
    res.json({
        message: 'hooray! welcome to our api!'
    });
});

router.route('/ur').get(function(req, res) {
    res.json({
        message: 'hooray! welcome to our api!'
    });
});



 

router.route('/inter/:part')
    .get(function(req, res) {
            var isqa = (req.params.isqa === 'Y' ? 'Y' : '');
 
            const Q = `select cbt.dbo.PART.PART ,  cbt.dbo.PART.PARTNAME 
                        from cbt.dbo.PART  
                        where cbt.dbo.PART.PARTNAME = \'`+req.params.part+`\'`;    

        const pool1 = new sql.ConnectionPool(config, err => {
          return pool1.request()
                 .query(Q).then(function(recordset, err) {
                    if (err) {
                        console.log("get script Error: " + err);
                    }
                    res.json(recordset.recordset);
                }).catch(function(x){console.log(x);}) 
            });
});

router.route('/inter/part/:part')
    .get(function(req, res) {
            var isqa = (req.params.isqa === 'Y' ? 'Y' : '');
 
            const Q = `select cbt.dbo.PART.PARTNAME AS 'Part Name', 
                        reverse( reverse(substring(reverse( '' + cbt.dbo.PART.PARTDES ) , 1, 50) ) ) AS 'Part Description' , 
                        cbt.dbo.REVISIONS.REVNUM AS 'Revision Number', 
                        reverse( reverse(substring(reverse( '' + cbt.dbo.REVISIONS.REVDES ) , 1, 50) ) )  AS 'Revision Description', 
                        cbt.dbo.CMT_REVDET.REVNAME AS 'SubRevision Number', 
                        reverse( reverse(substring(reverse( '' + cbt.dbo.CMT_REVDET.REVDES ) , 1, 50) ) ) AS 'SubRevision Description', 
                        cbt.dbo.PARTSPEC.SPEC4 
                        from cbt.dbo.PART  inner join cbt.dbo.CMT_REVDET  on ( cbt.dbo.CMT_REVDET.TDATE >= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
                        and ( cbt.dbo.CMT_REVDET.FDATE <= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
                        inner join cbt.dbo.REVISIONS  on ( cbt.dbo.REVISIONS.REV = cbt.dbo.CMT_REVDET.REV ) 
                        inner join cbt.dbo.PARTSPEC  on ( cbt.dbo.PARTSPEC.PART = cbt.dbo.PART.PART ) 
                        where ( cbt.dbo.REVISIONS.FROMDATE <= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
                        and ( cbt.dbo.REVISIONS.TILLDATE >= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
                        and ( cbt.dbo.REVISIONS.PART = cbt.dbo.PART.PART ) 
                        and ( cbt.dbo.PART.PART = `+req.params.part+` ) `;    
        const pool1 = new sql.ConnectionPool(config, err => {
          return pool1.request()
                 .query(Q).then(function(recordset, err) {
                    if (err) {
                        console.log("get script Error: " + err);
                    }
                    res.json(recordset.recordset);
                }).catch(function(x,y){console.log(x,y);}) 
            });
}); 

router.route('/inter/partarc/:part/:type')
    .get(function(req, res) {
 
            const Q = `select cbt.dbo.PART.PARTNAME AS 'Part Name', 
                        reverse( reverse(substring(reverse( '' + cbt.dbo.PART.PARTDES ) , 1, 50) ) ) AS 'Part Description', 
                        (0.0 + ( convert(decimal(20,3), cbt.dbo.PARTARC.SONQUANT) )) AS 'N of Instances'
                        from cbt.dbo.PART  inner join cbt.dbo.PARTARC  on ( cbt.dbo.PARTARC.SON = cbt.dbo.PART.PART ) 
                        and ( cbt.dbo.PARTARC.PART = `+req.params.part+` ) 
                        and ( cbt.dbo.PARTARC.RVTILLDATE >= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
                        and ( cbt.dbo.PARTARC.RVFROMDATE <= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
                        where ( cbt.dbo.PART.TYPE = \'`+req.params.type+`\' )  `;   
        const pool2 = new sql.ConnectionPool(config, err => {
          return pool2.request()                      
                     .query(Q).then(function(recordset, err) {
                    if (err) {
                        console.log("get script Error: " + err);
                    }
                    res.json(recordset.recordset);
                })
            });
});

router.route('/inter/parttools/:part/')
    .get(function(req, res) {
 
            const Q = `select cbt.dbo.PART.PARTNAME ,  cbt.dbo.PART.PARTDES ,  cbt.dbo.ACT.ACTNAME ,  cbt.dbo.ACT.ACTDES  
                       from cbt.dbo.PARTARC  inner join cbt.dbo.PART  on ( cbt.dbo.PART.PART = cbt.dbo.PARTARC.SON ) 
                       inner join cbt.dbo.ACT  on ( cbt.dbo.ACT.ACT = cbt.dbo.PARTARC.ACT ) 
                       where ( cbt.dbo.PARTARC.TILLDATE >= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
                       and ( cbt.dbo.PARTARC.FROMDATE <= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
                       and ( convert(decimal(20,3), cbt.dbo.PARTARC.SONQUANT) = 1.000 ) 
                       and ( cbt.dbo.PARTARC.SONACT = - ( 4 ) ) 
                       and ( cbt.dbo.PARTARC.COEF = 1.000000000 ) 
                       and ( cbt.dbo.PARTARC.OP = 'C' ) 
                       and ( cbt.dbo.PARTARC.PART = `+req.params.part+` ) `;   

        const pool2 = new sql.ConnectionPool(config, err => {
          return pool2.request()                      
                     .query(Q).then(function(recordset, err) {
                    if (err) {
                        console.log("get script Error: " + err);
                    }
                    res.json(recordset.recordset);
                })
            });
});    

router.route('/inter/tempi/:part/')
    .get(function(req, res) {
 
            const Q = `select cbt.dbo.ACT.ACTNAME AS 'desc', 
                       reverse( reverse(substring(reverse( '' + cbt.dbo.CMT_TMPINSTEXT.TEXT ) , 1, 150) ) )  AS 'Text' , 
                        cbt.dbo.CMT_TMPINSTEXT.INSTRUCTION AS 'Order',  cbt.dbo.CMT_TMPINSTEXT.TEXTORD  
                       from cbt.dbo.REVISIONS  inner join cbt.dbo.CMT_REVDET  on ( cbt.dbo.CMT_REVDET.TDATE >= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
                       and ( cbt.dbo.CMT_REVDET.FDATE <= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) and ( cbt.dbo.CMT_REVDET.REV = cbt.dbo.REVISIONS.REV ) 
                       inner join cbt.dbo.CMT_TMPINSTRUCTIONS  on ( cbt.dbo.CMT_TMPINSTRUCTIONS.REVDET = cbt.dbo.CMT_REVDET.REVDET ) 
                       inner join cbt.dbo.CMT_TMPINSTEXT  on ( cbt.dbo.CMT_TMPINSTEXT.INSTRUCTION = cbt.dbo.CMT_TMPINSTRUCTIONS.INSTRUCTION ) 
                       inner join cbt.dbo.ACT  on ( cbt.dbo.ACT.ACT = cbt.dbo.CMT_TMPINSTRUCTIONS.ACT ) 
                       where ( cbt.dbo.REVISIONS.FROMDATE <= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
                       and ( cbt.dbo.REVISIONS.TILLDATE >= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
                       and ( cbt.dbo.REVISIONS.PART = `+req.params.part+` ) 
                       order by 3 , 4 `;   
                       
        const pool1 = new sql.ConnectionPool(config, err => {
          return pool1.request()  
                .query(Q).then(function(recordset, err) {
                    if (err) {
                        console.log("get script Error: " + err);
                    }
                    console.log(recordset.recordset);
                    var obj = recordset.recordset.reduce(function(agg,obj){
                      console.log(obj);
                      if(obj.hasOwnProperty('Text')) {
                        var text = obj['Text'].split("").reverse().join("")
                        if(agg.hasOwnProperty(obj.Order)) {
                            agg[obj.Order].text += text;
                            }
                        else {
                            agg[obj.Order] = {des : obj.desc, text : text};
                             }
                           }
                        return agg;
                        },{}
                    );
                    ret = {}
                    ret.recordset = Object.keys(obj).map(function(o){return {'Action Name': obj[o].des, 'Details':obj[o].text}})
                    res.json(ret.recordset);
                })
            });
});


router.route('/inter/ext/:part/:isqa')
    .get(function(req, res) {
            var isqa = (req.params.isqa === 'Y' ? 'Y' : '');
 
            const Q = `select cbt.dbo.CMT_REVEXTFILE.EXTFILENUM AS '#', 
                         cbt.dbo.CMT_REVEXTFILE.EXTFILENAME AS 'File Name', 
                         cbt.dbo.CMT_REVEXTFILE.EXTFILENAME AS 'Link', 
                         reverse( reverse(substring(reverse( '' + cbt.dbo.CMT_REVEXTFILE.EXTFILEDES ) , 1, 50) ) )  AS 'File Description'   
                         from cbt.dbo.REVISIONS  inner join cbt.dbo.CMT_REVDET  on ( cbt.dbo.CMT_REVDET.TDATE >=  DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
                         and ( cbt.dbo.CMT_REVDET.FDATE <=  DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
                         and ( cbt.dbo.CMT_REVDET.REV = cbt.dbo.REVISIONS.REV ) 
                         inner join cbt.dbo.CMT_REVEXTFILE  on ( cbt.dbo.CMT_REVEXTFILE.ACTIVE = 'Y' ) 
                         and ( cbt.dbo.CMT_REVEXTFILE.PRINTDOC = 'Y' ) 
                         and ( cbt.dbo.CMT_REVEXTFILE.ISQA = \'`+isqa+`\' ) 
                         and ( cbt.dbo.CMT_REVEXTFILE.REVDET = cbt.dbo.CMT_REVDET.REVDET ) 
                         inner join cbt.dbo.PART  on ( cbt.dbo.PART.PART = cbt.dbo.REVISIONS.PART ) 
                         where ( cbt.dbo.REVISIONS.TILLDATE >=  DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
                         and ( cbt.dbo.REVISIONS.FROMDATE <=  DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
                         and ( cbt.dbo.REVISIONS.PART = `+req.params.part+` )
                         order by cbt.dbo.CMT_REVEXTFILE.PRNORD `;  
        const pool1 = new sql.ConnectionPool(config, err => {
          return pool1.request()  
                .query(Q).then(function(data, err) {
                    if (err) {
                        console.log("get script Error: " + err);
                    }
                    data.recordset = data.recordset.map(function(ef){
                      ef.Link = '<a href="file:///'+ef.Link+'"><img border="0" src="file:///'+ef.Link+'" width="50" height="50" alt="מסמך חיצוני"></a>';
                      return ef;
                    })
                    res.json(data.recordset);
                })
            });
}); 

router.route('/inter/exttemp/:part/')
    .get(function(req, res) {
 
            const Q = `select cbt.dbo.ACT.ACTNAME ,  cbt.dbo.ACT.ACTDES ,  cbt.dbo.CMT_TMPINSTRUCTIONS.DES ,  cbt.dbo.CMT_TMPINSTRUCTIONS.EXTFILENAME , 
                       cbt.dbo.CMT_TMPINSTRUCTIONS.FROMDATE ,  cbt.dbo.CMT_TMPINSTRUCTIONS.TILLDATE 
                       from cbt.dbo.CMT_REVDET  inner join cbt.dbo.REVISIONS  on ( cbt.dbo.REVISIONS.REV = cbt.dbo.CMT_REVDET.REV ) 
                       inner join cbt.dbo.CMT_TMPINSTRUCTIONS  on ( cbt.dbo.CMT_TMPINSTRUCTIONS.FROMDATE <= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
                       and ( cbt.dbo.CMT_TMPINSTRUCTIONS.TILLDATE >= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
                       and ( cbt.dbo.CMT_TMPINSTRUCTIONS.REVDET = cbt.dbo.CMT_REVDET.REVDET ) 
                       inner join cbt.dbo.ACT  on ( cbt.dbo.ACT.ACT = cbt.dbo.CMT_TMPINSTRUCTIONS.ACT ) 
                       where ( cbt.dbo.REVISIONS.FROMDATE <= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
                       and ( cbt.dbo.REVISIONS.TILLDATE >= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
                       and ( cbt.dbo.REVISIONS.PART =`+req.params.part+` ) 
                       and ( cbt.dbo.CMT_REVDET.FDATE <= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
                       and ( cbt.dbo.CMT_REVDET.TDATE >= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
                       order by 6 `;  

        const pool1 = new sql.ConnectionPool(config, err => {
          return pool1.request()  
                .query(Q).then(function(data, err) {
                    if (err) {
                        console.log("get script Error: " + err);
                    }
                    data.recordset = data.recordset.map(function(ef){
                      var f = new Date( (567993600 +ef.FROMDATE * 60 ) *1000);
                      var t = new Date( (567993600 +ef.TILLDATE * 60 ) *1000);                      
                      ef.FROMDATE = f.toString().slice(0,15);                      
                      ef.TILLDATE = t.toString().slice(0,15);
                      return ef;
                    })
                    res.json(data.recordset);
                })
            });
}); 


router.route('/inter/proc/:part/')
    .get(function(req, res) {


            const Q = `select cbt.dbo.CMT_PROCACT.ACTORD AS 'Order', 
 cbt.dbo.ACT.ACTDES AS 'Desc',
 reverse( reverse(substring(reverse( '' + cbt.dbo.ACT.ACTDES ) , 1, 50) ) ) AS 'desc' , 
 coalesce( cbt.dbo.PROCACTTEXT.TEXT , '' ) AS "Text" 
  
from cbt.dbo.REVISIONS  inner join cbt.dbo.CMT_REVDET  on ( cbt.dbo.CMT_REVDET.TDATE >= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
and ( cbt.dbo.CMT_REVDET.FDATE <= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
and ( cbt.dbo.CMT_REVDET.REV = cbt.dbo.REVISIONS.REV ) 
 inner join cbt.dbo.CMT_PROCACT  on ( cbt.dbo.CMT_PROCACT.REVDET = cbt.dbo.CMT_REVDET.REVDET ) 
 inner join cbt.dbo.ACT  on ( cbt.dbo.ACT.ACT = cbt.dbo.CMT_PROCACT.ACT ) 
 left outer join cbt.dbo.PROCACTTEXT  on ( cbt.dbo.PROCACTTEXT.REVDET = cbt.dbo.CMT_PROCACT.REVDET ) 
 and ( cbt.dbo.PROCACTTEXT.ACT = cbt.dbo.CMT_PROCACT.ACT ) and ( cbt.dbo.PROCACTTEXT.T$PROC = 0 ) 
 and ( coalesce( cbt.dbo.PROCACTTEXT.TEXTLINE , 0 ) = coalesce( cbt.dbo.PROCACTTEXT.TEXTLINE , 0 ) ) 
where ( cbt.dbo.REVISIONS.PART = `+req.params.part+`  ) 
and ( cbt.dbo.REVISIONS.TILLDATE >= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
and ( cbt.dbo.REVISIONS.FROMDATE <= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) )  
order by cbt.dbo.CMT_PROCACT.ACTORD , cbt.dbo.PROCACTTEXT.TEXTORD  `;

        const pool1 = new sql.ConnectionPool(config, err => {
          return pool1.request()  
                .query(Q).then(function(recordset, err) {
                    if (err) {
                        console.log("get script Error: " + err);
                    }
                    console.log(recordset.recordset);
                    var obj = recordset.recordset.reduce(function(agg,obj){
                      console.log(obj);
                      if(obj.hasOwnProperty('Text')) {
                        var text = obj['Text'].split("").reverse().join("")
                        if(agg.hasOwnProperty(obj.Order)) {
                            agg[obj.Order].text += text;
                            }
                        else {
                            agg[obj.Order] = {des : obj.desc, text : text};
                             }
                           }
                        return agg;
                        },{}
                    );
                    ret = {}
                    ret.recordset = Object.keys(obj).map(function(o){return {'Proccess Name': obj[o].des, 'Details':obj[o].text}})
                    res.json(ret.recordset);
                })
            });
});    

router.route('/inter/locations/:part')
    .get(function(req, res) {

            const Q = `select cbt.dbo.PART.PARTNAME AS 'Part Name', 
                     reverse( reverse(substring(reverse( '' + cbt.dbo.PART.PARTDES ) , 1, 50) ) ) AS 'Part Description', 
                     cbt.dbo.LOCATIONS.LOCATION AS 'Location', 
                     cbt.dbo.LOCATIONS.TOLOCATION AS 'To Location', 
                     cbt.dbo.LOCATIONS.QUANT AS 'Quantity'
                     from cbt.dbo.REVISIONS  inner join cbt.dbo.LOCATIONS  on ( cbt.dbo.LOCATIONS.PART = `+req.params.part+` ) 
                     and ( cbt.dbo.LOCATIONS.PART = cbt.dbo.REVISIONS.PART ) 
                     and ( cbt.dbo.LOCATIONS.REV = cbt.dbo.REVISIONS.REV ) 
                     inner join cbt.dbo.PART  on ( cbt.dbo.PART.PART = cbt.dbo.LOCATIONS.SON ) 
                     where ( cbt.dbo.REVISIONS.TILLDATE > DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
                     and ( cbt.dbo.REVISIONS.FROMDATE <= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) )
                      `;  
        const pool1 = new sql.ConnectionPool(config, err => {
          return pool1.request()
                .query(Q).then(function(recordset, err) {
                    if (err) {
                        console.log("get script Error: " + err);
                    }
                    res.json(recordset.recordset);
                })
            });
}); 
/*router.route('/inter/locations/:part').get(async function(req, res) {
        const query = `select cbt.dbo.PART.PARTNAME AS 'Part Name', 
                 reverse( reverse(substring(reverse( '' + cbt.dbo.PART.PARTDES ) , 1, 50) ) ) AS 'Part Description', 
                 cbt.dbo.LOCATIONS.LOCATION AS 'Location', 
                 cbt.dbo.LOCATIONS.TOLOCATION AS 'To Location', 
                 cbt.dbo.LOCATIONS.QUANT AS 'Quantity'
                 from cbt.dbo.REVISIONS  inner join cbt.dbo.LOCATIONS  on ( cbt.dbo.LOCATIONS.PART = @key ) 
                 and ( cbt.dbo.LOCATIONS.PART = cbt.dbo.REVISIONS.PART ) 
                 and ( cbt.dbo.LOCATIONS.REV = cbt.dbo.REVISIONS.REV ) 
                 inner join cbt.dbo.PART  on ( cbt.dbo.PART.PART = cbt.dbo.LOCATIONS.SON ) 
                 where ( cbt.dbo.REVISIONS.TILLDATE > DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
                 and ( cbt.dbo.REVISIONS.FROMDATE <= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) )
                  `  
    var data = await simpleQuery(parseInt(req.params.part),query) 
    res.json(data)
}); 

*/
router.route('/inter/spec7/:part').get(async function(req, res) {
    var query = `select  @level AS 'Level', 
    cbt.dbo.PART.PART ,   
    cbt.dbo.PART.PARTNAME , 
    cbt.dbo.PART.PARTDES , 
    cbt.dbo.PARTSPEC.SPEC7 
    from cbt.dbo.PARTARC  inner join cbt.dbo.PARTSPEC  on ( cbt.dbo.PARTSPEC.PART = cbt.dbo.PARTARC.SON ) 
    inner join cbt.dbo.PART on ( cbt.dbo.PART.PART = cbt.dbo.PARTARC.SON ) 
    where ( cbt.dbo.PARTSPEC.SPEC7 > rtrim(ltrim(reverse( '' ))) )
    and ( cbt.dbo.PARTARC.PART = @part ) 
    and ( cbt.dbo.PARTARC.FROMDATE <= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) ) 
    and ( cbt.dbo.PARTARC.TILLDATE >= DATEDIFF(minute,\'01-01-1988 00:00\',getdate()) )` 

    const pool = await new sql.ConnectionPool(config, async err => {
      var data = await recursive(parseInt(req.params.part),1,query,pool)
      res.json(data.map((x)=>{return {Level : x.Level, 'Part Name': x.PARTNAME, 'Part Description': x.PARTDES}}))
    });
});    

app.use('/', router);

app.listen(port);
console.log('Magic happens on port ' + port);

