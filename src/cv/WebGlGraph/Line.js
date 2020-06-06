import * as THREE from './threejs/threejs.min';
import Shaders from './Shaders';

class Line {
    constructor(props) {
        this.scene = props.scene;
        this.pickingScene = props.pickingScene;
        this.scaleFactor = props.scaleFactor || 1;
        this.width = props.width;
        this.height = props.height;
        this.type = 'line';
        this.data = {};
        this.arrows = new Map();

        this.initSimple();
        this.initGPUPicking();
    }

    // PUBLIC METHODS

    build() {
        this.buildSimple();
    }

    updateTransformUniform(scaleFactor) {
        this.scaleFactor = scaleFactor;

        if (this.mesh && this.mesh.material.uniforms.scaleFactor.value !== scaleFactor) {
            this.mesh.material.uniforms.scaleFactor.value = scaleFactor;
        }

        if (this.pickingMesh) {
            this.pickingMesh.material.uniforms.scaleFactor.value = scaleFactor;
        }
    };

    getData() {
        return this.data;
    }

    setData(data) {
        this.data = data;
    }

    getArrows() {
        return this.arrows;
    }

    getType() {
        return this.type;
    }

    // PRIVATE METHODS

    initSimple() {
        let width = this.width ? this.width : window.innerWidth;
        let height = this.height ? this.height : window.innerHeight;

        THREE.UniformsLib.line = {
            linewidth: { value: 1 },
            resolution: { value: new THREE.Vector2( width, height ) },
            dashScale: { value: 1 },
            dashSize: { value: 1 },
            gapSize: { value: 1 }, // todo FIX - maybe change to totalSize
            opacity: { value: 1}
        };

        let lineUniforms = THREE.UniformsUtils.merge( [
            THREE.UniformsLib.common,
            THREE.UniformsLib.fog,
            THREE.UniformsLib.line
        ]);

        lineUniforms.scaleFactor = {type: 'f', value: this.scaleFactor};
        lineUniforms.gpuPick = {type: 'f', value: 0.0};
        lineUniforms.pixelRatio = {type: 'f', value: window.devicePixelRatio};

        //lineMaterial = new THREE.ShaderMaterial({ // Not work with #extension GL_OES_standard_derivatives : enable
        this.material = new THREE.RawShaderMaterial({
            uniforms: lineUniforms,
            vertexShader: Shaders.lineVertexShader(),
            fragmentShader: Shaders.lineFragmentShader(),
            vertexColors: THREE.VertexColors,
            side: THREE.DoubleSide,
            transparent: true,
            //blending: THREE.CustomBlending,
            //blendEquation: THREE.AddEquation, //THREE.MaxEquation, //default
            //blendSrc: THREE.SrcAlphaFactor, //THREE.SrcColorFactor, //default
            //blendSrcAlpha: THREE.OneFactor, //THREE.OneFactor,
            //blendDst: THREE.OneMinusSrcAlphaFactor, //THREE.DstColorFactor, //default
            //depthWrite: false
        });

        this.geometry = new THREE.InstancedBufferGeometry();

        // Geometry positions for quad
        // https://www.tutorialspoint.com/webgl/webgl_drawing_a_quad.htm
        let positions = [
            -0.5,0.5,0.0,
            -0.5,-0.5,0.0,
            0.5,-0.5,0.0,
            0.5,0.5,0.0
        ];

        // Quad barycentric coordinates
        // https://stackoverflow.com/questions/24839857/wireframe-shader-issue-with-barycentric-coordinates-when-using-shared-vertices
        let uqc = [
            0,0,0,1,1,1,1,0,
            //0,1,0,0,1,0,1,1
            //1,1,0,1,0,0,1,0
        ];
        // Quad vertices indices
        let index = [3,2,1,3,1,0];

        this.geometry.setIndex( index );
        this.geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
        this.geometry.addAttribute( 'uqc', new THREE.Float32BufferAttribute( uqc, 2 ) );

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.renderOrder = 0;
        this.mesh.frustumCulled = false;

        this.scene.add(this.mesh);

        return {material: this.material, geometry: this.geometry, mesh: this.mesh};
    };

