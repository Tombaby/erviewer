const mysql = require('mysql')


module.exports = function DBModel(options) {
    this.dbinfo = options.dbinfo || {
        host: '192.168.16.173',
        user: 'emotwo',
        password: 'emu2018two',
        port: '3306',
        database: 'emucoo-cfb',
        multipleStatements: true
    }

    this.listeners = {
        onConnectionErr: function(err) {
            console.log(err)
        },
        onSqlErr: function(err) {
            console.log(err)
        }
    } 
    this.listeners.onLoaded = options.onLoaded || function(models) {
        console.log('default callback notification: onLoaded')
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
                for(var i = 0, len = tables.length; i < len; i++) {
                    for(const f of rss[i]){
                        tables[i].fields.push(f)
                    }
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

    
}