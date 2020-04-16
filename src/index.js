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
import DonutChart from './components/DonutChart.js';

import Data from './data.js';
import sources from './sources.js'
import '../style/style.css';

const store = createStore(reducer, composeWithDevTools(applyMiddleware(thunk)));

let dataLayer = new Data();
let widgets = {KPI: <KPI/>, DonutChart: <DonutChart/>};

dataLayer.get(sources.pomberCovid19, data => {
    let parentContainer = document.getElementById('main');
    let getLayout = width => {
        let kpiW = width > 1100 ? 3 : 4;
        let mapX = kpiW === 4 ? 4 : 3;

        return [
            {i: 'KPI', x: 0, y: 0, w: kpiW, h: 6},
            {i: 'DonutChart', x: mapX, y: 0, w: 7, h: 12},
            //{i: 'c', x: 4, y: 0, w: 1, h: 2}
        ];
    };


    render(<Provider store={store}>
        <Dashboard layout={getLayout} widgets={widgets} dataObj={data} container={parentContainer}/>
    </Provider>, document.getElementById('main'));
});
