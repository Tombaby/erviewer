const mysql = require('mysql');
const winston = require('winston');

function DBServer() {
  var connMap = {};

  this.addConn = function(connName, connParam, callback) {
    winston.log('info', '[DBServer.addConn]start.connName=' + connName);
    var conn = mysql.createConnection({
      host: connParam.host,
      user: connParam.user,
      password: connParam.password,
      database: connParam.database,
      port: connParam.port
    });

    conn.connect(function(err) {
      if (err) {
        winston.log('error', 'error connecting: ' + err.stack);
        callback(err, null);
      } else {
        connMap[connName] = conn;

        winston.log('info', '[DBServer.addConn]success.connName=' +
          connName);
        callback(null, conn);
      }
    });
  };

  this.getConn = function(connName) {
    return connMap[connName];
  };

  this.getTableData = function(connName, item, callback) {
    winston.log('info', '[DBServer.getTableData]start.connName=' + connName);
    var tableName = item.table;
    var key = item.key;
    var conn = this.getConn(connName);
    if (!conn) {
      winston.log('info', 'get conn faile.connName=' + connName);
      return null;
    }

    var sqlDesc = 'desc ' + tableName;
    //winston.log('info', "[DBServer.getTableData]sqlDesc=" + sqlDesc);

    var descSelect = null;
    conn.query(sqlDesc, function(err, rows) {
      if (err) {
        winston.log('info', err);
        return null;
      }

      winston.log('info', "desc: " + rows.length);
      //winston.log('info', rows);

      descSelect = rows;

      var dataSelect = null;
      var sqlSelect = "select * from " + tableName + " order by " + key;
      winston.log('info', "[DBServer.getTableData]sqlSelect=" + sqlSelect);
      conn.query(sqlSelect, function(err, rows) {
        if (err) {
          winston.log('info', '[DBServer.getTableData]err:', err);
          return null;
        }

        winston.log('info', '[DBServer.getTableData]info length:' +
          rows.length);
        dataSelect = rows;
        var res = {
          desc: descSelect,
          data: dataSelect
        };

        //winston.log('info', "[DBServer.getTableData]res=" + res);
        //winston.log('info', "[DBServer.getTableData]dataSelect[0]=" + dataSelect[0].toString());
        callback(res);
      });
    });
  };
};

module.exports = DBServer;
