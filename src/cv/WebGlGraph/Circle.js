import * as THREE from './threejs/threejs.min';
import Shaders from './Shaders';
import {select} from 'd3-selection';

class Circle {
    constructor(props) {
        this.scene = props.scene;
        this.pickingScene = props.pickingScene;
        this.scaleFactor = props.scaleFactor || 1;
        this.type = 'circle';
        this.data = {};
        this.luminousData = {
            hoveredIds: [],
            selectedIds: []
        };
        this.pieDataIds = [];
        this.texturesInstance = props.texturesInstance;

        this.initSimple();
        this.initGPUPicking();
        this.initLuminous();
        this.initPie();
    }

    build() {
        let self = this;

        if (this.luminousData.hoveredIds.length || this.luminousData.selectedIds.length) {
            self.buildLuminous(this.scaleFactor);
        } else {
            self.disposeLuminous();
        }

        self.buildSimple(this.scaleFactor);

        if (this.pieDataIds.length > 0) {
            self.buildPie(this.scaleFactor);
        }
    }

    updateTransformUniform(scaleFactor) {
        this.scaleFactor = scaleFactor;

        if (this.mesh && this.mesh.material.uniforms.zoomLevel.value !== scaleFactor) {
            this.mesh.material.uniforms.zoomLevel.value = scaleFactor;
        }

        if (this.pickingMesh) {
            this.pickingMesh.material.uniforms.zoomLevel.value = scaleFactor;
        }

        if (this.luminousMesh && this.luminousMesh.material.uniforms.zoomLevel.value !== scaleFactor) {
            this.luminousMesh.material.uniforms.zoomLevel.value = scaleFactor;
        }

        if (this.pieMesh && this.pieMesh.material.uniforms.zoomLevel.value !== scaleFactor) {
            this.pieMesh.material.uniforms.zoomLevel.value = scaleFactor;
        }
    };

    getData() {
        return this.data;
    }

    setData(data) {
        this.data = data;
    }

    getType() {
        return this.type;
    }

    setLuminousIds(type, ids) {
        if (type === 'hovered') {
            this.luminousData.hoveredIds = ids;
        } else if (type === 'selected') {
            this.luminousData.selectedIds = ids;
        }
    }

    setPie(data) {
        this.pieData = data;
    }


    // PRIVATE METHODS

    initSimple() {
        let uniforms = {
            zoomLevel: {type: 'f', value: this.scaleFactor},
            strokeColor: {type: 'vec3', value: [0, 0, 0]},
            //texture: {type: 'tv', value: textureAtlas.atlas},
            //textureAtlasSize: {type: 'f', value: textureAtlas.atlasSize}
        };

        if (this.texturesInstance) {
            let textureAtlas = this.texturesInstance.getTexturesAtlas();
            uniforms = {
                zoomLevel: {type: 'f', value: this.scaleFactor},
                strokeColor: {type: 'vec3', value: [0, 0, 0]},
                texture: {type: 'tv', value: textureAtlas.atlas},
                textureAtlasSize: {type: 'f', value: textureAtlas.atlasSize}
            }
        }

        this.material = new THREE.RawShaderMaterial({
            uniforms: uniforms,
            vertexShader: Shaders.circleVertexShader(),
            fragmentShader: Shaders.circleFragmentShader(),
            side: THREE.DoubleSide,
            transparent: true
        });

        this.geometry = new THREE.InstancedBufferGeometry()
            .copy(new THREE.CircleBufferGeometry(1, 64, 0, 2 * Math.PI));

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.renderOrder = 3;
        // To prevent circles hiding on big zoom level
        this.mesh.frustumCulled = false;

        this.scene.add(this.mesh);

        return {material: this.material, geometry: this.geometry, mesh: this.mesh};
    };

    initGPUPicking() {
        this.pickingMaterial = new THREE.RawShaderMaterial({
            uniforms: {
                zoomLevel: {type: 'f', value: this.scaleFactor}
            },
            vertexShader: Shaders.circlePickVertexShader(),
            fragmentShader: Shaders.circlePickFragmentShader(),
            side: THREE.DoubleSide,
            transparent: false
        });

        if (this.geometry === undefined) {
            console.warn('Shape geometry should be explicitly defined before picking elements initialization');
        }

        this.pickingMesh = new THREE.Mesh(this.geometry, this.pickingMaterial);
        this.pickingMesh.renderOrder = 2;
        // To prevent circles hiding on big zoom level
        this.pickingMesh.frustumCulled = false;

        this.pickingScene.add(this.pickingMesh);

        return {material: this.pickingMaterial, mesh: this.pickingMesh};
    };

