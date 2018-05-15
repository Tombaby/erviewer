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
        dbconn.connect(function (err) {
            console.log(err);
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
        this.tables = loadEntity(dbconn);
        this.tablesDom = initEntityDom(this.tables);

    }
    
}