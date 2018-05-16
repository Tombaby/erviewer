const mysql = require('mysql')


module.exports = function DBModel(dbinfo) {
    this.dbinfo = {
        host: '192.168.16.173',
        user: 'emotwo',
        password: 'emu2018two',
        port: '3306',
        database: 'emucoo-cfb',
        multipleStatements: true
    } || dbinfo;

    this.listeners = {
        onConnectionErr: function(err) {
            console.log(err)
        },
        onSqlErr: function(err) {
            console.log(err)
        },
        onLoaded: function(models) {

        }
    }

    this.status = 0;


    let asyncQuery = function(conn, sql, args){
        return new Promise((resolve, reject) => {
            conn.query(sql, args, (err, rss) =>{
                if(err) {
                    reject(err)
                } else {
                    resolve(rss)
                }
            });
        });
    }

    var connection = mysql.createConnection(this.dbinfo);
    connection.connect(err => {
        if(err){
            this.listeners.onConnectionErr(err)
        } else {
            var tables = [];
            asyncQuery(connection, "show tables").then(rss =>{
                rss.forEach(element => {
                    tables.push({
                        name: element['Tables_in_emucoo-cfb'], 
                        fields: []
                    })
                })
                var sqls = [];
                for(const tb of tables) {
                    sqls.push('desc ' + tb.name)
                }
                var multiSql = sqls.join(';')
                return asyncQuery(connection, multiSql)
            }).then(rss =>{
                for(var i = 0; i < tables.length; i++) {
                    for(const f of rss[i])
                    tables[i].fields.push(f)
                }
                for(var table of tables){
                    var htb = ''
                    for(var fd of table.fields) {
                        // console.log(fd)
                        htb += '<tr><td>'+fd.Field+'</td><td>'+fd.Type+'</td><td>'+fd.Key+'</td></tr>'
                    }
                    table.dom = '<table>' + htb + '</table>'
                }
                this.models = tables;
                this.listeners.onLoaded(this.models)

            }).catch(err => {
                this.listeners.onSqlErr(err)
            })
        }
    });





    this.init = function (dbinfo) {
        var conninfo = 

        
        dbconn.connect(function (err) {
            if (err) {
                console.log('database connetction fail!');
                console.log(err)
            }
        })

        function initEntityDom(tables) {
            var doms = []
            tables.forEach(element => {
                var tb = '<table class="fields">';
                element.fields.forEach(row => {
                    tb +='<tr><td>' + row.Field + '</td><td>' + row.Type + '</td><td>' + row.Key + '</td><tr>';
                })
                tb += '</table>';
                var div = '<div id="'+ element.name +'" class="graph"><div class="title">'+ element.name +'</div><div class="content">'+ tb +'</div></div>';
                doms.push({name: elememt.name, html: div});
            });
            return doms;
        }


        var dbtables = Array();
        asyncQuery("show tables").then(rss => {
            console.log('export table list')
            rss.forEach(element => {
                var tbl = {
                    "name": element['Tables_in_emucoo-cfb'],
                    "fields": []
                }
                dbtables.push(tbl)
            });
            dbtables.forEach(element => {
                asyncQuery("desc "+ element.name).then(rss => {
                    console.log('desc table')
                    rss.forEach(item => {
                        element.fields.push(item)
                    });
                }).catch(err => {
                    console.log('查询表结构失败!')
                    console.log(err)
                });
            });
            console.log(dbtables);
        }).catch(err => {
            console.log('查询数据表列表失败了!')
            console.log(err)
        });




        function loadEntity (conn) {
            var dbtables = Array();
            conn.query("show tables", function (err, rss) {
                rss.forEach(element => {
                    var tbl = {
                        "name": element['Tables_in_emucoo-cfb'],
                        "fields": []
                    }
                    conn.query('desc ' + element['Tables_in_emucoo-cfb'], function (e, rs) {
                        rs.forEach(r => {
                            tbl.fields.push(r)
                        });
                    })
                    dbtables.push(tbl)
                });
            });
            return dbtables;
        }
        

    }
    
}