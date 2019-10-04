
class GraphPanel {
    private _container: HTMLDivElement;
    public constructor(container: HTMLDivElement) {
        this._container = container;
        window.addEventListener('resize', this.onWindowResize, false);
    }

    public onWindowResize(event: Event): void {
        console.log('GraphPanel onWindowResize!');
    }
}

class ToolBar {
    private _container: HTMLDivElement | null;

    public constructor(container: HTMLDivElement) {
        this._container = container;
        window.addEventListener('resize', this.onWindowResize, false);
    }

    public onWindowResize(event: Event): void {
        console.log('ToolBar onWindowResize!');
    }
}

class NaviBar {
    private _container: HTMLDivElement | null;

    public constructor(container: HTMLDivElement) {
        this._container = container;
        window.addEventListener('resize', this.onWindowResize, false);
    }

    public onWindowResize(event: Event): void {
        console.log('NaviBar onWindowResize!');
    }
}

let my_toolbar = new ToolBar(document.getElementById('toolbar') as HTMLDivElement);
let my_navibar = new NaviBar(document.getElementById('navibar') as HTMLDivElement);
let my_graphpanel = new GraphPanel(document.getElementById('graphpanel') as HTMLDivElement);
