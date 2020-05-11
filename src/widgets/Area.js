import echarts from 'echarts';
import numeral from 'numeral';
import { getTotalByDate } from '../accessors/pomberCovidData.accessor';

class Area {
    constructor(props) {
        this.container = props.container;
        this.data = props.data;
        this.value = props.value;
        this.mode = props.mode;
        this.style = props.style;
        this.area = echarts.init(this.container);
        this.styles = value => {
            let styles = {
                tooltip: {},
                itemStyle: {}
            };

            switch(value) {
                case 'confirmed':
                    styles.tooltip.borderColor = 'rgba(255, 193, 7, 1)';
                    styles.itemStyle.color = 'rgba(255, 193, 7, 1)';
                    styles.itemStyle.gcolor = ['rgba(255, 193, 7, 0.5)', 'rgba(255, 193, 7, 1)'];
                    break;
                case 'deaths':
                    styles.tooltip.borderColor = 'rgba(244, 67, 54, 1)';
                    styles.itemStyle.color = 'rgba(244, 67, 54, 1)';
                    styles.itemStyle.gcolor = ['rgba(244, 67, 54, 0.5)', 'rgba(244, 67, 54, 1)'];
                    break;
            }

            return styles;
        }
    }

    build(options) {
        if (options && options.mode) this.mode = options.mode;
        if (options && options.style !== undefined) this.style = options.style;

        let getData = (mode, dataSet) => {
          if (mode === 'total') {
              return Object.keys(dataSet).map(item => dataSet[item][this.value]);
          } else if (mode === 'dynamic') {
              let data = [];
              let prevData;

              Object.keys(dataSet).forEach((item, index) => {
                 if (index === 0) {
                     data.push(dataSet[item][this.value]);
                     prevData = dataSet[item][this.value];
                 } else {
                     let diff = dataSet[item][this.value] - prevData;

                     if (dataSet[item][this.value] < prevData || dataSet[item][this.value] === undefined) {
                         diff = prevData;
                     }

                     data.push(diff);
                     prevData = dataSet[item][this.value];
                 }
              });

              return data;
          }
        };

        let dataSet = getTotalByDate(this.data);
        let date = Object.keys(dataSet);
        let data = getData(this.mode, dataSet);
        let styles = this.styles(this.value);

        let option = {
            grid: {
                width: this.container.offsetWidth !== 0 ? this.container.offsetWidth - 70 : '75%',
                top: 30,
                left: 50
            },
            tooltip: {
                trigger: 'axis',
                position: function (pt) {
                    return [pt[0] - 120, '10%'];
                },
                borderWidth: 2,
                borderColor: styles.tooltip.borderColor
            },
            xAxis: {
                type: 'category',
                data: date,
                axisLine: {
                    lineStyle: {
                        color: this.style === 'dark' ? '#d5ece9' : '#000'
                    }
                }
            },
            yAxis: {
                type: 'value',
                axisLine: {
                    lineStyle: {
                        color: this.style === 'dark' ? '#d5ece9' : '#000'
                    }
                },
                axisLabel : {
                    formatter: value => {
                        return numeral(value).format('0.0a');
                    }
                },
            },
            dataZoom: [{
                type: 'inside',
                start: 0,
                end: 100
            }, {
                start: 0,
                end: 100,
                handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                handleSize: '80%',
                handleStyle: {
                    color: '#fff',
                    shadowBlur: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.6)',
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                },
                textStyle: {
                    color: this.style === 'dark' ? '#d5ece9' : '#000'
                }
            }],
            series: [
                {
                    name: this.value,
                    type: 'line',
                    smooth: true,
                    symbol: 'none',
                    sampling: 'average',
                    itemStyle: {
                        color: styles.itemStyle.color
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: styles.itemStyle.gcolor[0]
                        }, {
                            offset: 1,
                            color: styles.itemStyle.gcolor[1]
                        }])
                    },
                    data: data
                }
            ]
        };

        this.area.setOption(option);

    }

    resize(container) {
        this.container = container;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.area.resize(this.width, this.height);
    };
}

export default Area;
