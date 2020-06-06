import React, { Component } from 'react';
import { connect } from 'react-redux';
import GridLayout from 'react-grid-layout';
import '../../node_modules/react-grid-layout/css/styles.css'
import '../../node_modules/react-resizable/css/styles.css'

class Dashboard extends Component {
    constructor(props) {
        super(props);
        //this.props.onDataUpload([this.props.dataObj]);
        this.state = { width: 0, height: 0 };
    }

    updateDimensions() {
        let container = this.props.container;

        this.setState({
            width: container.offsetWidth,
            height: container.offsetHeight
        });
    };

    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions.bind(this));
    }

    render() {
        let width = this.props.container.offsetWidth;
        let height = this.props.container.offsetHeight;
        let margin = 20;
        let layout = this.props.layout(width);
        const widgets = layout.map(item => {
            return this.props.widgets[item.i] ?
                <div key={item.i}>{this.props.widgets[item.i]}</div> :
                <div key={item.i}>Empty</div>;
        });
        const className = 'layout ' + this.props.styleTheme;
        //const pageColors = ['#0a1a1f', '#fff'];
        const pageColors = ['#0a1a1f', '#eeeeee'];

        if (this.props.styleTheme === 'dark') {
            document.body.style.background = pageColors[0];
            document.getElementsByClassName('main')[0].style.background = pageColors[0];
        } else if (this.props.styleTheme === 'light') {
            document.body.style.background = pageColors[1];
            document.getElementsByClassName('main')[0].style.background = pageColors[1];
        }

        return (
            <GridLayout className={className} layout={layout} cols={12} rowHeight={Math.floor(height/12)-margin} width={width} margin={[margin, margin]}>
                {widgets}
            </GridLayout>
        )
    }
}

export default connect((state, ownProps) => ({
        ownProps,
        styleTheme: state.styleTheme
    }),
    dispatch => ({
        /*onDataUpload: (data) => {
            dispatch({type: 'POMBER_COVID_DATA_UPDATE', payload: data});
        }*/
    }))(Dashboard);