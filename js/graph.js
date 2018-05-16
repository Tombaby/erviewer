
var util = util || {};
util.page = util.page || {};

util.page.getViewWidth = function () {
    var w1 = document.compatMode == 'BackCompat' ? document.body.scrollWidth : document.documentElement.scrollWidth;
    var w2 = document.compatMode == 'BackCompat' ? document.body.clientWidth : document.documentElement.clientWidth;
    var w3 = window.innerWidth;
    return Math.max(w1, w2, w3);
};

util.page.getViewHeight = function () {
    var h1 = document.compatMode == 'BackCompat' ? document.body.scrollHeight : document.documentElement.scrollHeight;
    var h2 = document.compatMode == 'BackCompat' ? document.body.clientHeight : document.documentElement.clientHeight;
    var h3 = window.innerHeight;
    return Math.max(h1, h2, h3);
};

var test = test || {};

test = {
    w: 960,
    h: 480,
    styles: {
        point: [170, 60]
    },
    r: null, //(function(){
    connections: [], //关系集合
    graphs: null, // rect集合
    maps: [], //顶点和索引的对应关系，为了建立索引关系

    config: null
}

test.showGraph = function () {
    var me = test,
        w = util.page.getViewWidth(),
        h = util.page.getViewHeight();

    me.w = w - 80;
    me.h = h - 30;
    me.r = Raphael("canvas", me.w, me.h);
    me.graphs = me.r.set();
    var w = me.w,
        h = me.h;

    var cellW = 240;
    var cellH = 120;
    var num = Math.floor(w / cellW);
    test.renderGraph();
}

test.renderConnections = function (lines) {
    var me = test;

    $.each(lines, function (key, value) {
        var from = value.fromStateId;
        var to = value.toStateID;
        var r = me.r;
        var graphs = me.graphs,
            maps = me.maps;

        // [maps[from]] graphs[maps[to]] 是索引值
        me.connections.push(r.connection(graphs[maps[from]], graphs[maps[to]], '#4848fe'));
    });
}

test.redrawConnections = function () {
    var me = test, r = me.r, connections = me.connections;
    $.each(connections, function (key, value) {
        r.connection(value);
    });
}

test.handlerMove = function (target) {
    var me = test;

    var x = parseInt(target.style.left, 10);
    var y = parseInt(target.style.top, 10);

    if (Math.abs(x - me.ox) < 5 && Math.abs(y - me.oy) < 5) {
        return;
    }

    var att = {
        x: x,
        y: y
    };

    //var id = T.dom.getAttr(target,'data-id');
    var id = $(target).attr("data-id");
    var rect = me.r.getById(id);
    rect.attr(att);
    me.redrawConnections();
    // me.r.safari();
}

test.createGraph = function (i, graph) {
    var me = test;
    var template = "";
    graph.index = i;
    // x, y 需要详看
    var x, y;
    if (graph.xCoordinate) {
        x = graph.xCoordinate;
    } else {
        x = ((i % num) + 0.2) * cellW;
    }
    if (graph.yCoordinate) {
        y = graph.yCoordinate;
    } else {
        y = 20 + (~~(i / num) * cellH);
    }

    graph.x = x;
    graph.y = y;

    var templateA = $("#T-graph").html();
    var temp0 = _.template(templateA);
    var temp = temp0({"data": graph});

    // render svg rect
    var stateR = me.r.rect(0, 0, me.styles.point[0], me.styles.point[1]);

    stateR.id = graph.id;
    stateR.attr({
        x: x,
        y: y
    }); // 给rect 位置

    stateR.attr({
        fill: '#ccc',
        "fill-opacity": 0,
        "stroke-width": 1,
        'stroke-opacity': 0,
        cursor: "move"
    });

    $("#graph").append(temp);
    var graphDom = $(".graph").eq(i);
    var width = graphDom.width();
    width = parseInt(width, 10) + 10 + 32 + 5;
    width = width < 150 ? 150 : width;
    graphDom.width(width);

    stateR.attr({
        width: width
    });

    me.graphs.push(stateR);
    me.maps[graph.id] = i;

    graphDom.draggable({
        cursor: "move",
        start: function () {
            test.handlerMove(graphDom[0]);
        },
        drag: function () {
            test.handlerMove(graphDom[0]);
        }
    });
}

test.renderGraph = function() {
    var position_data = GraphPosition();
    var graphsData = position_data.data.states;
    var connectionData = position_data.data.relations;

    $.each(graphsData, function(i, graph){
        test.createGraph(i, graph);
    });

    test.renderConnections(connectionData);
}

$(function () {
    test.showGraph();
});