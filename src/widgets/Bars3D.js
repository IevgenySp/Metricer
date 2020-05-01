import echarts from 'echarts';
import 'echarts-gl/dist/echarts-gl.min';
import moment from 'moment';
//import * as d3 from "d3";
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { getSorted, getCountryRank } from '../accessors/pomberCovidData.accessor';

class Bars3D {
    constructor(props) {
        this.container = props.container;
        this.data = props.data;
        this.mode = props.mode;
        this.bars3D = echarts.init(this.container);
        this.styles = mode => {
            let styles = {
                tooltip: {},
            };

            switch(mode) {
                case 'confirmed':
                    styles.tooltip.borderColor = 'rgba(255, 193, 7, 1)';
                    break;
                case 'deaths':
                    styles.tooltip.borderColor = 'rgba(244, 67, 54, 1)';
                    break;
                case 'recovered':
                    styles.tooltip.borderColor = 'rgba(139, 195, 74, 1)';
            }

            return styles;
        }
    }

    build(options) {
        if (options && options.mode) this.mode = options.mode;

        let parameter = this.mode;
        let styles = this.styles(parameter);
        let rankSet = getCountryRank(this.data, this.mode);
        let sortedData = getSorted(this.data, this.mode, 'descending');
        let latestDate = rankSet[rankSet.length -1][0];
        let minDate = moment(latestDate).subtract(10, 'days').format("YYYY-M-DD");
        let minDateMs = moment(minDate).valueOf();
        let selectedCountries = [];

        Object.keys(sortedData).forEach(key => {
           if (selectedCountries.length < 10 && selectedCountries.indexOf(key) === -1) {
               selectedCountries.push(key);
           }
        });

        let filteredRankSet = [];

        selectedCountries.reverse().forEach(country => {
            rankSet.forEach(item => {
               if (moment(item[0]).valueOf() >= minDateMs && item[2] === country) {
                   filteredRankSet.push(item);
               }
            });
        });

        let countries = [];
        let dates = [];
        let min = 0;
        let max = 0;

        filteredRankSet.forEach(item => {
            if (item[1] > max) {
                max = item[1];
            }

            if (dates.indexOf(item[0]) === -1) {
               dates.push(item[0]);
           }
           if (countries.indexOf(item[2]) === -1) {
               countries.push(item[2]);
           }
        });

        filteredRankSet.forEach(item => {
           item[1] = max - item[1];
        });

        let interval = 5;
        let fullSegments = Math.trunc(max / interval);
        let firstStep = max - fullSegments * interval;
        let colorScaler = scaleOrdinal().domain(countries).range(schemeCategory10);
        let option = {
            tooltip: {
                formatter: value => {
                    return value.data.value[0] + ' (' + value.data.value[1] + '), Rank: ' + (max - value.data.value[2]);
                },
                borderWidth: 2,
                borderColor: styles.tooltip.borderColor
            },
            //visualMap: {
                //max: 20,
                //inRange: {
                    //color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
                //}
            //},
            xAxis3D: {
                type: 'category',
                data: dates,
                axisLine: {
                    lineStyle: {
                        color: '#d5ece9'
                    }
                }
            },
            yAxis3D: {
                type: 'category',
                data: countries,
                axisLine: {
                    lineStyle: {
                        color: '#d5ece9'
                    }
                }
            },
            zAxis3D: {
                min: min,
                max: max,
                interval: interval,
                type: 'value',
                axisLine: {
                    lineStyle: {
                        color: '#d5ece9'
                    }
                },
                axisLabel: {
                    formatter: (value, index) => {
                        let labelValue;

                        if (index === 0) {
                            labelValue = max;
                        } else {
                            labelValue = firstStep > 0 ? max - interval * (index - 1) - firstStep :
                                max - interval * index - firstStep;
                        }

                        return labelValue;
                    }
                },
                axisPointer: {
                    label: {
                        formatter: value => {
                            return max - value;
                        }
                    }
                }
            },
            grid3D: {
                //boxWidth: 200,
                boxDepth: 80,
                viewControl: {
                    // projection: 'orthographic'
                },
                light: {
                    main: {
                        intensity: 1.2,
                        shadow: true
                    },
                    ambient: {
                        intensity: 0.3
                    }
                }
            },
            series: [{
                type: 'bar3D',
                data: filteredRankSet.map(function (item) {
                    return {
                        itemStyle: {
                            //color: calculateRGBA(colorScaler(item[2]), opacityScaler(item[1]))
                            color: colorScaler(item[2])
                        },
                        value: [item[0], item[2], item[1]]
                    }
                }),
                shading: 'lambert',

                label: {
                    textStyle: {
                        fontSize: 16,
                        borderWidth: 1
                    },
                    formatter: value => {
                        return max - value.data.value[2];
                    }
                },

                emphasis: {
                    label: {
                        textStyle: {
                            fontSize: 20,
                            color: '#900'
                        }
                    },
                    itemStyle: {
                        color: '#900'
                    }
                }
            }]
        };

        this.bars3D.setOption(option);

    }

    resize(container) {
        this.container = container;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.bars3D.resize(this.width, this.height);
    };

}

export default Bars3D;
