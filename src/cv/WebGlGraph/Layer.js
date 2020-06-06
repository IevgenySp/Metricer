import * as THREE from './threejs/threejs.min';
import { zoomIdentity } from 'd3-zoom';

class Layer {
    constructor(props) {
        this.container = props.container;
        this.width = props.width;
        this.height = props.height;
    }

    // PUBLIC METHODS

    init() {
        /**
         * fov — Camera frustum vertical field of view.
         * aspect — Camera frustum aspect ratio.
         * near — Camera frustum near plane.
         * far — Camera frustum far plane.
         */
        let fov = 40;
        let aspect = this.width / this.height;
        let near = 10;
        let far = 100;

        let transformD3 = zoomIdentity;
        let camera, scene, renderer;

        let fovHeight = this.height / transformD3.k;
        let halfFovRadians = Math.atan(((fovHeight * 0.5) / far));
        let halfFov = halfFovRadians * (180 / Math.PI);
        let fullFov = halfFov * 2;

        fov = fullFov;

        camera = new THREE.PerspectiveCamera(fov, aspect, near, far + 1);
        camera.position.set(this.width / 2, -(this.height / 2), far);

        scene = new THREE.Scene();

        renderer = new THREE.WebGLRenderer({alpha: true});
        renderer.setSize(this.width, this.height);

        let devicePixelRatio = window.devicePixelRatio;

        renderer.setPixelRatio(devicePixelRatio);
        renderer.setSize(this.width, this.height);

        this.container.appendChild(renderer.domElement);

        return {fov, aspect, near, far, camera, scene, renderer, container: this.container};
    };

    initPickingScenes() {
        let width = this.width;
        let height = this.height;
        let circlesPickingScene, linesPickingScene, arrowsPickingScene,
            pickingCircleTexture, pickingLineTexture, pickingArrowTexture;

        circlesPickingScene = new THREE.Scene();
        linesPickingScene = new THREE.Scene();
        arrowsPickingScene = new THREE.Scene();

        pickingCircleTexture = new THREE.WebGLRenderTarget(width, height);
        pickingCircleTexture.texture.minFilter = THREE.LinearFilter;
        pickingLineTexture = new THREE.WebGLRenderTarget(width, height);
        pickingLineTexture.texture.minFilter = THREE.LinearFilter;
        pickingArrowTexture = new THREE.WebGLRenderTarget(width, height);
        pickingArrowTexture.texture.minFilter = THREE.LinearFilter;

        return {
            circlesPickingScene, linesPickingScene, arrowsPickingScene,
            pickingCircleTexture, pickingLineTexture, pickingArrowTexture
        }
    };

    // PRIVATE METHODS

    dispose(options) {
        if (options.scene) {
            this.clearTree(options.scene);
        }

        if (options.container && options.renderer) {
            options.container.removeChild(options.renderer.domElement);
        }

        if (options.renderer) {
            options.renderer.renderLists.dispose();
            options.renderer.clear(true, true, true);
            options.renderer.dispose();
        }

        if (options.camera) {
            options.camera.clearViewOffset();
        }
    };

    clearTree(obj) {
        if (obj === undefined) {
            return;
        }

        while(obj.children.length > 0){
            clearTree(obj.children[0]);
            obj.remove(obj.children[0]);
        }
        if(obj.geometry) obj.geometry.dispose();
        if(obj.material) obj.material.dispose();
        if(obj.texture) obj.texture.dispose();
    };
}

export default Layer;
