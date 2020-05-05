import React, { Component } from 'react';
import Table from '../widgets/Table.js'
import { connect } from 'react-redux'

class TableChart extends Component {
    constructor(props) {
        super(props);
        this.state = {width: 0, height: 0};
    }

    updateDimensions() {
        let container = this.container;

        this.setState({
            width: container.offsetWidth,
            height: container.offsetHeight
        });
        this.TableChart.resize(this.container);
    };

    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions.bind(this));
        //this.buildChart(this.container);
        this.TableChart = new Table({container:this.container, data: this.props.data, style: this.props.styleTheme});
        this.TableChart.build();
    }

    componentDidUpdate() {
        //this.updateChart(this.container);
        this.TableChart.build({style: this.props.styleTheme});
    }

    shouldComponentUpdate(nextProps, nextState) {
        /*return nextProps.chart !== this.props.chart ||
            nextState.animationLayerActive !== this.state.animationLayerActive;*/
        return nextProps.styleTheme !== this.props.styleTheme;
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions.bind(this));
    }

    render() {
        const style = {
            width: 100 + '%',
            height: 100 + '%'
        };

        return (
            <div style={style} className="table-chart" ref={element => { this.container = element }}>

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

    }))(TableChart);
