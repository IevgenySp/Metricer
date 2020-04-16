import React, { Component } from 'react';
import ComplexKPI from '../widgets/ComplexKPI.js'
import { connect } from 'react-redux';

class KPI extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        //this.buildChart(this.container);
        this.KPI = new ComplexKPI({container:this.container, headerLabel: 'global pandemic', data: this.props.data});
        this.KPI.build();
    }

    componentDidUpdate() {
        //this.updateChart(this.container);
    }

    shouldComponentUpdate(nextProps, nextState) {
        /*return nextProps.chart !== this.props.chart ||
            nextState.animationLayerActive !== this.state.animationLayerActive;*/
    }

    render() {
        const style = {
            width: 100 + '%',
            height: 100 + '%'
        };

        return (
            <div style={style} className="KPI" ref={element => { this.container = element }}>

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

    }))(KPI);