    initGPUPicking() {
        let linePickUniforms = THREE.UniformsUtils.merge( [
            THREE.UniformsLib.common,
            THREE.UniformsLib.fog,
            THREE.UniformsLib.line
        ]);

        linePickUniforms.scaleFactor = {type: 'f', value: this.scaleFactor};
        linePickUniforms.gpuPick = {type: 'f', value: 1.0};

        this.pickingMaterial = new THREE.ShaderMaterial({
            uniforms: linePickUniforms,
            vertexShader: Shaders.linePickVertexShader(),
            fragmentShader: Shaders.linePickFragmentShader(),
            vertexColors: THREE.VertexColors,
            side: THREE.DoubleSide,
            transparent: true,
            //blending: THREE.CustomBlending,
            //blendEquation: THREE.AddEquation, //THREE.MaxEquation, //default
            //blendSrc: THREE.SrcAlphaFactor, //THREE.SrcColorFactor, //default
            //blendSrcAlpha: THREE.OneFactor, //THREE.OneFactor,
            //blendDst: THREE.OneMinusSrcAlphaFactor //THREE.DstColorFactor, //default
            //depthWrite: false
        });

        this.pickingMesh = new THREE.Mesh(this.geometry, this.pickingMaterial);
        this.pickingMesh.renderOrder = 0;
        this.pickingMesh.frustumCulled = false;

        this.pickingScene.add(this.pickingMesh);

        return {material: this.pickingMaterial, mesh: this.pickingMesh};
    }

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

