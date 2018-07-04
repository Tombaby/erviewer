const mysql = require('mysql')
let parseSQL = require('./sqlparser')

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
            this.models = [];
            asyncQuery(connection, "show tables").then(rss =>{
                var sqls = [];
                rss.forEach(element => {
                    sqls.push('show create table ' + element['Tables_in_emucoo-cfb'])
                })
                var multiSql = sqls.join(';')
                return asyncQuery(connection, multiSql)
            }).then(rss =>{
                rss.forEach(rs => {
                    this.models.push(parseSQL(rs[0]["Create Table"]))
                });
                this.listeners.onLoaded(this.models)
            }).catch(err => {
                this.listeners.onSqlErr(err)
            })
        }
    });

    
}