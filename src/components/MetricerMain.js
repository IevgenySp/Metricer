import React, { Component } from 'react';
import { connect } from 'react-redux';

import Dashboard from './../components/Dashboard.js';
import KPI from './../components/KPI.js';
//import DonutChart from './../components/DonutChart.js';
import MapDonutChart from './../components/MapDonutChart.js';
import BarsTrendChart from './../components/BarsTrendChart';
import Bars3DChart from './../components/Bars3DChart';
import TableChart from './../components/TableChart';
import AreaChart from './../components/AreaChart';
import ToolbarComponent from './../components/ToolbarComponent';

import Data from './../data.js';
import sources from './../sources.js'
import '../../style/style.sass';

const dataLayer = new Data();
const widgets = {
    KPI: <KPI/>,
    TableChart: <TableChart/>,
    MapDonutChart: <MapDonutChart/>,
    BarsTrendChart: <BarsTrendChart/>,
    Bars3DChart: <Bars3DChart/>,
    AreaChart1: <AreaChart value='confirmed' mode='dynamic'/>,
    AreaChart2: <AreaChart value='deaths' mode='dynamic'/>,
    ToolbarComponent: <ToolbarComponent />};
const parentContainer = document.getElementById('main');
const getLayout = width => {
    let kpiW = width > 1100 ? 3 : 4;
    let mapX = kpiW === 4 ? 4 : 3;

    return [
        {i: 'KPI', x: 0, y: 1, w: kpiW, h: 4.5, static: true},
        {i: 'TableChart', x: 0, y: 5.5, w: kpiW, h: 6.5, static: true},
        {i: 'MapDonutChart', x: mapX, y: 0, w: 6, h: 7, static: true},
        {i: 'BarsTrendChart', x: mapX, y: 7, w: 6, h: 5, static: true},
        {i: 'Bars3DChart', x: mapX + 6, y: 7, w: kpiW, h: 5, static: true},
        {i: 'AreaChart1', x: mapX + 6, y: 0, w: kpiW, h: 3.5, static: true},
        {i: 'AreaChart2', x: mapX + 6, y: 3.5, w: kpiW, h: 3.5, static: true},
        {i: 'ToolbarComponent', x: 0, y: 0, w: kpiW, h: 1, static: true}
    ];
};

//dataLayer.get(sources.pomberCovid19, data => {
    //document.getElementById('loading-screen').style.display = 'none';

    //return data;

    /*render(
        <Provider store={store}>
            <BrowserRouter>
                <Route exact path="/" component={
                    <Dashboard layout={getLayout} widgets={widgets} dataObj={data} container={parentContainer}/>}/>
            </BrowserRouter>
        </Provider>,
        document.getElementById('main'));*/
//});


class MetricerMain extends Component {
    constructor(props) {
        super(props);

        let self = this;

        dataLayer.get(sources.pomberCovid19, data => {
            document.getElementById('loading-screen').style.display = 'none';

            self.props.onDataUpload([data]);
        });
    }

    render() {
        let containerElement = this.props.data.length > 0 ?
            <Dashboard layout={getLayout} widgets={widgets} dataObj={this.props.data} container={parentContainer}/> : null;

        return (
            <div>{containerElement}</div>
        )
    }
}

export default connect((state, ownProps) => ({
        ownProps,
        styleTheme: state.styleTheme,
        data: state.pomberCovidData
    }),
    dispatch => ({
        onDataUpload: (data) => {
            dispatch({type: 'POMBER_COVID_DATA_UPDATE', payload: data});
        }
    }))(MetricerMain);
