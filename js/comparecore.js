const winston = require('winston');

function ComparerCore() {
  this.diff = function(dataStart, dataEnd, key) {
    //winston.log('info', "[ComparerCore.diff]dataStart=" + dataStart);
    //winston.log('info', "[ComparerCore.diff]dataEnd=" + dataEnd);
    winston.log('info', "[ComparerCore.diff]key=" + key);

    if (dataStart == null || dataEnd == null) {
      return;
    }

    var res = [];
    var indexStart = 0;
    var indexEnd = 0;

    var dataStartData = dataStart.data;
    var dataEndData = dataEnd.data;

    // if(dataStartData.length === dataEndData.length){
    //     var querystringStart = JSON.stringify(dataStartData);
    //     var querystringEnd = JSON.stringify(dataEndData);
    //     if(querystringStart === querystringEnd){
    //         return res;
    //     }
    // }

    //winston.log('info', "[ComparerCore.diff]dataStartData=" + dataStartData);
    //winston.log('info', "[ComparerCore.diff]dataEndData=" + dataEndData);
    for (indexStart = 0; indexStart < dataStartData.length; indexStart++) {
      var itemStart = dataStartData[indexStart];
      var keyStart = this.getKey(itemStart, key);
      var querystringStart = JSON.stringify(itemStart);
      winston.log('info', "[ComparerCore.diff]indexStart=" + indexStart +
        ",keyStart=" + keyStart + ",querystringStart=" + querystringStart);

      var indexEndBack = indexEnd;
      var keyNext = null;
      if (indexStart + 1 < dataStartData.length) {
        keyNext = this.getKey(dataStartData[indexStart + 1], key);
      }

      var hasHound = 0;
      for (; indexEnd < dataEndData.length;) {
        var itemEnd = dataEndData[indexEnd];
        var keyEnd = this.getKey(itemEnd, key);

        winston.log('info', "indexEnd=" + indexEnd + ",keyStart=" + keyStart +
          ",keyEnd=" + keyEnd + ",keyNext=" + keyNext);

        if (keyStart === keyEnd) {
          var querystringEnd = JSON.stringify(itemEnd);
          if (querystringStart === querystringEnd) {
            //数据没有变化
          } else {
            //数据有更新
            //winston.log('info', "[ComparerCore.diff][diff====update]querystringStart" + querystringStart + ",querystringEnd=" + querystringEnd);
            res[res.length] = {
              type: "update",
              key: keyStart,
              dataStart: itemStart,
              dataEnd: itemEnd
            };
          }

          //[indexEndBack, indexEnd)之间的数据属于新增数据
          for (var indexAdd = indexEndBack; indexAdd < indexEnd; indexAdd++) {
            res[res.length] = {
              type: "add",
              key: keyStart,
              dataStart: null,
              dataEnd: itemEnd
            };
          }

          indexEnd++
          indexEndBack = indexEnd;

          hasHound = 1;
          break;
        } else {
          if (keyNext === keyEnd) {
            //原数据已经删除
            res[res.length] = {
              type: "delete",
              key: keyStart,
              dataStart: itemStart,
              dataEnd: null
            };
            indexEndBack = indexEnd;
            hasHound = 1;
            break;
          }

          indexEnd++;
        }
      }

      if (hasHound === 0) {
        //原数据已经删除
        res[res.length] = {
          type: "delete",
          key: keyStart,
          dataStart: itemStart,
          dataEnd: null
        };
      }

      indexEnd = indexEndBack;
    }

    for (var indexEnd = indexEnd; indexEnd < dataEndData.length; indexEnd++) {
      var itemEnd = dataEndData[indexEnd];
      res[res.length] = {
        type: "add",
        key: itemEnd[key],
        dataStart: null,
        dataEnd: itemEnd
      };
    }

    //winston.log('info', "[ComparerCore.diff]res=" + res.length + "|" + JSON.stringify(res));
    return res;
  };

  this.getKey = function(item, key) {
    var value = '';
    //一个主键
    if (key.indexOf(',') < 0) {
      value = item[key];
      //多主键
    } else {
      var keyArr = key.split(',');
      for (var index = 0; index < keyArr.length; index++) {
        var keyCur = keyArr[index];
        if (index == 0) {
          value = item[keyCur];
        } else {
          value = value + ',' + item[keyCur];
        }
      }
    }

    winston.log('info', "[ComparerCore.getKey]key=" + key + ",value=" + value);
    return value;
  };
};



module.exports = ComparerCore;
