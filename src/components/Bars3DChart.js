import React, { Component } from 'react';
import Bars3D from '../widgets/Bars3D.js'
import { connect } from 'react-redux';

class Bars3DChart extends Component {
    constructor(props) {
        super(props);
        this.state = {width: 0, height: 0, mode: 'confirmed'};
    }

    updateDimensions() {
        let container = this.container;

        this.setState({
            width: container.offsetWidth,
            height: container.offsetHeight
        });
        this.bars3D.resize(this.container);
    };

    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions.bind(this));
        //this.buildChart(this.container);
        this.bars3D = new Bars3D({container:this.container, data: this.props.data, mode: this.state.mode});
        this.bars3D.build();
    }

    componentDidUpdate() {
        //this.updateChart(this.container);
        let options = {mode: this.state.mode};
        this.bars3D.build(options);
    }

    shouldComponentUpdate(nextProps, nextState) {
        /*return nextProps.chart !== this.props.chart ||
            nextState.animationLayerActive !== this.state.animationLayerActive;*/
        return true;
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions.bind(this));
    }

    handleClick(type) {
        if (type !== this.state.mode) {
            this.setState({
                mode: type
            })
        }
    }

    render() {
        const style = {
            width: 100 + '%',
            height: 100 + '%'
        };
        const controls = ['confirmed', 'deaths', 'recovered'];
        const classes = controls.map(item => {
            return item === this.state.mode ? item + ' selected' : item;
        });
        const description = 'Top 10 countries rank by COVID-19 ' + this.state.mode + ' cases for the last 10 days';

        return (
            <div style={style}>
                <div className="bars-trend-controls bars-3d-controls">
                    <div onClick={() => this.handleClick('confirmed')} className={classes[0]}>confirmed</div>
                    <div onClick={() => this.handleClick('deaths')} className={classes[1]}>deaths</div>
                    <div onClick={() => this.handleClick('recovered')} className={classes[2]}>recovered</div>
                </div>

                <div className="bars-3d-description">{description}</div>

                <div style={style} className="Bars3DChart" ref={element => { this.container = element }}>

                </div>
            </div>
        )
    }
}

export default connect((state, ownProps) => ({
        ownProps,
        data: state.pomberCovidData
    }),
    dispatch => ({

    }))(Bars3DChart);