    initLuminous(style) {
        let hoverColor = style && style.hovered && style.hovered.color ? new THREE.Color(style.hovered.color) : new THREE.Color('#33f333');
        let selectedColor = style && style.selected && style.selected.color ? new THREE.Color(style.selected.color) : new THREE.Color('#55c0cc');
        let directShortest =  style && style.direct && style.direct.color ? new THREE.Color(style.direct.color) : new THREE.Color('#ff8c00');
        let reverseShortest = style && style.reverse && style.reverse.color ? new THREE.Color(style.reverse.color) : new THREE.Color('#2878ff');

        this.luminousMaterial = new THREE.RawShaderMaterial({
            uniforms: {
                zoomLevel: {type: 'f', value: this.scaleFactor},
                hoveredColor: {type: 'vec3', value: [hoverColor.r, hoverColor.g, hoverColor.b]},
                selectedColor: {type: 'vec3', value: [selectedColor.r, selectedColor.g, selectedColor.b]},
                directColor: {type: 'vec3', value: [directShortest.r, directShortest.g, directShortest.b]},
                reverseColor: {type: 'vec3', value: [reverseShortest.r, reverseShortest.g, reverseShortest.b]}
            },
            vertexShader: Shaders.circleHoverVertexShader(),
            fragmentShader: Shaders.circleHoverFragmentShader(),
            side: THREE.DoubleSide,
            transparent: true
        });

        this.luminousGeometry = new THREE.InstancedBufferGeometry()
            .copy(new THREE.CircleBufferGeometry(1, 64, 0, 2 * Math.PI));

        this.luminousMesh = new THREE.Mesh(this.luminousGeometry, this.luminousMaterial);
        this.luminousMesh.renderOrder = 2;
        // To prevent circles hiding on big zoom level
        this.luminousMesh.frustumCulled = false;

        this.scene.add(this.luminousMesh);

        return {material: this.luminousMaterial, geometry: this.luminousGeometry, mesh: this.luminousMesh};
    };

    initPie(style) {
        let staticColor = style && style.static && style.static.color ? new THREE.Color(style.static.color) : new THREE.Color('#c8c832');
        let dynamicColor = style && style.dynamic && style.dynamic.color ? new THREE.Color(style.dynamic.color) : new THREE.Color('#506eaa');

        this.pieMaterial = new THREE.RawShaderMaterial({
            uniforms: {
                zoomLevel: {type: 'f', value: this.scaleFactor},
                staticColor: {type: 'vec3', value: [staticColor.r, staticColor.g, staticColor.b]},
                dynamicColor: {type: 'vec3', value: [dynamicColor.r, dynamicColor.g, dynamicColor.b]},
                resolution: { value: new THREE.Vector2( window.innerWidth, window.innerHeight ) },
            },
            vertexShader: Shaders.sectorVertexShader(),
            fragmentShader: Shaders.sectorFragmentShader(),
            side: THREE.DoubleSide,
            transparent: true
        });

        this.pieGeometry = new THREE.InstancedBufferGeometry();
        let positions = [-0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, 0.5, 0, 0.5, 0.5, 0, 0.5, -0.5, 0, -0.5, -0.5, 0];
        let uv = [-0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, -0.5];

        this.pieGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
        this.pieGeometry.addAttribute( 'uv', new THREE.Float32BufferAttribute( uv, 2 ) );

        this.pieMesh = new THREE.Mesh(this.pieGeometry, this.pieMaterial);
        this.pieMesh.renderOrder = 1;
        // To prevent circles hiding on big zoom level
        this.pieMesh.frustumCulled = false;

        this.scene.add(this.pieMesh);

        return {material: this.pieMaterial, geometry: this.pieGeometry, mesh: this.pieMesh};
    };

    disposeSimple() {
        this.scene.remove(this.mesh);
        if(this.mesh.geometry) this.mesh.geometry.dispose();
        if(this.mesh.material) this.mesh.material.dispose();
        if(this.mesh.texture) this.mesh.texture.dispose();

        if (this.pickingScene) {
            this.pickingScene.remove(this.pickingMesh);
            if (this.pickingMesh.geometry) this.pickingMesh.geometry.dispose();
            if (this.pickingMesh.material) this.pickingMesh.material.dispose();
            if (this.pickingMesh.texture) this.pickingMesh.texture.dispose();
        }
    };

    disposeLuminous() {
        if (this.luminousMesh !== undefined && this.luminousMesh !== null) {
            this.scene.remove(this.luminousMesh);
            if (this.luminousMesh.geometry) this.luminousMesh.geometry.dispose();
            if (this.luminousMesh.material) this.luminousMesh.material.dispose();
            if (this.luminousMesh.texture) this.luminousMesh.texture.dispose();
        }

        this.luminousMesh = undefined;
    }

