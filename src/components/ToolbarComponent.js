import React, { Component } from 'react';
import { connect } from 'react-redux'

class ToolbarComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {width: 0, height: 0};
    }

    componentDidMount() {
        //this.buildChart(this.container);
    }

    componentDidUpdate() {
        //this.updateChart(this.container);
    }

    shouldComponentUpdate(nextProps, nextState) {
        /*return nextProps.chart !== this.props.chart ||
            nextState.animationLayerActive !== this.state.animationLayerActive;*/

        return nextProps.styleTheme !== this.props.styleTheme;
    }

    componentWillUnmount() {

    }

    handleClick(type) {
        this.props.onStyleChanged(type);
    }

    render() {
        const style = {
            width: 100 + '%',
            height: 100 + '%'
        };
        let darkStyle = "dark-theme";
        let lightStyle = "light-theme";

        if (this.props.styleTheme === 'dark') darkStyle += ' selected';
        if (this.props.styleTheme === 'light') lightStyle += ' selected';

        return (
            <div style={style} className="toolbar-component">
                <div className={darkStyle} title="Dark theme" onClick={() => this.handleClick('dark')}>
                    <svg viewBox="-4 -3 25 25" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.31 0a8.32 8.32 0 0 1-8.3 14.4A9.04 9.04 0 1 0 8.32 0z"/>
                    </svg>
                </div>
                <div className={lightStyle} title="Light theme" onClick={() => this.handleClick('light')}>
                    <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" fill="#d5ece9">
                        <path d="M9 4.05c.53 0 1.05.09 1.53.24L9 0 7.47 4.29A4.8 4.8 0 0 1 9 4.05z"/>
                        <path d="m18 9-4.29-1.53a4.8 4.8 0 0 1 0 3.06z"/>
                        <path d="M6.76 4.59L2.64 2.63 4.6 6.75a4.9 4.9 0 0 1 2.16-2.16z"/>
                        <path d="m13.41 6.75 1.96-4.12-4.12 1.96a4.95 4.95 0 0 1 2.16 2.16z"/>
                        <path d="M9 13.95c-.53 0-1.05-.09-1.53-.24L9 18l1.53-4.29a4.8 4.8 0 0 1-1.53.24z"/>
                        <path d="m11.25 13.41 4.12 1.96-1.96-4.12a4.9 4.9 0 0 1-2.16 2.16z"/>
                        <path d="M4.05 9c0-.53.09-1.04.24-1.53L0 9l4.29 1.53A4.8 4.8 0 0 1 4.05 9z"/>
                        <path d="m4.59 11.25-1.96 4.12 4.12-1.96a4.9 4.9 0 0 1-2.16-2.16z"/>
                        <circle cx="9" cy="9" r="3.46"/>
                    </svg>
                </div>
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
        onStyleChanged: (data) => {
            dispatch({type: 'STYLE_THEME_CHANGE', payload: data});
        }
    }))(ToolbarComponent);
