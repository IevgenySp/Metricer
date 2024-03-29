import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReportsComponent from './ReportsComponent';

class ToolbarComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {width: 0, height: 0, showReports: false};
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

        return true;
    }

    componentWillUnmount() {

    }

    handleClick(type) {
        this.props.onStyleChanged(type);
    }

    handleShowReportsClick(isShow) {
        isShow ? document.body.style.overflow = 'hidden' : document.body.style.overflow = 'unset';

        // Important to close video to avoid reporter widgets logic break
        this.props.onVideoStateChanged(false);
        this.setState({showReports: isShow})
    }

    handleVideoStateClick() {
        let newVideoState = !this.props.showVideo;

        this.props.onVideoStateChanged(newVideoState);
    }

    render() {
        const style = {
            width: 100 + '%',
            height: 100 + '%'
        };
        let darkStyle = "dark-theme";
        let lightStyle = "light-theme";
        let reportsColor = "#000000";
        let currentStyle;
        let iconColor;
        let title;
        let switchTo;

        if (this.props.styleTheme === 'dark') {
            darkStyle += ' selected';
            reportsColor = "#d5ece9";
            currentStyle = darkStyle;
            iconColor = "#d5ece9";
            title = 'Light theme';
            switchTo = 'light';

        }
        if (this.props.styleTheme === 'light') {
            lightStyle += ' selected';
            currentStyle = lightStyle;
            iconColor = "#000000";
            title = 'Dark theme';
            switchTo = 'dark';
        }

        let reportsComponent = this.props.data.length > 0 ?
            <ReportsComponent show={this.state.showReports} handleShow={this.handleShowReportsClick.bind(this)}/> : null;

        return (
            <div style={style} className="toolbar-component">
                <div className={currentStyle} title={title} onClick={() => this.handleClick(switchTo)}>
                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.0" id="Layer_1" x="0px" y="0px" preserveAspectRatio="none" width="34px" height="39px" fill={iconColor} viewBox="0 0 100 100" enableBackground="new 0 0 100 100" xmlSpace="preserve">
                        <path d="M46.667,50c0,1.833-1.501,3.333-3.334,3.333h-30C11.501,53.333,10,51.833,10,50V13.333C10,11.501,11.501,10,13.333,10h30  c1.833,0,3.334,1.501,3.334,3.333V50z"/>
                        <path d="M90,86.667C90,88.499,88.499,90,86.667,90h-30c-1.833,0-3.334-1.501-3.334-3.333V50c0-1.833,1.501-3.333,3.334-3.333h30  c1.832,0,3.333,1.5,3.333,3.333V86.667z"/>
                        <path d="M46.667,86.667c0,1.832-1.501,3.333-3.334,3.333h-30C11.501,90,10,88.499,10,86.667V63.333C10,61.501,11.501,60,13.333,60  h30c1.833,0,3.334,1.501,3.334,3.333V86.667z"/>
                        <path d="M90,36.667C90,38.499,88.499,40,86.667,40h-30c-1.833,0-3.334-1.501-3.334-3.333V13.333c0-1.832,1.501-3.333,3.334-3.333h30  C88.499,10,90,11.501,90,13.333V36.667z"/>
                    </svg>
                </div>
                <div className="reports" onClick={() => this.handleShowReportsClick(true)}>
                    <div title="Build report" className="build-report">
                    <svg height='35px' width='35px'  fill={reportsColor} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enableBackground="new 0 0 100 100" xmlSpace="preserve">
                        <g><path fill={reportsColor} d="M26.395,72.312h25.688c-0.039-0.301-0.092-0.599-0.092-0.911v-4.41H26.395c-1.471,0-2.66,1.189-2.66,2.66   C23.735,71.124,24.924,72.312,26.395,72.312z"></path>
                            <path fill={reportsColor} d="M58.229,35.797v20.645h11.887V27.68c-3.512,0.774-6.448,5.147-11.558,7.958   C58.443,35.702,58.341,35.739,58.229,35.797z"></path>
                            <path fill={reportsColor} d="M42.213,27.955v28.486h11.888V36.603c-3.221-0.702-5.333-4.888-11.062-8.23   C42.77,28.217,42.493,28.078,42.213,27.955z"></path>
                            <path fill={reportsColor} d="M26.198,56.441h11.888V27.209c-4.214,0.108-8.751,2.385-11.888,4.331V56.441z"></path>
                            <path fill={reportsColor} d="M26.694,29.845c1.63,0,2.957-1.327,2.957-2.958c0-0.12-0.021-0.235-0.036-0.352l7.217-2.508   c0.439,1.085,1.5,1.854,2.74,1.854c1.183,0,2.198-0.703,2.671-1.709l10.018,5.867c-0.073,0.259-0.127,0.527-0.127,0.811   c0,1.63,1.325,2.956,2.957,2.956c1.461,0,2.67-1.067,2.908-2.462l11.198-6.508c0.544,0.634,1.341,1.045,2.238,1.045   c1.633,0,2.96-1.327,2.96-2.958c0-1.632-1.327-2.958-2.96-2.958c-1.631,0-2.958,1.326-2.958,2.958c0,0.147,0.023,0.289,0.043,0.431   l-10.756,6.25c-0.471-1.009-1.488-1.714-2.674-1.714c-0.762,0-1.449,0.297-1.973,0.77l-10.64-6.23   c-0.237-1.396-1.446-2.464-2.907-2.464c-1.44,0-2.64,1.034-2.901,2.399l-7.689,2.671c-0.543-0.669-1.361-1.106-2.288-1.106   c-1.633,0-2.959,1.326-2.959,2.957S25.061,29.845,26.694,29.845z M71.437,21.589c0.738,0,1.336,0.599,1.336,1.335   s-0.598,1.334-1.336,1.334c-0.734,0-1.333-0.598-1.333-1.334S70.702,21.589,71.437,21.589z M55.092,29.515   c0.736,0,1.335,0.598,1.335,1.336c0,0.734-0.599,1.333-1.335,1.333c-0.737,0-1.334-0.599-1.334-1.333   C53.758,30.112,54.354,29.515,55.092,29.515z M39.572,21.589c0.736,0,1.333,0.599,1.333,1.335s-0.598,1.334-1.333,1.334   c-0.737,0-1.335-0.598-1.335-1.334S38.835,21.589,39.572,21.589z M26.694,25.553c0.736,0,1.333,0.598,1.333,1.334   s-0.598,1.335-1.333,1.335c-0.737,0-1.336-0.599-1.336-1.335S25.957,25.553,26.694,25.553z"></path>
                            <path fill={reportsColor} d="M81.924,5H18.078c-2.936,0-5.321,2.382-5.321,5.321V89.68c0,2.939,2.385,5.32,5.321,5.32h47.885   l21.28-21.283V10.321C87.243,7.382,84.866,5,81.924,5z M65.963,87.477v-13.76h13.758L65.963,87.477z M81.924,68.397H65.963   c-2.941,0-5.319,2.384-5.319,5.319V89.68H18.078V10.321h63.846V68.397z"></path>
                            <path fill={reportsColor} d="M26.395,82.052h25.688c-0.039-0.303-0.092-0.6-0.092-0.912v-4.408H26.395c-1.471,0-2.66,1.188-2.66,2.658   C23.735,80.865,24.924,82.052,26.395,82.052z"></path>
                        </g></svg>
                    </div>
                    {reportsComponent}
                </div>
                <div className="video" onClick={() => this.handleVideoStateClick()}>
                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" preserveAspectRatio="none" width="30px" height="34px" viewBox="0 0 72 72" version="1.1">
                        <title>Youtube introduction</title>
                        <g id="providers-list" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                            <g id="youtube">
                                <path id="Rectangle-23" fill="#FFF" d="M9 2h55v67H9z"/>
                                <rect id="Rectangle-2" fill="#E42B28" x="0" y="0" width="72" height="72" rx="4"/>
                                <path d="M61.207 23.73c.333 1.338.793 8.667.793 11.464v.612c0 2.797-.46 10.126-.793 11.464-.99 3.979-2.849 5.512-6.27 6.065-1.973.291-11.44.665-18.954.665h.034c-7.514 0-16.981-.374-18.954-.665-3.421-.554-5.28-2.086-6.27-6.065C10.46 45.932 10 38.603 10 35.806v-.612c0-2.797.46-10.126.793-11.464.99-3.979 2.849-5.511 6.27-6.065 1.973-.291 11.44-.665 18.954-.665h-.034c7.514 0 16.981.374 18.954.665 3.421.553 5.28 2.086 6.27 6.064zM30.6 28.002v14.825l13.813-7.588L30.6 28.003z" id="Fill-4" fill="#FFFFFE"/>
                            </g>
                        </g>
                    </svg>
                </div>
            </div>
        )
    }
}

export default connect((state, ownProps) => ({
        ownProps,
        data: state.pomberCovidData,
        styleTheme: state.styleTheme,
        showVideo: state.turnOnOffVideo
    }),
    dispatch => ({
        onStyleChanged: (data) => {
            dispatch({type: 'STYLE_THEME_CHANGE', payload: data});
        },
        onVideoStateChanged: (data) => {
            dispatch({type: 'TURN_ON_OFF_VIDEO', payload: data});
        }
    }))(ToolbarComponent);
