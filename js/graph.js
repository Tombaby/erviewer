(function (win) {

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


    var Graph = Graph || {};

    Graph = {
        w: 960,
        h: 480,
        styles: {
            point: [170, 60]
        },
        canvas: null, //(function(){
        connections: [], //关系集合
        rects: null, // rect集合
        maps: [], //顶点和索引的对应关系，为了建立索引关系
        config: null
    }


    function redrawConnections() {
        var me = Graph,
            r = me.canvas,
            connections = me.connections;
        jQuery.each(connections, function (key, value) {
            r.connection(value);
        });
    }

    function calGraphPositions() {
        var me = Graph;
        var models = me.models;
        var graphs = me.graphs;
        var cols = Math.floor((me.w - 80) / 200);

        for (var i = 0, len = models.length; i < len; i++) {
            var x = 220 * (i % cols) + 40;
            var y = (Math.floor(i / cols) + 1) * 50;
            var graph = {
                position: {
                    x: x,
                    y: y
                }
            }
            graphs[i] = graph;
        }
    }

    function drawGraphDom(model) {
        var dom = '<table>';
        model.fields.forEach(fld => {
            dom += '<tr><td>'+ fld.name +'</td><td>'+fld.type+'</td><td>'+fld.null+'</td><td>'+fld.default+'</td><td>'+fld.extra+'</td><td>'+fld.comment+'</td></tr>'
        });
        dom += '</table>'
        return dom;
    }

    function drawGraph() {
        function dragHandler(target) {
            var me = Graph;
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
            var index = target.getAttribute('data-index');
            var rect = me.canvas.getById('rect' + index);
            rect.attr(att);
            // me.redrawConnections();
        }

        calGraphPositions();

        var me = Graph;
        var graphContainer = document.getElementById(me.graphContainerName);
        for (var i = 0, len = me.graphs.length; i < len; i++) {
            var x = me.graphs[i].position.x,
                y = me.graphs[i].position.y;

            var divE = document.createElement('div');
            divE.setAttribute('class', 'graph');
            divE.setAttribute('id', 'div' + i);
            divE.setAttribute('data-index', i);
            divE.setAttribute('style', 'left:' + x + 'px; top:' + y + 'px;' + 'z-index:'+ i + ';');
            divE.innerHTML = '<div class="title">' + me.models[i].name + '</div><div class="content">' + drawGraphDom(me.models[i]) + '</div>';
            graphContainer.appendChild(divE);
            me.graphs[i].domId = divE.getAttribute('id');

            var elm = document.getElementById(me.graphs[i].domId);
            jQuery(elm).draggable({
                cursor: "move",
                start: function () {
                    this.style.zIndex = 1000 + parseInt(this.style.zIndex);
                    dragHandler(elm);
                },
                drag: function () {
                    dragHandler(elm);
                },
                stop: function() {
                    this.style.zIndex = parseInt(this.style.zIndex) - 1000;
                }
            });

            var w = elm.getAttribute('width');
            var h = elm.getAttribute('height');
            var rect = me.canvas.rect(x, y, w, h);
            rect.id = 'rect' + i;
            rect.attr({
                fill: '#ccc',
                "fill-opacity": 0,
                "stroke-width": 1,
                'stroke-opacity': 0,
                cursor: "move"
            });
            me.rects[i] = rect;
        }
    }

    Graph.drawModels = function (models, canvasName, graphContainerName) {
        var me = Graph;
        me.models = models;
        me.canvasName = canvasName;
        me.graphContainerName = graphContainerName;
        me.w = util.page.getViewWidth();
        me.h = util.page.getViewHeight();
        me.canvas = Raphael(canvasName, me.w, me.h);
        me.rects = me.canvas.set();
        me.graphs = [];

        drawGraph();
    }

    Graph.resize = function (width, height) {
        var me = Graph;
        me.w = width;
        me.h = height;
        // console.log(me.w, me.h);
        me.canvas.setSize(me.w, me.h);
    }

    Graph.redrawGraph = function() {
        var me = Graph;
        calGraphPositions();
        for(var i = 0; i < me.graphs.length; i++){
            var x = me.graphs[i].position.x, y = me.graphs[i].position.y;
            var elm = document.getElementById('div' + i);
            elm.style.left = x + 'px';
            elm.style.top = y + 'px';
            me.rects[i].attr({x: x, y: y});
        }
    }

    window.Graph = Graph;

    window.onresize = function (event) {
        // console.log('aaa');
        var svg = document.getElementsByTagName("svg")[0]
        if (svg) {
            Graph.resize(window.innerWidth, window.innerHeight)
            Graph.redrawGraph();
        }
    }

    window.onscroll = function (event) {
        // this.console.log('bbb');
        var svg = document.getElementsByTagName("svg")[0]
        if (svg) {
            Graph.resize(document.body.scrollWidth, document.body.scrollHeight);
        }
    }


    // Graph.renderGraph = function() {
    //     var position_data = GraphPosition();
    //     var rectsData = position_data.data.states;
    //     var connectionData = position_data.data.relations;
    //     $.each(rectsData, function(i, rect){
    //         Graph.createGraph(i, rect);
    //     });

    //     Graph.renderConnections(connectionData);
    // }


    // Graph.createGraph = function (i, graph) {
    //     var me = Graph;
    //     var template = "";
    //     graph.index = i;
    //     // x, y 需要详看
    //     var x, y;
    //     if (graph.xCoordinate) {
    //         x = graph.xCoordinate;
    //     } else {
    //         x = ((i % num) + 0.2) * cellW;
    //     }
    //     if (graph.yCoordinate) {
    //         y = graph.yCoordinate;
    //     } else {
    //         y = 20 + (~~(i / num) * cellH);
    //     }

    //     graph.x = x;
    //     graph.y = y;

    //     var templateA = $("#T-graph").html();
    //     var temp0 = _.template(templateA);
    //     var temp = temp0({"data": graph});

    //     // render svg rect
    //     var stateR = me.canvas.rect(0, 0, me.styles.point[0], me.styles.point[1]);

    //     stateR.id = graph.id;
    //     stateR.attr({ x: x, y: y }); // 给rect 位置

    //     stateR.attr({
    //         fill: '#ccc',
    //         "fill-opacity": 0,
    //         "stroke-width": 1,
    //         'stroke-opacity': 0,
    //         cursor: "move"
    //     });

    //     $("#graph").append(temp);
    //     var graphDom = $(".graph").eq(i);
    //     var width = graphDom.width();
    //     width = parseInt(width, 10) + 10 + 32 + 5;
    //     width = width < 150 ? 150 : width;
    //     graphDom.width(width);

    //     stateR.attr({ width: width });

    //     me.rects.push(stateR);
    //     me.maps[graph.id] = i;

    //     graphDom.draggable({
    //         cursor: "move",
    //         start: function () {
    //             Graph.handlerMove(graphDom[0]);
    //         },
    //         drag: function () {
    //             Graph.handlerMove(graphDom[0]);
    //         }
    //     });
    // }

    // Graph.showGraph = function () {
    //     var me = Graph;
    //     me.w = util.page.getViewWidth();
    //     me.h = util.page.getViewHeight();
    //     me.canvas = Raphael("canvas", me.w, me.h);
    //     me.rects = me.canvas.set();
    //     var w = me.w, h = me.h;
    //     var cellW = 240;
    //     var cellH = 120;
    //     var num = Math.floor(w / cellW);
    //     Graph.renderGraph();
    // }

    // Graph.renderConnections = function (lines) {
    //     var me = Graph;

    //     $.each(lines, function (key, value) {
    //         var from = value.fromStateId;
    //         var to = value.toStateID;
    //         var r = me.canvas;
    //         var rects = me.rects,
    //             maps = me.maps;

    //         // [maps[from]] rects[maps[to]] 是索引值
    //         me.connections.push(r.connection(rects[maps[from]], rects[maps[to]], '#4848fe'));
    //     });
    // }

    // Graph.redrawConnections = function () {
    //     var me = Graph, r = me.canvas, connections = me.connections;
    //     $.each(connections, function (key, value) {
    //         r.connection(value);
    //     });
    // }

    Graph.handlerMove = function (target) {
        var me = Graph;

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
        var rect = me.canvas.getById(id);
        rect.attr(att);
        me.redrawConnections();
        // me.r.safari();
    }



    // $(function(){
    //     Graph.showGraph();
    // });


}(window));