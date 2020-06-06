import Layer from './Layer';
import Circle from './Circle';
import Line from './Line';
import Layout from './Layout';
import CanvasElements from './CanvasElements';
import Find from './actions/Find';
import Hover from './actions/Hover';
import Zoom from './actions/Zoom';
import {graphData} from "./GraphData";

class Graph {
    constructor(props) {
        this.container = props.container;
        this.width = props.width;
        this.height = props.height;
        this.layout = new Layout({width: this.width, height: this.height});
        this.canvasElements = new CanvasElements({container: this.container, width: this.width, height: this.height});
        this.circleData = new Map();
        this.lineData = new Map();
        this.texturesData = new Map();

        graphData.nodes.forEach((node, index) => {
            this.circleData.set(node.id, node);
            if (node.texture) {
                this.texturesData.set(node.texture.id, node.texture);
            }
        });

        graphData.edges.forEach((edge, index) => {
            this.lineData.set(edge.id, edge);
        });
    }

    build(texturesInstance) {
        let self = this;
        let container = this.container;
        let width = this.width;
        let height = this.height;
        let layer = this.initLayer(container, width, height);
        let circle = this.initCircle(layer, texturesInstance);
        let line = this.initLine(layer, width, height);

        let renderer = layer.renderer;
        let camera = layer.camera;
        let pickingElements = layer.pickingElements;
        let find = new Find({renderer, camera, pickingElements});
        let elements = {circle: circle};
        let finder = find;
        let canvasLayer = this.canvasElements.getLayer();
        let callbacks = {zoomLabels: transform => self.canvasElements.buildCircleLabels(self.circleData, transform)};
        let zoom = new Zoom({layer, canvasLayer, callbacks});
        let actions = {zoom: zoom, find: finder};
        let hover = new Hover({layer, elements, canvasLayer, actions});
        let simulation = this.layout.getSimulation();

        simulation.alpha(0);
        simulation
            .nodes([...this.circleData.values()])
            .on('tick', () => {
                this.buildCircle(layer, circle, this.circleData);
                this.canvasElements.buildCircleLabels(this.circleData, zoom.getTransform());
                this.buildLine(layer, line, this.lineData);
                layer.renderer.render(layer.scene, layer.camera);
            })
            .on('end', () => {
                this.buildCircle(layer, circle, this.circleData);
                this.canvasElements.buildCircleLabels(this.circleData, zoom.getTransform());
                this.buildLine(layer, line, this.lineData);
                layer.renderer.render(layer.scene, layer.camera);
            });

        simulation
            .force('link')
            .links([...this.lineData.values()]);

        simulation.alpha(0.2).restart();
    }

    initLayer(container, width, height) {
        let layerInstance = new Layer({container, width, height});
        let layer = layerInstance.init();
        let layerPicking = layerInstance.initPickingScenes();

        layer.type = 'webgl';
        layer.subType = 'layer';
        layer.width = width;
        layer.height = height;
        layer.pickingElements = layerPicking;

        return layer;
    };

    initCircle(layer, texturesInstance) {
        let scene = layer.scene;
        let pickingScene = layer.pickingElements.circlesPickingScene;
        let circle = new Circle({scene, pickingScene, texturesInstance});

        return circle;
    }

    initLine(layer, width, height) {
        let scene = layer.scene;
        let pickingScene = layer.pickingElements.linesPickingScene;
        let line = new Line({scene, pickingScene, width, height});

        return line;
    }

    buildCircle(layer, circle, data) {
        let geometry = {};

        geometry.type = 'webgl';
        geometry.subType = 'circle';
        geometry.geometries = data;

        circle.setData(geometry);
        circle.build();

        return circle;
    }

    buildLine(layer, line, data) {
        let geometry = {};

        geometry.type = 'webgl';
        geometry.subType = 'line';
        geometry.geometries = data;

        line.setData(geometry);
        line.build();

        return line;
    }

    getTexturesData() {
        return this.texturesData;
    }
}

export default Graph;
