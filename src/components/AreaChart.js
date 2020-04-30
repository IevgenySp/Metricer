import React, { Component } from 'react';
import Area from '../widgets/Area.js'
import { connect } from 'react-redux'

class AreaChart extends Component {
    constructor(props) {
        super(props);
        this.calculatedValue = props.value;
        this.state = {width: 0, height: 0, mode: props.mode};
    }

    updateDimensions() {
        let container = this.container;

        this.setState({
            width: container.offsetWidth,
            height: container.offsetHeight
        });
        this.Area.resize(this.container);
    };

    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions.bind(this));
        //this.buildChart(this.container);
        this.Area = new Area({container:this.container, data: this.props.data, value: this.calculatedValue, mode: this.state.mode});
        this.Area.build();
    }

    componentDidUpdate() {
        //this.updateChart(this.container);
        let options = {mode: this.state.mode};
        this.Area.build(options);
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
        const controls = ['dynamic', 'total'];
        const classes = controls.map(item => {
            return item === this.state.mode ? this.calculatedValue + ' ' + item + ' selected' : this.calculatedValue + ' ' + item;
        });
        const description = this.state.mode === 'dynamic' ?
            'Monthly ' + this.state.mode + ' of COVID-19 ' + this.calculatedValue + ' cases' :
            this.state.mode + ' monthly COVID-19 ' + this.calculatedValue + ' cases';

        return (
            <div style={style}>
                <div className="area-chart-controls">
                    <div onClick={() => this.handleClick('dynamic')} className={classes[0]}>dynamic</div>
                    <div onClick={() => this.handleClick('total')} className={classes[1]}>total</div>
                </div>

                <div className="area-chart-description">{description}</div>

                <div style={style} className="area-chart-1" ref={element => { this.container = element }}>

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

    }))(AreaChart);
