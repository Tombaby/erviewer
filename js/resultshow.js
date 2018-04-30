const winston = require('winston');

function ResultShow() {
  this.show = function(dom, diffRes, tableName, key, majorField) {
    winston.log('info', "[ResultShow.show]start.");

    if (diffRes == null) {
      return;
    }

    if (diffRes.length == 0) {
      var div = $(
        "<div class='diff_table'><div class='row'><div class='col-md-12 col-lg-12'>表 " +
        tableName + " 无变化</div></div></div>");
      dom.append(div);
      return;
    }

    var div = $("<div class='diff_table'></div>");
    var div_table_info = $("<div class='diff_table_info row'></div>");
    var div_table_name = $("<div class='col-md-3 col-lg-3'></div>");
    div_table_name.append("<label >表名：</label>");
    div_table_name.append("<span>" + tableName + "</span>");
    div_table_info.append(div_table_name);
    var div_key_name = $("<div class='col-md-9 col-lg-9'></div>");
    div_key_name.append("<label>主键名：</label>");
    div_key_name.append("<span>" + key + "</span>");
    div_table_info.append(div_key_name);
    div.append(div_table_info);

    var div_diff_diff_info = $("<div class='diff_diff_info'></div>");

    for (var index = 0; index < diffRes.length; index++) {
      var item = diffRes[index];

      var div_row = $("<div class='row'></div>");
      var diff_header = $("<div class='diff_header'></div>");
      var div_1 = $("<div class='col-md-2 col-lg-1'></div>");
      div_1.append("<label>记录：" + (index + 1) + "</label>");
      diff_header.append(div_1);
      var div_2 = $("<div class='col-md-2 col-lg-1'></div>");
      div_2.append("<label>类型：</label>");
      div_2.append("<span>" + item["type"] + "</span>");
      diff_header.append(div_2);
      div_2 = $("<div class='col-md-8 col-lg-10'></div>");
      div_2.append("<label>主键值：</label>");
      div_2.append("<span>" + item["key"] + "</span>");
      diff_header.append(div_2);
      div_row.append(diff_header);

      var diff_info = $("<div class='diff_info col-md-12 col-lg-12'></div>");
      var diff_info_table = $(
        "<table border='1' class='table table-striped table-bordered table-hover table-condensed'></table>"
      );


      dataStart = item["dataStart"];
      dataEnd = item["dataEnd"];
      var type = item["type"];

      if (type == 'update') {
        var tr_title = $("<tr></tr>");
        tr_title.append("<th>字段名</th>");
        var tr_start = $("<tr></tr>");
        tr_start.append("<th>原值</th>");
        var tr_end = $("<tr></tr>");
        tr_end.append("<th>新值</th>");
        for (var k in dataStart) {
          v_start = dataStart[k];
          v_end = dataEnd[k];

          winston.log('info', "[ResultShow.show]v_start=" + v_start +
            ",v_end=" + v_end);

          if (v_start != v_end) {
            tr_title.append("<th>" + k + "</th>");
            tr_start.append("<td>" + v_start + "</td>");
            tr_end.append("<td>" + v_end + "</td>");
          }
        }
        diff_info_table.append(tr_title);
        diff_info_table.append(tr_start);
        diff_info_table.append(tr_end);
      } else if (type == 'add') {
        var tr_title = $("<tr></tr>");
        tr_title.append("<th>字段名</th>");
        var tr_end = $("<tr></tr>");
        tr_end.append("<th>新值</th>");
        for (var k in dataEnd) {
          if (majorField == null || majorField == '' || majorField.indexOf(k) >=
            0) {
            v_end = dataEnd[k];
            tr_title.append("<th>" + k + "</th>");
            tr_end.append("<td>" + v_end + "</td>");
          }
        }
        diff_info_table.append(tr_title);
        diff_info_table.append(tr_end);
      } else if (type == 'delete') {
        var tr_title = $("<tr></tr>");
        tr_title.append("<th>字段名</th>");
        var tr_start = $("<tr></tr>");
        tr_start.append("<th>原值</th>");
        for (var k in dataStart) {
          if (majorField == null || majorField == '' || majorField.indexOf(k) >=
            0) {
            v_start = dataStart[k];
            tr_title.append("<th>" + k + "</th>");
            tr_start.append("<td>" + v_start + "</td>");
          }
        }
        diff_info_table.append(tr_title);
        diff_info_table.append(tr_start);
      }

      diff_info.append(diff_info_table);
      div_row.append(diff_info);
      div_diff_diff_info.append(div_row);
    }


    div.append(div_diff_diff_info);
    dom.append(div);
  };
};



module.exports = ResultShow;