    disposePie() {
        if (this.pieMesh !== undefined && this.pieMesh !== null) {
            this.scene.remove(this.pieMesh);
            if (this.pieMesh.geometry) this.pieMesh.geometry.dispose();
            if (this.pieMesh.material) this.pieMesh.material.dispose();
            if (this.pieMesh.texture) this.pieMesh.texture.dispose();
        }

        this.pieMesh = undefined;
    }

    buildSimple() {
        let data = this.data.geometries;
        let self = this;
        let lPositions = [];
        let lColors = [];
        let radiuses = [];
        let idcolor = new THREE.Color();
        let idcolors = [] /*new Float32Array( vertexGeometries.size * 3 )*/;
        let colorIterator = 0;
        let colorIndex = 0;
        let alphas = [];
        let fixed = [];
        let textureIndexes = [];
        let textureTypes = []; // 0 - mono, 1 - combined
        let circlePosition = new THREE.Vector3();
        let circleColor = new THREE.Color();

        this.pieDataIds = [];

        // Prepare geometries
        for (let item of data) {
            let rgb = idcolor.setHex(colorIndex+1);

            idcolors[colorIterator++] = rgb.r;
            idcolors[colorIterator++] = rgb.g;
            idcolors[colorIterator++] = rgb.b;

            colorIndex++;

            let cPosition = circlePosition.set(item[1].x, -item[1].y, 0);

            lPositions.push(cPosition.x);
            lPositions.push(cPosition.y);
            lPositions.push(cPosition.z);

            radiuses.push(item[1].radius);

            let cColor = circleColor.set(item[1].color);

            lColors.push(cColor.r);
            lColors.push(cColor.g);
            lColors.push(cColor.b);

            alphas.push(item[1].opacity);
            fixed.push(0);

            if (item[1].texture) {
                textureIndexes.push(item[1].texture.id);
                textureTypes.push(0);
            } else {
                textureIndexes.push(99999.0);
                textureTypes.push(99999.0);
            }

            // Add crawled nodes ids
            if (item[1].isBeingCrawled) {
                this.pieDataIds.push(item[1].id);
            }
        }

        if (this.geometry !== null) {
            if (this.geometry.attributes.vertexPos) {
                if (this.geometry.attributes.vertexPos.array.length !== lPositions.length) {
                    self.disposeSimple();
                    self.initSimple(this.scaleFactor);
                    self.initGPUPicking(this.scaleFactor);
                }
            }

            self.geometry.addAttribute('vertexPos', new THREE.InstancedBufferAttribute(new Float32Array(lPositions), 3, true));
            self.geometry.addAttribute('color', new THREE.InstancedBufferAttribute(new Float32Array(lColors), 3, true));
            self.geometry.addAttribute('idcolor', new THREE.InstancedBufferAttribute(new Float32Array(idcolors), 3, true));
            self.geometry.addAttribute('radius', new THREE.InstancedBufferAttribute(new Float32Array(radiuses), 1, true));
            self.geometry.addAttribute('alpha', new THREE.InstancedBufferAttribute(new Float32Array(alphas), 1, true));
            self.geometry.addAttribute('fixedPosition', new THREE.InstancedBufferAttribute(new Float32Array(fixed), 1, true));
            self.geometry.addAttribute('textureIndexes', new THREE.InstancedBufferAttribute(new Float32Array(textureIndexes), 1, true));
            self.geometry.addAttribute('textureTypes', new THREE.InstancedBufferAttribute(new Float32Array(textureTypes), 1, true));
            self.geometry.computeBoundingSphere();
        }
    };

