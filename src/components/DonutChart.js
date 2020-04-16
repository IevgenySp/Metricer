import React, { Component } from 'react';
import Donut from '../widgets/Donut.js';
import Tooltip from '../widgets/Tooltip.js'
import { connect } from 'react-redux';
import { getTotalByCountry } from '../accessors/pomberCovidData.accessor';

class DonutChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hoveredDonut: {}
        }
    }

    componentDidMount() {
        let donutData = getTotalByCountry(this.props.data);
        let singleData = donutData.get('Spain');
        let singleData2 = donutData.get('Italy');
        let labels = ['infected', 'deaths', 'recovered'];
        let colors = ['#ffc107', '#F44336', '#8bc34a'];

        this.geometries = new Map();
        this.canvas.width = this.container.offsetWidth;
        this.canvas.height = this.container.offsetHeight;
        this.geometries.set('Spain', {
            headerLabel: 'Spain',
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 150,
            //innerRadius: 100,
            //innerColor: '#0a1a1f',
            startAngle: Math.PI * 1.5,
            endAngle: Math.PI,
            anticlockwise: false,
            data: this.pureData(singleData),
            percents: this.percentage(singleData),
            labels: labels,
            colors: colors
        });
        this.geometries.set('Italy', {
            headerLabel: 'Italy',
            x: 200,
            y: 200,
            radius: 100,
            //innerRadius: 100,
            //innerColor: '#0a1a1f',
            startAngle: Math.PI * 1.5,
            endAngle: Math.PI,
            anticlockwise: false,
            data: this.pureData(singleData2),
            percents: this.percentage(singleData2),
            labels: labels,
            colors: colors
        });


        this.Tooltip = new Tooltip({container: this.container, options: {width: 150, height: 80}});
        this.Donut = new Donut({canvas: this.canvas});
        this.Donut.build(this.geometries, {animate: true});

        this.canvas.onmousemove = e => {
            // important: correct mouse position:
            let rect = this.canvas.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;
            let hoveredGeometry = this.Donut.isPointInsideDonut({x, y}, this.geometries);

            if (hoveredGeometry.length > 0) {
                //if (!this.state.hoveredDonut.id || this.state.hoveredDonut.id !== hoveredGeometry) {
                    this.setState({
                        hoveredDonut: {id: hoveredGeometry, x: x, y: y}
                    });
                    this.canvas.style.cursor = 'pointer';
                //}
                let tooltipInfo = this.Donut.getHoveredDonutAndSegment();
                let tooltipBorderColor = null;
                let tooltipHeader = null;
                let tooltipLabel = null;
                let tooltipNumber = null;
                 if (tooltipInfo !== null) {
                     tooltipBorderColor = this.geometries.get(tooltipInfo[0]).colors[tooltipInfo[1]];
                     tooltipHeader = this.geometries.get(tooltipInfo[0]).headerLabel;
                     tooltipLabel = this.geometries.get(tooltipInfo[0]).labels[tooltipInfo[1]];
                     tooltipNumber = this.geometries.get(tooltipInfo[0]).data[tooltipInfo[1]];
                 }

                this.Tooltip.show({x, y, tooltipBorderColor, tooltipHeader, tooltipLabel, tooltipNumber});
            } else {
                if (this.state.hoveredDonut.id) {
                    this.setState({
                        hoveredDonut: {}
                    });
                    this.canvas.style.cursor = 'default';

                    this.Tooltip.hide();
                }
            }
        };
    }

    componentDidUpdate() {
        //this.updateChart(this.container);
        //console.log('ura');
        //this.Donut.build(this.geometries.get('1'), {hovered: this.state.hoveredDonut});
        this.Donut.build(this.geometries, {hovered: this.state.hoveredDonut});
    }

    shouldComponentUpdate(nextProps, nextState) {
        /*return nextProps.chart !== this.props.chart ||
            nextState.animationLayerActive !== this.state.animationLayerActive;*/
        return true;
    }

    pureData(data) {
        let infected = data.confirmed - data.recovered - data.deaths;
        let stats = [infected, data.deaths, data.recovered];

        return stats;
    }

    percentage(data) {
        let infected = data.confirmed - data.recovered - data.deaths;
        let stats = [infected, data.deaths, data.recovered];

        return stats.map(stat => (stat / data.confirmed) * 100);
    };

    render() {
        const style = {
            width: 100 + '%',
            height: 100 + '%'
        };

        return (
            <div style={style} className="DonutChart" ref={element => { this.container = element }}>
                <canvas className="canvas-donut-chart" ref={element => { this.canvas = element }}/>
            </div>
        )
    }
}

//export default KPI;

export default connect((state, ownProps) => ({
        ownProps,
        data: state.pomberCovidData
    }),
    dispatch => ({

    }))(DonutChart);