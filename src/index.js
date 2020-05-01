'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import reducer from './redux/reducers';

import Dashboard from './components/Dashboard.js';
import KPI from './components/KPI.js';
//import DonutChart from './components/DonutChart.js';
import MapDonutChart from './components/MapDonutChart.js';
import BarsTrendChart from './components/BarsTrendChart';
import Bars3DChart from './components/Bars3DChart';
import TableChart from './components/TableChart';
import AreaChart from './components/AreaChart';

import Data from './data.js';
import sources from './sources.js'
import '../style/style.css';

const store = createStore(reducer, composeWithDevTools(applyMiddleware(thunk)));

let dataLayer = new Data();
let widgets = {
    KPI: <KPI/>,
    TableChart: <TableChart/>,
    MapDonutChart: <MapDonutChart/>,
    BarsTrendChart: <BarsTrendChart/>,
    Bars3DChart: <Bars3DChart/>,
    AreaChart1: <AreaChart value='confirmed' mode='dynamic'/>,
    AreaChart2: <AreaChart value='deaths' mode='dynamic'/>};

dataLayer.get(sources.pomberCovid19, data => {
    let parentContainer = document.getElementById('main');
    let getLayout = width => {
        let kpiW = width > 1100 ? 3 : 4;
        let mapX = kpiW === 4 ? 4 : 3;

        return [
            {i: 'KPI', x: 0, y: 0, w: kpiW, h: 4.5, static: true},
            {i: 'TableChart', x: 0, y: 4.5, w: kpiW, h: 7.5, static: true},
            {i: 'MapDonutChart', x: mapX, y: 0, w: 6, h: 7, static: true},
            {i: 'BarsTrendChart', x: mapX, y: 7, w: 6, h: 5, static: true},
            {i: 'Bars3DChart', x: mapX + 6, y: 7, w: kpiW, h: 5, static: true},
            {i: 'AreaChart1', x: mapX + 6, y: 0, w: kpiW, h: 3.5, static: true},
            {i: 'AreaChart2', x: mapX + 6, y: 3.5, w: kpiW, h: 3.5, static: true}
        ];
    };

    document.getElementById('loading-screen').style.display = 'none';

    render(<Provider store={store}>
        <Dashboard layout={getLayout} widgets={widgets} dataObj={data} container={parentContainer}/>
        </Provider>, document.getElementById('main'));
});
