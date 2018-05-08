const mysql = require('mysql')

module.exports = function ERView() {
    this.init = function (dbinfo) {
        var conninfo = {
            host: '192.168.16.173',
            user: 'emotwo',
            password: 'emu2018two',
            port: '3306',
            database: 'emucoo-cfb'
        } || dbinfo
        var dbconn = mysql.createConnection(conninfo);

        var dbtables = Array();
        var initER = function (conn) {
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

                dbtables.forEach(element => {
                    console.log(element)
                });
            });
        }
        
        dbconn.connect(function (err) {
            initER(dbconn);
        })
    }
}