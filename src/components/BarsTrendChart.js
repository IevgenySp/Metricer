import React, { Component } from 'react';
import BarsTrend from '../widgets/BarsTrend.js'
import { connect } from 'react-redux'

class BarsTrendChart extends Component {
    constructor(props) {
        super(props);
        this.state = {width: 0, height: 0, mode: 'confirmed', country: ''};
        this.countries =  Object.keys(this.props.data[0]);
    }

    updateDimensions() {
        let container = this.container;

        this.setState({
            width: container.offsetWidth,
            height: container.offsetHeight
        });
        this.BarsTrend.resize(this.container);
    };

    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions.bind(this));
        //this.buildChart(this.container);
        this.BarsTrend = new BarsTrend({
            container:this.container,
            data: this.props.data,
            mode: this.state.mode,
            country: this.state.country,
            style: this.props.styleTheme});
        this.BarsTrend.build();
    }

    componentDidUpdate() {
        //this.updateChart(this.container);
        let options = {mode: this.state.mode, country: this.state.country, style: this.props.styleTheme};
        this.BarsTrend.build(options);
    }

    shouldComponentUpdate(nextProps, nextState) {
        /*return nextProps.chart !== this.props.chart ||
            nextState.animationLayerActive !== this.state.animationLayerActive;*/
        return true;
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions.bind(this));
    }

    handleClick(type) {
        if (type !== this.state.mode) {
            this.setState({
                mode: type
            })
        }
    }

    handleChange() {
        let inputValue = this.textInput.value;

        if (inputValue !== this.state.country) {
            if (inputValue === '' || this.countries.indexOf(inputValue) !== -1) {
                this.setState({
                    country: inputValue
                })
            }
        }
    }

    render() {
        const style = {
            width: 100 + '%',
            height: 100 + '%'
        };

        const controls = ['confirmed', 'deaths', 'recovered'];
        const classes = controls.map(item => {
           return item === this.state.mode ? item + ' selected' : item;
        });
        const options = this.countries.map(country => {
            return <option key={country} value={country} />;
                });
        const description = 'Countries monthly dynamic of COVID-19 ' + this.state.mode + ' cases';

        return (
            <div style={style}>
                <div className="bars-trend-controls">
                    <div onClick={() => this.handleClick('confirmed')} className={classes[0]}>confirmed</div>
                    <div onClick={() => this.handleClick('deaths')} className={classes[1]}>deaths</div>
                    <div onClick={() => this.handleClick('recovered')} className={classes[2]}>recovered</div>
                </div>

                <div className="bars-trend-search">
                    <input onChange={() => this.handleChange()} ref={(input) => this.textInput = input} list="countries" placeholder="select country" className="bars-trend-input"/>
                    <datalist id="countries" className="bars-trend-datalist">
                        {options}
                    </datalist>
                </div>

                <div className="bars-trend-description">{description}</div>

                <div style={style} className="BarsTrendChart" ref={element => { this.container = element }}>
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

    }))(BarsTrendChart);
