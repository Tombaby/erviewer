var DBServer = require('./scripts/dbserver');
var ComparerCore = require('./scripts/comparecore');
var winston = require('winston');

var connParam = {
  host: "localhost",
  user: "root",
  password: "root",
  database: "jydata",
  port: 3306
}

var dbServer = new DBServer();
var comparerCore = new ComparerCore();
dbServer.addConn("jydata", connParam, function(err, conn) {
  if (err) {
    winston.error("[dataStart]conn faild " + err);
  } else {
    winston.info("[dataStart]conn success");
  }
});


var dataStart = null;
var dataEnd = null;

winston.level = 'info';

function testStart() {
  dataStart = dbServer.getTableData("jydata", "stock", "inter_code", function(
    data) {
    dataStart = data;
    winston.info("[dataStart]" + dataStart);
  });

}

function testEnd() {
  dataEnd = dbServer.getTableData("jydata", "stock", "inter_code", function(
    data) {
    dataEnd = data;
    winston.info("[dataEnd]" + dataStart);

    var diff = comparerCore.diff(dataStart, dataEnd, "inter_code");
    winston.info("[diff]" + JSON.stringify(diff));
  });
}
