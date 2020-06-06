'use strict';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import reducer from './redux/reducers';
import { BrowserRouter, HashRouter, Route} from 'react-router-dom';

import MetricerMain from './components/MetricerMain.js';
import CVMain from './cv/CVMain.js';

const store = createStore(reducer, composeWithDevTools(applyMiddleware(thunk)));

render(
    <Provider store={store}>
        <HashRouter>
            <Route exact path="/" component={ MetricerMain }/>
            <Route exact path="/r2d2" component={ CVMain }/>
        </HashRouter>
    </Provider>,
    document.getElementById('main'));