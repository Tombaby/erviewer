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
        // styles: { point: [170, 60] },
        canvas: null, //(function(){
        connections: [], //关系集合
        rects: null, // rect集合
        graphs: []
        // maps: [], //顶点和索引的对应关系，为了建立索引关系
        // config: null
    }


    function redrawConnections() {
        var me = Graph, r = me.canvas, connections = me.connections;
        jQuery.each(connections, function (key, value) {
            r.connection(value);
        });
    }

    function calGraphPositions() {
        var lftOffset = 10;
        var wd = jQuery('#nav').css('width');
        var r = wd.match(/^\d+/);
        if (r) lftOffset = parseInt(r[0]) + 10;
        console.log(lftOffset);
        var rgtOffset = 10;
        var me = Graph;
        var cols = Math.floor((me.w - lftOffset - rgtOffset) / 200);
        console.log('cols = ' + cols);
        for (var i = 0, len = me.models.length; i < len; i++) {
            var x = 180 * (i % cols)  + lftOffset;
            var y = (Math.floor(i / cols) + 1) * 50;
            var dn = me.graphs[i] || {};
            var nn = {position: {x: x, y: y}};
            jQuery.extend(dn, nn);
            me.graphs[i] = dn;
            // console.log(me.graphs[i]);
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

    function focusOnGraph(idx) {
        var me = Graph;
        var dom = document.getElementById(me.graphs[idx].domId);
        dom.style.zIndex = me.graphs.length;
        var zidx = me.graphs[idx].zIndex;
        me.graphs[idx].zIndex = me.graphs.length;
        for (var i = 0, l = me.graphs.length; i < l; i++) {
            var el = document.getElementById(me.graphs[i].domId);
            $(el).css('border-color', '#999999');
            if (me.graphs[i].zIndex > zidx) {
                me.graphs[i].zIndex -= 1;
                el.style.zIndex = me.graphs[i].zIndex;
            }
        }
        $(dom).css('border-color', '#ff8989');
    }

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
        me.graphs[index].position.x = x;
        me.graphs[index].position.y = y;
        // me.redrawConnections();
    }

    function drawGraph() {
        calGraphPositions();

        var me = Graph;
        var graphContainer = document.getElementById(me.modelContainerName);
        for (var i = 0, len = me.graphs.length; i < len; i++) {
            var x = me.graphs[i].position.x,   y = me.graphs[i].position.y;
            var zidx = i + 1;

            var divE = document.createElement('div');
            divE.setAttribute('class', 'graph');
            divE.setAttribute('id', 'gdom' + i);
            divE.setAttribute('data-index', i);
            divE.setAttribute('style', 'left:' + x + 'px; top:' + y + 'px;' + 'z-index:'+ zidx + ';');
            var graph_title = '<div class="title">' + me.models[i].name + '</div>';
            var graph_icons = '<div class="icons"><a class="w"><i class="fa fa-window-minimize"></i></a></div>';
            var graph_body = drawGraphDom(me.models[i]);
            divE.innerHTML = '<div class="head">' + graph_title + graph_icons + '</div><div class="content">' + graph_body + '</div>';
            graphContainer.appendChild(divE);
            me.graphs[i].domId = divE.getAttribute('id');
            me.graphs[i].zIndex = zidx;

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

            jQuery(elm).find('div.content').first().hide();
            jQuery(elm).find('div.icons a.w').each((i, n) => {
                $(n).click(function(event) {
                    var icn = $(this).children('i').first();
                    if (icn.hasClass('fa fa-window-maximize')) {
                        icn.removeClass('fa fa-window-maximize');
                        icn.addClass('fa fa-window-minimize');
                        // console.log($(this).parent().parent().parent().children().last());
                        icn.parent().parent().parent().parent().children().last().hide();
                    } else {
                        icn.removeClass('fa fa-window-minimize');
                        icn.addClass('fa fa-window-maximize');
                        // console.log($(this).parent().parent().parent().children().last()); 
                        icn.parent().parent().parent().parent().children().last().show();
                    }
                });
            });

            jQuery(elm).mousedown(function(event){
                var idx = parseInt($(this).attr('data-index'));
                focusOnGraph(idx);
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
            me.graphs[i].rectId = rect.id;
        }
    }

    Graph.drawModels = function (models, canvasName, modelContainerName) {
        var me = Graph;
        me.models = models;
        me.canvasName = canvasName;
        me.modelContainerName = modelContainerName;
        me.w = util.page.getViewWidth();
        me.h = util.page.getViewHeight();
        me.canvas = Raphael(canvasName, me.w, me.h);
        // console.log($('#' + canvasName).css('width'));
        me.rects = me.canvas.set();
        me.graphs = [];

        drawGraph();
    }

    Graph.showAllGraphs = function(st) {
        var me = Graph;
        if (st) {
            me.graphs.forEach(element => {
                var ob = $('#' + element.domId);
                ob.show();
                var icn = ob.find('div.icons a.v').first().children('i').first();
                if (icn) {
                    icn.removeClass();
                    icn.addClass('fa fa-eye-slash');
                }
            });
        } else {
            me.graphs.forEach(element => {
                var ob = $('#' + element.domId);
                ob.hide();
                var icn = ob.find('div.icons a.v').first().children('i').first();
                if (icn) {
                    icn.removeClass();
                    icn.addClass('fa fa-eye');
                }
            });
        }
    }

    Graph.focusGraph = function(graphNm) {
        var me = Graph;
        for(var i = 0,  ln = me.models.length; i < ln; i++) {
            if (me.models[i].name == graphNm) {
                $('#' + me.graphs[i].domId).show();
                focusOnGraph(i); 
                break;
            }
        }
    }

    Graph.hideGraph = function(graphNm) {
        var me = Graph;
        for(var i = 0,  ln = me.models.length; i < ln; i++) {
            if (me.models[i].name == graphNm) {
                var o = $('#' + me.graphs[i].domId);
                o.hide();
                o.css('border-color', '#999999');
                break;
            }
        }
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
            var elm = document.getElementById(me.graphs[i].domId);
            elm.style.left = x + 'px';
            elm.style.top = y + 'px';
            me.rects[i].attr({x: x, y: y});
        }
    }

    Graph.maxAllGraphs = function(st) {
        $('#graph div.graph').each((i, n) => {
            var icn = $(n).find('div.icons a.w').first().children('i').first();
            if (st) {
                icn.removeClass('fa fa-window-minimize');
                icn.addClass('fa fa-window-maximize');
                // console.log($(this).parent().parent().parent().children().last());
                icn.parent().parent().parent().parent().children().last().show();
            } else {
                icn.removeClass('fa fa-window-maximize');
                icn.addClass('fa fa-window-minimize');
                // console.log($(this).parent().parent().parent().children().last()); 
                icn.parent().parent().parent().parent().children().last().hide();
            } 
        });
    }

    // Graph.handlerMove = function (target) {
    //     var me = Graph;
    //     var x = parseInt(target.style.left, 10);
    //     var y = parseInt(target.style.top, 10);

    //     if (Math.abs(x - me.ox) < 5 && Math.abs(y - me.oy) < 5) {
    //         return;
    //     }

    //     var att = {x: x, y: y};
    //     //var id = T.dom.getAttr(target,'data-id');
    //     var id = $(target).attr("data-id");
    //     var rect = me.canvas.getById(id);
    //     rect.attr(att);
    //     me.redrawConnections();
    //     // me.r.safari();
    // }

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

    



    // $(function(){
    //     Graph.showGraph();
    // });


}(window));