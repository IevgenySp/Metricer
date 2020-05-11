import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReporterRenderer from '../reporter/ReporterRenderer';
import KPI from '../components/KPI';
import MapDonutChart from '../components/MapDonutChart.js';
import BarsTrendChart from '../components/BarsTrendChart';
import Bars3DChart from '../components/Bars3DChart';
import TableChart from '../components/TableChart';
import AreaChart from '../components/AreaChart';

class ReportsComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {width: 0, height: 0};
        this.ReporterRenderer = new ReporterRenderer();
    }

    componentDidMount() {
        //this.buildChart(this.container);
        this.config = {
          documentSize: ['a4', 72],
          theme: this.props.styleTheme,
          reportName: 'covid-19',
          widgets: [
              {
                  id: 0,
                  name: 'KPI',
                  component: <KPI/>,
                  type: 'kpi',
                  description: ''
              },
              {
                  id: 1,
                  name: 'MapDonutChart',
                  component: id => <MapDonutChart id={id}/>,
                  type: 'map',
                  description: 'Covid-19 infected, deaths and recovered cases by countries'
              },
              {
                  id: 2,
                  name: 'TableChart',
                  component: <TableChart/>,
                  type: 'table',
                  description: 'Table of Covid-19 statistic by countries'
              },
              {
                  id: 3,
                  name: 'BarsTrendChart',
                  component: <BarsTrendChart/>,
                  type: 'trend',
                  description: 'Dynamic of Covid-19 infected, deaths and recovered cases by countries for last 30 days'
              },
              {
                  id: 4,
                  name: 'Bars3DChart',
                  component: <Bars3DChart/>,
                  type: 'bars3d',
                  description: 'Top 10 countries rank by COVID-19 confirmed cases for the last 10 days'
              },
              {
                  id: 5,
                  name: 'AreaChart1',
                  component: <AreaChart value='confirmed' mode='dynamic'/>,
                  type: 'area',
                  subicon: { color: '#2196f3', label: '1' },
                  description: 'Monthly dynamic of COVID-19 confirmed cases'
              },
              {
                  id: 6,
                  name: 'AreaChart2',
                  component: <AreaChart value='deaths' mode='dynamic'/>,
                  type: 'area',
                  subicon: { color: '#2196f3', label: '2' },
                  description: 'Monthly dynamic of COVID-19 deaths cases'
              }
          ]
        };

        this.ReporterComponent = this.ReporterRenderer.render('React', this.container, this.config);
    }

    componentDidUpdate() {
        //this.updateChart(this.container);
        this.config.theme = this.props.styleTheme;
        this.ReporterComponent = this.ReporterRenderer.render('React', this.container, this.config);
    }

    shouldComponentUpdate(nextProps, nextState) {
        /*return nextProps.chart !== this.props.chart ||
            nextState.animationLayerActive !== this.state.animationLayerActive;*/

        return true;
    }

    componentWillUnmount() {

    }

    handleClick(type) {
        this.props.onStyleChanged(type);
    }

    render() {
        let display = this.props.show ? 'flex' : 'none';

        const style = {
            width: 100 + 'vw',
            height: 100 + 'vh',
            display: display
        };

        return (
            <div style={style} className='reports-component' ref={element => { this.container = element }}>
                <div className='close-reports' onClick={e => {
                    this.props.handleShow(false);
                    // Prevent event triggering second time on main div
                    e.stopPropagation();
                }}>X</div>
                {this.ReporterComponent}
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

    }))(ReportsComponent);
