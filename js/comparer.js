const fs = require("fs");
const winston = require('winston');
var DBServer = require('./dbserver');
var ComparerCore = require('./comparecore');

function Comparer(){
    const dbServer = new DBServer();
    const comparerCore = new ComparerCore();

    this.configFile = "./config.json";
    this.configData = null;
    this.monitor = [];

    this.initDatabaseConn = function(callback){
        winston.log('info', "[Comparer.initDatabaseConn]start.");
        if(null == this.configData){
            this.getConfig(function(err, data){
                if(err){
                    callback(err, null);
                }else{
                    var database = data.database;
                    for(var index = 0; index < database.length; index++){
                        var item = database[index];
                        winston.log('info', "[Comparer.initDatabaseConn]index=" + index + ",item=" + JSON.stringify(item));
                        var param = {
                            host: item.host,
                            port: item.port,
                            user: item.user,
                            password: item.password,
                            database: item.database
                        };

                        dbServer.addConn(item.id, param, function(err, data){
                            callback(err, data);
                        });
                    }
                }
            });
        }
    };

    ///callback(err, data)：错误时err不为空，data为空；有数据返回时err为空，data不为空，返回数据。
    this.getConfig = function(callback){
        winston.log('info', "[Comparer.getConfig]configFile=" + this.configFile + ",this.configData=" + this.configData);

        if(this.configData){
            winston.log('info', "[Comparer.getConfig]this.configData has read.");
            callback(null, this.configData);
            return;
        }

        fs.readFile(this.configFile, 'utf-8', function(err, data){
            if(err){
                callback(err, data);
            }else{
                winston.log('info', "[Comparer.getConfig]querystring.parse.data=" + data);
                comparer.configData = JSON.parse(data, ';', ':');
                //winston.log('info', "[Comparer.getConfig]callback.configData=" + JSON.stringify(configData));
                callback(null, comparer.configData);
            }
        });
    };

    this.monitorStart = function(item, callback){
        winston.log('info', "[Comparer.monitorStart]start.tabel:" + item.table);
        var monitorItem = this._getMonitor(item.name);
        if(monitorItem == null){
            this.monitor[this.monitor.length] = {
                "name": item.name,
                "table": item.table,
                "key": item.key,
                "databse_id": item.databse_id,
                "monitor_start": {},
                "monitor_end": null,
                "major_field": item.major_field
            };

            monitorItem = this.monitor[item.name];
        }else{
            monitorItem.monitor_start = {};
            monitorItem.monitor_end = null;
        }

        dbServer.getTableData(item.databse_id, item, function(data){
            winston.log('info', "[Comparer.monitorStart]tabel:" + item.table + ",length:" + data.data.length);

            var monitorItem = comparer._getMonitor(item.name);
            if(monitorItem){
                monitorItem.monitor_start.data = data.data;
                monitorItem.monitor_start.desc = data.desc;
            }

        });

        return 0;
    };

    this.monitorEnd = function(item, callback){
        winston.log('info', "[Comparer.monitorEnd]start.tabel:" + item.table);
        var monitorItem = this._getMonitor(item.name);
        if(monitorItem == null){
            winston.log('error', "[Comparer.monitorEnd]item is null.tabel:" + item.table);
            return null;
        }

        dbServer.getTableData(item.databse_id, item, function(data){
            winston.log('info', "[Comparer.monitorEnd]tabel:" + item.table + ",length:" + data.data.length);
            var monitorItem = comparer._getMonitor(item.name);
            if(monitorItem){
                monitorItem.monitor_end = {};
                monitorItem.monitor_end.data = data.data;
                monitorItem.monitor_end.desc = data.desc;
            }
        });

        return 0;
    };

    this._getMonitor = function(name){
        var monitorRes = null;
        for(var index = 0; index < this.monitor.length; ++index){
            var monitorItem = this.monitor[index];
            if(monitorItem.name == name){
                monitorRes = monitorItem;
                break;
            }
        }
        return monitorRes;
    };
};

module.exports = Comparer;
