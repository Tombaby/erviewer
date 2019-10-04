"use strict";
var GraphPanel = /** @class */ (function () {
    function GraphPanel(container) {
        this._container = container;
        window.addEventListener('resize', this.onWindowResize, false);
    }
    GraphPanel.prototype.onWindowResize = function (event) {
        console.log('GraphPanel onWindowResize!');
    };
    return GraphPanel;
}());
var ToolBar = /** @class */ (function () {
    function ToolBar(container) {
        this._container = container;
        window.addEventListener('resize', this.onWindowResize, false);
    }
    ToolBar.prototype.onWindowResize = function (event) {
        console.log('ToolBar onWindowResize!');
    };
    return ToolBar;
}());
var NaviBar = /** @class */ (function () {
    function NaviBar(container) {
        this._container = container;
        window.addEventListener('resize', this.onWindowResize, false);
    }
    NaviBar.prototype.onWindowResize = function (event) {
        console.log('NaviBar onWindowResize!');
    };
    return NaviBar;
}());
var my_toolbar = new ToolBar(document.getElementById('toolbar'));
var my_navibar = new NaviBar(document.getElementById('navibar'));
var my_graphpanel = new GraphPanel(document.getElementById('graphpanel'));
