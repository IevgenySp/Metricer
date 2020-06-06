import React, { Component } from 'react';
import ComplexKPI from '../widgets/ComplexKPI.js'
import { connect } from 'react-redux';

class KPI extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if (this.props.data.length !== 0) {
            this.KPI = new ComplexKPI({container:this.container, headerLabel: 'global pandemic', data: this.props.data});
            this.KPI.build();
        }
    }

    componentDidUpdate() {
        if (!this.KPI) {
            this.KPI = new ComplexKPI({container:this.container, headerLabel: 'global pandemic', data: this.props.data});
            this.KPI.build();
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        /*return nextProps.chart !== this.props.chart ||
            nextState.animationLayerActive !== this.state.animationLayerActive;*/

        return true;
    }

    render() {
        const style = {
            width: 100 + '%',
            height: 100 + '%'
        };

        return (
            <div style={style} className="KPI" ref={element => { this.container = element }}/>
        )
    }
}

export default connect((state, ownProps) => ({
        ownProps,
        data: state.pomberCovidData
    }),
    dispatch => ({

    }))(KPI);