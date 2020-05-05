import React, { Component } from 'react';
import MapDonut from '../widgets/MapDonut.js'
import { connect } from 'react-redux';

class MapDonutChart extends Component {
    constructor(props) {
        super(props);
        this.state = { width: 0, height: 0 };
    }

    updateDimensions() {
        let container = this.container;

        this.setState({
            width: container.offsetWidth,
            height: container.offsetHeight
        });
        this.MapDonut.resize(this.container);
    };

    componentDidMount() {
        //this.buildChart(this.container);
        window.addEventListener('resize', this.updateDimensions.bind(this));

        this.MapDonut = new MapDonut({container: this.container, data: this.props.data, style: this.props.styleTheme});
        this.MapDonut.build();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions.bind(this));
    }

    componentDidUpdate() {
        //this.updateChart(this.container);
        this.MapDonut.build({style: this.props.styleTheme});
    }

    shouldComponentUpdate(nextProps, nextState) {
        /*return nextProps.chart !== this.props.chart ||
            nextState.animationLayerActive !== this.state.animationLayerActive;*/
        return nextProps.styleTheme !== this.props.styleTheme;
    }

    render() {
        const style = {
            width: 100 + '%',
            height: 100 + '%'
        };
        const description = 'Distribution of COVID-19 confirmed, deaths and recovered statistic by countries';

        return (
            <div style={style}>
                <div className="map-donut-description">{description}</div>
                <div className="map-donut-data-link">Based on <a href="https://github.com/pomber/covid19" target="_blank">github.com/pomber/covid19</a> data</div>

                <div style={style} className="MapDonutChart" id="MapDonutChart" ref={element => { this.container = element }}>

                </div>
            </div>
        )
    }
}

export default connect((state, ownProps) => ({
        ownProps,
        data: state.pomberCovidData,
        styleTheme: state.styleTheme
    }),
    dispatch => ({

    }))(MapDonutChart);
