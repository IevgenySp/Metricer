import * as THREE from './threejs/threejs.min';
import {select} from 'd3-selection';

class Textures {
    constructor(props) {
        this.textures = {};
        this.texturesAtlas = null;
        this.data = props.data;
    }

    // TEXTURES PUBLIC METHODS

    initWebGlTexture(callback, textureWidth = 256, textureHeight = 256) {
        let self = this;
        let imagePromises = [];
        let ids = [];
        let loadImage = src => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.addEventListener("load", () => resolve(img));
                img.addEventListener("error", err => reject(err));
                img.src = src;
            });
        };

        for (let item of self.data) {
            imagePromises.push(loadImage(item[1].path));
            ids.push(item[1].id);
        }

        Promise.all(imagePromises).then(values => {
            values.forEach((image, index) => {
                let canvas = document.createElement('canvas');
                let context;

                canvas.width = textureWidth;
                canvas.height = textureHeight;
                context = canvas.getContext('2d');
                //context.translate(textureWidth / 2, textureWidth / 2);
                //context.scale(1, 1);
                context.drawImage(image,0,0);
                self.textures[ids[index]] = canvas;
            });

            self.texturesAtlas = self.generateWebGlTexturesAtlas(values.length, 256, 256, self.textures);

            callback();
        });
    }

    buildWebGlTexture(texturesData, textureWidth = 256, textureHeight = 256) {
        for (let item of texturesData) {
            let canvas = document.createElement('canvas');
            let context;

            canvas.width = textureWidth;
            canvas.height = textureHeight;
            context = canvas.getContext('2d');
            //context.translate(width / 2, height / 2);
            //context.scale(1, 1);

            let drawing = new Image();
            drawing.src = item[1].path; // can also be a remote URL e.g. http://
            drawing.onload = () => {
                context.drawImage(drawing,0,0);

                // Check atlas visual appearance
                /*let canv = document.getElementById('main').appendChild(canvas);
                let ctx = canv.getContext('2d');
                select(canv)
                    .style('position', 'absolute')
                    .style('top', 70 + 'px')
                    .style('left', 20 + 'px')
                    .style('z-index', 1000000);*/

                //console.log('LOADED');
            };

            this.textures[item[1].id] = canvas;
        }
    }

    // TEXTURE PRIVATE METHODS

    initEmptyWebGlTexture(width, height) {
        let textureWidth = width ? width : 16;
        let textureHeight = height ? height : 16;
        let canvas = document.createElement('canvas');
        let context;

        canvas.width = textureWidth;
        canvas.height = textureHeight;
        context = canvas.getContext('2d');

        return canvas;
    };

    defineWebGlTexturesAtlasSize(texturesAmount, startSize = 16, textureSize = 256) {
        let atlasSize = texturesAmount === 2 ? 2 : Math.ceil(texturesAmount / 2);
        //console.log(atlasSize);
        let initialSize = atlasSize * textureSize;
        let actualSize = initialSize;

        for (let i = startSize; i <= initialSize; i*=2 ) {
            actualSize = i;
        }

        return actualSize < initialSize ? actualSize * 2 : actualSize;
    };

    generateWebGlTexturesAtlas(tAmount, tWidth, tHeight, textures) {
        let atlasSize = this.defineWebGlTexturesAtlasSize(tAmount);
        let textureAtlas = this.initEmptyWebGlTexture(atlasSize, atlasSize);
        let tAtlasContext = textureAtlas.getContext('2d');

        Object.keys(textures).forEach((key, index) => {
            let rowIndex = Math.floor(index / (atlasSize / tWidth));
            let columnIndex = index - (atlasSize / tWidth) * rowIndex;

            tAtlasContext.drawImage(textures[key], columnIndex * tWidth, rowIndex * tHeight);
        });

        // Check atlas visual appearance
        /*let canv = document.getElementById('main').appendChild(textureAtlas);
        let ctx = canv.getContext('2d');
        select(canv)
          .style('position', 'absolute')
          .style('top', 70 + 'px')
          .style('left', 20 + 'px')
          .style('z-index', 1000000);*/

        return {
            atlas: new THREE.CanvasTexture(textureAtlas),
            atlasSize: atlasSize / tWidth
        };
    };

    getTextures() {
        return this.textures;
    }

    getTexturesAtlas() {
        return this.texturesAtlas;
    }
}

export default Textures;
