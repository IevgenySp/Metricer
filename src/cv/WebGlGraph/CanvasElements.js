import {select} from 'd3-selection';
import { scaleLinear } from 'd3-scale';

class CanvasElements {
    constructor(props) {
        this.container = props.container;
        this.width = props.width;
        this.height = props.height;
        this.fontScale = scaleLinear()
            .domain([15, 50])
            .range([10, 14]);

        this.initLayer();
    }

    initLayer() {
        let canvasD3 = select(this.container).append('canvas')
            .attr('class', 'labels-canvas')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('position', 'absolute')
            .style('top', 0);

        this.canvas = canvasD3.node();
        this.context = this.canvas.getContext('2d');
        this.adjustPixelRatio(window.devicePixelRatio, this.width, this.height);
    }

    adjustPixelRatio(pixelRatio, width, height) {
        this.canvas.width = width * pixelRatio;
        this.canvas.height = height * pixelRatio;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        let context = this.canvas.getContext('2d');
        context.scale(pixelRatio, pixelRatio);
    }

    buildCircleLabels(data, transform) {
        let scaleFactor = transform && transform.k ? transform.k : 1;

        this.context.save();
        this.context.clearRect(0, 0, this.width, this.height);

        if (transform) {
            this.context.translate(transform.x, transform.y);
            this.context.scale(transform.k, transform.k);
        }

        this.context.fillStyle = '#fff';

        for (let item of data) {
            let fontSize = this.fontScale(item[1].radius * scaleFactor);

            this.context.font = fontSize + 'px roboto condensed,sans-serif';

            let width = this.context.measureText(item[1].title.toUpperCase()).width;
            let heightOffset = item[1].radius + fontSize * 1.5;

            this.context.fillText(item[1].title.toUpperCase(), item[1].x - width / 2, item[1].y + heightOffset);
        }

        this.context.restore();
    }

    getLayer() {
        return this.canvas;
    }
}

export default CanvasElements;