    buildSimple() {
        let self = this;
        let data = this.data.geometries;
        let idcolor = new THREE.Color();
        let colorIndex = 0;
        let size = data.size;
        let positions = new Array(size * 6);
        let colors = new Array(size * 3);
        let alphas = new Array(size);
        let widths = new Array(size);
        let idColors = new Array(size * 3);
        let lineColor = new THREE.Color();
        let bufferedColors = {};
        let lineXPosition = new THREE.Vector3();
        let lineYPosition = new THREE.Vector3();
        let counter = 0;
        let colorCounter = 0;
        let styleCounter = 0;
        let idColorCounter = 0;
        // Id's needed to be passed in shader to identify whether arrow is present
        // to remain line side aliased for proper connection with arrow
        // Head coef is 2 and tail coef is 3
        // This way is more performant than creation of new variable and passing it to the shader
        let headLineId = 0;
        let tailLineId = 0;

        for (let item of data) {
            let lineCoords;
            let arrows = {
                leftArrow: item[1].leftArrow,
                rightArrow: item[1].rightArrow,
                arrowLength: 8
            };

            lineCoords = item[1].source && item[1].target ?
                this.getLineCoordinates(item[1].source, item[1].target, arrows, this.scaleFactor) :
                this.getLineCoordinates(
                    {x: item[1].x0, y: item[1].y0, radius: 0},
                    {x: item[1].x1, y: item[1].y1, radius: 0}, arrows, this.scaleFactor);

            let xPosition;
            let yPosition;

            if (typeof lineCoords === 'undefined') {
                lineCoords = {};
                lineCoords.sx = lineCoords.sy = lineCoords.qx = lineCoords.qy = 0;

                xPosition = lineXPosition.set(lineCoords.sx, -lineCoords.sy, 0);
                yPosition = lineYPosition.set(lineCoords.qx, -lineCoords.qy, 0);
            } else {
                if (lineCoords.xLeftHead !== undefined && lineCoords.yLeftHead !== undefined &&
                    lineCoords.xRightHead !== undefined && lineCoords.yRightHead !== undefined) {
                    this.arrows.set((item[1].id || item[0]) + '_right', {
                        id: item[1].id || item[0],
                        type: 'webgl',
                        subType: 'arrow',
                        v0x: lineCoords.xLeftHead,
                        v0y: lineCoords.yLeftHead,
                        v1x: lineCoords.sx,
                        v1y: lineCoords.sy,
                        v2x: lineCoords.xRightHead,
                        v2y: lineCoords.yRightHead,
                        xAngle: lineCoords.xDirectAngle,
                        yAngle: lineCoords.yDirectAngle,
                        width: item[1].width,
                        color: item[1].color,
                        opacity: item[1].opacity
                    });

                    let d = Math.sqrt(Math.pow((lineCoords.qx - lineCoords.sx), 2) + Math.pow((lineCoords.qy - lineCoords.sy), 2));
                    //let xDist = item[1].width < 4 ? 4 * 1.5 : item[1].width * 1.5;
                    let xDist = item[1].width * 1.5;
                    let yDist = xDist * 2;
                    let t = yDist / d;
                    let x = (1 - t) * lineCoords.sx + t * lineCoords.qx;
                    let y = (1 - t) * lineCoords.sy + t * lineCoords.qy;

                    xPosition = lineXPosition.set(x, -y, 0);
                    headLineId = 2;
                } else {
                    xPosition = {x: lineCoords.sx, y: -lineCoords.sy, z: 0};
                    headLineId = 0;
                }

                if (lineCoords.xLeftTail !== undefined && lineCoords.yLeftTail !== undefined &&
                    lineCoords.xRightTail !== undefined && lineCoords.yRightTail !== undefined) {

                    //let xDist = item[1].width < 4 ? 4 * 1.5 : item[1].width * 1.5;
                    let xDist = item[1].width * 1.5;
                    let yDist = xDist * 2;

                    this.arrows.set((item[1].id || item[0]) + '_left', {
                        id: item[1].id || item[0],
                        type: 'webgl',
                        subType: 'arrow',
                        v0x: lineCoords.xLeftTail,
                        v0y: lineCoords.yLeftTail,
                        v1x: lineCoords.qx,
                        v1y: lineCoords.qy,
                        v2x: lineCoords.xRightTail,
                        v2y: lineCoords.yRightTail,
                        xAngle: lineCoords.xReverseAngle,
                        yAngle: lineCoords.yReverseAngle,
                        width: item[1].width,
                        color: item[1].color,
                        opacity: item[1].opacity
                    });

                    let d = Math.sqrt(Math.pow((lineCoords.sx - lineCoords.qx), 2) + Math.pow((lineCoords.sy - lineCoords.qy), 2));
                    let t = yDist / d;
                    let x = (1 - t) * lineCoords.qx + t * lineCoords.sx;
                    let y = (1 - t) * lineCoords.qy + t * lineCoords.sy;

                    yPosition = lineYPosition.set(x, -y, 0);

                    tailLineId = 3;
                } else {
                    yPosition = {x: lineCoords.qx, y: -lineCoords.qy, z: 0};
                    tailLineId = 0;
                }

            }

            //positions.push(xPosition.x, xPosition.y, xPosition.z, yPosition.x, yPosition.y, yPosition.z);
            positions[counter++] = xPosition.x;
            positions[counter++] = xPosition.y;
            positions[counter++] = xPosition.z;
            positions[counter++] = yPosition.x;
            positions[counter++] = yPosition.y;
            positions[counter++] = yPosition.z;

            let itemColor = item[1].color;
            let sColor;

            if (!bufferedColors[itemColor]) {
                sColor = lineColor.set(item[1].color);
                bufferedColors[itemColor] = sColor;
            } else {
                sColor = bufferedColors[itemColor];
            }

            colors[colorCounter] = sColor.r;
            colorCounter++;
            colors[colorCounter] = sColor.g;
            colorCounter++;
            colors[colorCounter] = sColor.b;
            colorCounter++;

            // Add aliasing indicators to opacity
            alphas[styleCounter] = item[1].opacity + headLineId + tailLineId;
            widths[styleCounter] = item[1].width;
            styleCounter++;

            let rgb = idcolor.setHex(colorIndex + 1);

            //idColors.push(rgb.r, rgb.g, rgb.b);
            idColors[idColorCounter] = rgb.r;
            idColorCounter++;
            idColors[idColorCounter] = rgb.g;
            idColorCounter++;
            idColors[idColorCounter] = rgb.b;
            idColorCounter++;
            colorIndex++;
        }

        if (this.geometry !== null) {
            if (this.geometry.attributes.instanceStart) {
                if (this.geometry.attributes.instanceStart.array.length !== positions.length) {
                    self.disposeSimple();
                    self.initSimple();
                }
            }

            let instanceDistanceBuffer = new THREE.InstancedInterleavedBuffer( new Float32Array(positions), 6, 1 ); // d0, d1
            let instanceColorBuffer = new THREE.InstancedInterleavedBuffer( new Float32Array(colors), 3, 1 );
            let instanceAlphaBuffer = new THREE.InstancedInterleavedBuffer( new Float32Array(alphas), 1, 1 );
            let instanceWidthBuffer = new THREE.InstancedInterleavedBuffer( new Float32Array(widths), 1, 1 );

            self.geometry.addAttribute( 'instanceStart', new THREE.InterleavedBufferAttribute( instanceDistanceBuffer, 3, 0 ) ); // d0
            self.geometry.addAttribute( 'instanceEnd', new THREE.InterleavedBufferAttribute( instanceDistanceBuffer, 3, 3 ) ); // d1
            self.geometry.addAttribute( 'instanceColorStart', new THREE.InterleavedBufferAttribute( instanceColorBuffer, 3, 0 ) ); // d0
            self.geometry.addAttribute( 'alphaStart', new THREE.InterleavedBufferAttribute( instanceAlphaBuffer, 1, 0 ) ); // d0
            self.geometry.addAttribute( 'widthStart', new THREE.InterleavedBufferAttribute( instanceWidthBuffer, 1, 0 ) ); // d0
            self.geometry.addAttribute('instanceColorId', new THREE.InstancedBufferAttribute(new Float32Array(idColors), 3, true));
        }

    };