    buildLuminous() {
        let self = this;
        let gHovered = this.luminousData.hoveredIds;
        let gSelected = this.luminousData.selectedIds;
        let positions = [];
        let radiuses = [];
        let position = new THREE.Vector3();
        let blurType = {selected: 0, hovered: 1, direct: 2, reverse: 3};
        let blurTypes = [];
        let setGeometry = (id, type) => {
            let g = this.data.geometries.get(id);

            if (g && g.x && g.y) {
                position.set(g.x, -g.y, 0);
                positions.push(position.x);
                positions.push(position.y);
                positions.push(position.z);
                radiuses.push(g.radius * 1.8);
            }

            if (type === 'selected') blurTypes.push(blurType.selected);
            if (type === 'direct') blurTypes.push(blurType.direct);
            if (type === 'reverse') blurTypes.push(blurType.reverse);
            if (type === 'hovered') blurTypes.push(blurType.hovered);
        };

        if (this.luminousMesh === undefined || this.luminousMesh === null) {
            self.initLuminous(this.scaleFactor);
        }

        if (gSelected.length > 0) {
            gSelected.forEach(id => setGeometry(id, 'selected'));
        }

        if (gHovered.length > 0) {
            gHovered.forEach(id => setGeometry(id, 'hovered'));
        }


        /*for (let item of geometry) {
          let gm = item[1];

          if (gm.x && gm.y && gm.state) {
            position.set(gm.x, -gm.y, 0);
            positions.push(position.x);
            positions.push(position.y);
            positions.push(position.z);
            radiuses.push(gm.radius * 1.8);
          }

          if (gm.state && gm.state.selected) {
            blurTypes.push(blurType.selected);
          } else if (gm.state && gm.state.direct) {
            blurTypes.push(blurType.direct);
          } else if (gm.state && gm.state.reverse) {
            blurTypes.push(blurType.reverse);
          } else if (gm.state && gm.state.hovered) {
            blurTypes.push(blurType.hovered);
          }
        }*/

        if (self.luminousGeometry !== undefined && self.luminousGeometry !== null) {
            self.luminousGeometry.addAttribute('vertexPos', new THREE.InstancedBufferAttribute(new Float32Array(positions), 3, true));
            self.luminousGeometry.addAttribute('radius', new THREE.InstancedBufferAttribute(new Float32Array(radiuses), 1, true));
            self.luminousGeometry.addAttribute('type', new THREE.InstancedBufferAttribute(new Float32Array(blurTypes), 1, true));

            // For proper geometry update
            self.luminousMesh.geometry.dispose();
            self.luminousMesh.geometry = self.luminousGeometry.clone();
        }

    };

    buildPie() {
        let self = this;
        let pieData = this.pieDataIds;
        let data = this.data.geometries;
        let crawledPositions = [];
        let crawledRadiuses = [];
        let crawledAngles = [];
        let circlePosition = new THREE.Vector3();

        if (this.pieMesh === undefined || this.pieMesh === null) {
            self.initPie(this.scaleFactor);
        }

        for (let i = 0; i < pieData.length; i++) {
            let item = data.get(pieData[i]);

            if (item.isBeingCrawled) {
                let cPosition = circlePosition.set(item.x, -item.y, 0);
                let percent = item.crawlPercentageShown ? item.crawlPercentageShown : 0;
                let startAngle = (Math.PI * 1.5) * (180 / Math.PI);
                let endAngle = ((2 * percent / 100 + 1.5) * Math.PI) * (180 / Math.PI);
                let sAngle = 360 - startAngle;
                let eAngle = 360 - endAngle;

                crawledPositions.push(cPosition.x);
                crawledPositions.push(cPosition.y);
                crawledPositions.push(cPosition.z);
                crawledRadiuses.push(item.radius * 4);
                crawledAngles.push(sAngle);
                crawledAngles.push(eAngle);
            }
        }

        /*for (let item of data) {
          if (item[1].isBeingCrawled) {
            let cPosition = circlePosition.set(item[1].x, -item[1].y, 0);
            let percent = item[1].crawlPercentageShown ? item[1].crawlPercentageShown : 0;
            let startAngle = (Math.PI * 1.5) * (180 / Math.PI);
            let endAngle = ((2 * percent / 100 + 1.5) * Math.PI) * (180 / Math.PI);
            let sAngle = 360 - startAngle;
            let eAngle = 360 - endAngle;

            crawledPositions.push(cPosition.x);
            crawledPositions.push(cPosition.y);
            crawledPositions.push(cPosition.z);
            crawledRadiuses.push(item[1].radius * 4);
            crawledAngles.push(sAngle);
            crawledAngles.push(eAngle);
          }
        }*/

        // Crawled item section
        if (this.pieGeometry !== undefined && this.pieGeometry !== null) {
            if (crawledPositions.length > 0) {
                this.pieGeometry.addAttribute('vertexPos', new THREE.InstancedBufferAttribute(new Float32Array(crawledPositions), 3, true));
                this.pieGeometry.addAttribute('radius', new THREE.InstancedBufferAttribute(new Float32Array(crawledRadiuses), 1, true));
                this.pieGeometry.addAttribute('angles', new THREE.InstancedBufferAttribute(new Float32Array(crawledAngles), 2, true));

                // For proper geometry update
                this.pieMesh.geometry.dispose();
                this.pieMesh.geometry = this.pieGeometry.clone();
            } else {
                this.disposePie();
            }
        }

    };

}

export default Circle;
