import { zoom, zoomIdentity } from 'd3-zoom';
import {select, event as d3Event} from 'd3-selection';

class Zoom {
    constructor(props) {
        let self = this;

        self.layer = props.layer;
        self.canvasLayer = props.canvasLayer;
        //self.elements = props.elements;
        self.callbacks = props.callbacks;
        self.far = 100;
        self.transformD3 = zoomIdentity;
        self.zoomD3 = zoom().scaleExtent([0.1, 8]);
        self.zoomD3.on('start', () => {
            self.zoomHandler(self.transformD3);
            self.callbacks.zoomLabels(self.transformD3);
            select('div.info-tooltip').style('display', 'none');
        }).on('zoom', () => {
            self.zoomHandler(self.transformD3);
            self.callbacks.zoomLabels(self.transformD3);
            select('div.info-tooltip').style('display', 'none');
        }).on('end', () => {
            self.zoomHandler(self.transformD3);
            self.callbacks.zoomLabels(self.transformD3);
        });

        select(self.canvasLayer).call(self.zoomD3);
    }

    zoomHandler(transform) {
        let self = this;
        let scale = transform.k;
        let width = self.layer.renderer.domElement.offsetWidth;
        let height = self.layer.renderer.domElement.offsetHeight;
        let x = -(transform.x - width / 2) / scale;
        let y = (transform.y - height / 2) / scale;
        //let z = getZFromScale(scale);

        let fovHeight = height / transform.k;
        let halfFovRadians = Math.atan(((fovHeight * 0.5) / self.far));
        let halfFov = halfFovRadians * (180 / Math.PI);
        let fullFov = halfFov * 2;

        self.layer.camera.fov = fullFov;
        self.layer.camera.updateProjectionMatrix();
        self.layer.camera.position.set(x, y, self.far);

        self.transformD3 = d3Event.transform;
        self.layer.renderer.render(self.layer.scene, self.layer.camera);
    }

    zoomToPosition(x, y) {
        let self = this;
        let width = self.layer.renderer.domElement.offsetWidth;
        let height = self.layer.renderer.domElement.offsetHeight;
        let far = self.far;

        self.transformD3.x = width / 2 - x * self.transformD3.k;
        self.transformD3.y = height / 2 - y * self.transformD3.k;

        zoomIdentity
            .translate(width / 2 - x * self.transformD3.k, height / 2 - y * self.transformD3.k).scale(self.transformD3.k);

        let fovHeight = height / self.transformD3.k;
        let halfFovRadians = Math.atan(((fovHeight * 0.5) / far));
        let halfFov = halfFovRadians * (180 / Math.PI);
        let fullFov = halfFov * 2;

        self.layer.camera.fov = fullFov;
        self.layer.camera.updateProjectionMatrix();
        self.layer.camera.position.set(x, -y, far);
    };

    zoom(isOut) {
        let self = this;
        let scale;
        let width = self.layer.renderer.domElement.offsetWidth;
        let height = self.layer.renderer.domElement.offsetHeight;
        let far = self.far;

        isOut ? self.transformD3.k *= 0.97 : self.transformD3.k *= 1.03;
        scale = self.transformD3.k;

        let x = -(self.transformD3.x - width / 2) / scale;
        let y = (self.transformD3.y - height / 2) / scale;
        //let z = getZFromScale(scale);

        let fovHeight = height / self.transformD3.k;
        let halfFovRadians = Math.atan(((fovHeight * 0.5) / far));
        let halfFov = halfFovRadians * (180 / Math.PI);
        let fullFov = halfFov * 2;

        self.layer.camera.fov = fullFov;
        self.layer.camera.updateProjectionMatrix();
        self.layer.camera.position.set(x, y, far);
    }

    getTransform() {
        return this.transformD3;
    }

}

export default Zoom;
