import React, { Component } from 'react';

class ReactReporterText extends Component {
    constructor(props) {
        super(props);
        this.config = this.props.config;
    }

    render() {
        const text = this.props.text || '';
        const style = {
            width: this.config.width + 'px',
            height: this.config.height + 'px',
            marginLeft: this.config.left + 'px',
            marginTop: this.config.top + 'px'
        };

        return (<div className="react-reporter-text">
            {text !== '' ? this.props.text :
                <div className='paper-block-text-placeholder' style={{height: this.config.height + 'px'}}>Enter text here</div>}
        </div>)
    }
}

export default ReactReporterText;
