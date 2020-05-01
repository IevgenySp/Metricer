//import * as d3 from "d3";
import {select} from 'd3-selection';
import numeral from 'numeral';

class Tooltip {
    constructor(props) {
        this.container = props.container;
        this.tooltipWidth = props.options.width || 150;
        this.tooltipHeight = props.options.height || 80;
        this.d3Tooltip = select(this.container).append('div')
            .attr('class', 'tooltip')
            .style('width', this.tooltipWidth + 'px')
            .style('height', this.tooltipHeight + 'px')
            .style('border', '2px solid white')
            .style('display', 'none');

        this.d3Header = this.d3Tooltip.append('div')
            .attr('class', 'tooltip-header');

        this.d3Label = this.d3Tooltip.append('div')
            .attr('class', 'tooltip-label');

        this.d3Number = this.d3Tooltip.append('div')
            .attr('class', 'tooltip-number');
    }

    show(options) {
        let borderColor = options.tooltipBorderColor || 'white';
        let tooltipHeader = options.tooltipHeader || '';
        let tooltipLabel = options.tooltipLabel || '';
        let tooltipNumber = options.tooltipNumber || 0;

        this.d3Tooltip
            .style('left', options.x - this.tooltipWidth / 2 + 'px')
            .style('top', options.y + 20 + 'px')
            .style('border', '2px solid ' + borderColor)
            .style('display', 'flex')
            .style('flex-direction', 'column');

        this.d3Header
            .style('border-bottom', '2px solid ' + borderColor)
            .text(tooltipHeader);

        this.d3Label
            .text(tooltipLabel);

        this.d3Number
            .style('color', borderColor)
            .text(numeral(tooltipNumber).format('0,0'));
    }

    hide() {
        this.d3Tooltip.style('display', 'none');
    }
}

export default Tooltip;