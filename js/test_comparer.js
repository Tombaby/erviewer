var Comparer = require('./scripts/comparer');
var CompareCore = require('./scripts/comparecore');
var ResultShow = require('./scripts/resultshow');
var winston = require('winston');


var comparer = new Comparer();
var compareCore = new CompareCore();
var resultshow = new ResultShow();
winston.level = 'info';

var hasInit = false;
var config = null;

winston.add(winston.transports.File, {
  prettyPrint: false,
  level: 'info',
  silent: false,
  colorize: true,
  timestamp: true,
  filename: './mysqlcomparer.log',
  maxsize: 10485760,
  maxFiles: 10,
  json: false
});
winston.remove(winston.transports.Console);


winston.log('info', '\n\nstart\n\n');


function init() {
  comparer.initDatabaseConn(function(err, data) {
    if (err) {
      winston.log('info', 'initDatabaseConn faile.err=' + err);
    } else {
      hasInit = true;
      winston.log('info', 'initDatabaseConn success.data=' + data);
    }
  });
}

function testStart() {
  comparer.getConfig(function(err, configData) {
    winston.log('info', 'initDatabaseConn configData=' + configData);
    config = configData;
    for (var index = 0; index < configData.table.length; ++index) {
      var item = configData.table[index];

      winston.log('info', 'comparer.monitorStart.name=' + item.name);
      comparer.monitorStart(item, function(err, data) {

      });
    }
  });


}


function testEnd() {
  for (var index = 0; index < config.table.length; ++index) {
    var item = config.table[index];
    comparer.monitorEnd(item, function(err, data) {

    });
  }
}


function showDiff() {
  $("#diff_res").html('');

  var monitor = comparer.monitor;
  for (var index = 0; index < monitor.length; ++index) {
    var item = monitor[index];
    winston.log('info', 'item.monitor_start=' + JSON.stringify(item.monitor_start));
    winston.log('info', 'item.monitor_end=' + JSON.stringify(item.monitor_end));

    var diffRes = compareCore.diff(item.monitor_start, item.monitor_end, item.key);


    resultshow.show($("#diff_res"), diffRes, item.table, item.key, item.major_field);

    winston.log('info', 'showDiff.index=' + index + ",res=" + JSON.stringify(
      diffRes));
  }
}