    getLineCoordinates(p0, p1, arrows, scaleFactor) {
        let leftArrowAngle = 205 * Math.PI / 180;
        let rightArrowAngle = 155 * Math.PI / 180;
        let xLeftTail, yLeftTail, xRightTail, yRightTail,
            xLeftHead, yLeftHead, xRightHead, yRightHead;
        let xDirectAngle, yDirectAngle, xReverseAngle, yReverseAngle;

        /** Calc catheters of the imagine triangle with line
         *\
         * \
         *  \
         ****\
         */
        let dx = p1.x - p0.x;
        let dy = p1.y - p0.y;
        // Calc the angle of the line
        let angle = Math.atan2(dy, dx);

        /** Calc hypotenuse of imagine triangle (length of our line)
         |*
         | *
         |  *
         |___*
         * @type {number}
         */
        let dr = Math.sqrt(dx * dx + dy * dy);
        if (dr == 0) {
            return;
        }

        // Get distances from the center of the vertices on which line should begin and finish
        let r0 = 2 + (p0.radius * scaleFactor);
        let r1 = 2 + (p1.radius * scaleFactor);

        if (r0 + r1 > dr) {
            return;
        }

        // Calculate position of line near head vertex
        let dsf = r0 / dr;
        let sx = p0.x + dx * dsf;
        let sy = p0.y + dy * dsf;

        // Calculate position of line near tail vertex
        let dnf = (dr - r1) / dr;
        let qx = p0.x + dx * dnf;
        let qy = p0.y + dy * dnf;

        if (arrows.leftArrow) {
            let headLength = arrows.arrowLength || 5;

            xLeftTail = qx + headLength * Math.cos(angle + leftArrowAngle);
            yLeftTail = qy + headLength * Math.sin(angle + leftArrowAngle);
            xRightTail = qx + headLength * Math.cos(angle + rightArrowAngle);
            yRightTail = qy + headLength * Math.sin(angle + rightArrowAngle);

            xReverseAngle = Math.sin(angle + Math.PI / 2);
            yReverseAngle = Math.cos(angle + Math.PI / 2);
        }

        if (arrows.rightArrow) {
            let headLength = arrows.arrowLength || 5;

            xLeftHead = sx - headLength * Math.cos(angle + leftArrowAngle);
            yLeftHead = sy - headLength * Math.sin(angle + leftArrowAngle);
            xRightHead = sx - headLength * Math.cos(angle + rightArrowAngle);
            yRightHead = sy - headLength * Math.sin(angle + rightArrowAngle);

            xDirectAngle = Math.sin(angle - Math.PI / 2);
            yDirectAngle = Math.cos(angle - Math.PI / 2);
        }

        return {
            sx, sy, qx, qy,
            xLeftTail, yLeftTail, xRightTail, yRightTail,
            xLeftHead, yLeftHead, xRightHead, yRightHead,
            xDirectAngle, yDirectAngle, xReverseAngle, yReverseAngle
        }

    };
}

export default Line;
