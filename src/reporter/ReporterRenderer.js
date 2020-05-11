import React from 'react';
import ReactReporter from "./components/ReactReporter";
import './style/style.sass';

class ReporterRenderer {
    constructor(props) {
    }

    render(type, container, config) {
        let component;

        switch (type) {
            case 'React':
                component = <ReactReporter container={container} config={config}/>;
                break;
            case 'Angular':
                break;
        }

        return component;
    }
}

export default ReporterRenderer;
