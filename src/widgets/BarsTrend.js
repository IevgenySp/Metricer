import echarts from 'echarts';
import moment from 'moment';
import { getSorted } from '../accessors/pomberCovidData.accessor';

class BarsTrend {
    constructor(props) {
        this.container = props.container;
        this.data = props.data;
        this.mode = props.mode;
        this.country = props.country;
        this.style = props.style;
        this.barsTrend = echarts.init(this.container);
        this.styles = mode => {
            let styles = {
                tooltip: {},
                dataZoom: {},
                itemStyle: {}
            };

            switch(mode) {
                case 'confirmed':
                    styles.tooltip.borderColor = 'rgba(255, 193, 7, 1)';
                    styles.dataZoom.fillerColor = 'rgba(255, 193, 7, 1)';
                    styles.itemStyle.color = 'rgba(255, 193, 7, 1)';
                    break;
                case 'deaths':
                    styles.tooltip.borderColor = 'rgba(244, 67, 54, 1)';
                    styles.dataZoom.fillerColor = 'rgba(244, 67, 54, 1)';
                    styles.itemStyle.color = 'rgba(244, 67, 54, 1)';
                    break;
                case 'recovered':
                    styles.tooltip.borderColor = 'rgba(139, 195, 74, 1)';
                    styles.dataZoom.fillerColor = 'rgba(139, 195, 74, 1)';
                    styles.itemStyle.color = 'rgba(139, 195, 74, 1)';
            }

            return styles;
        }
    }

    build(options) {
        if (options && options.mode) this.mode = options.mode;
        if (options && options.country !== undefined) this.country = options.country;
        if (options && options.style !== undefined) this.style = options.style;

        let parameter = this.mode;
        let styles = this.styles(parameter);
        let sortedData = getSorted(this.data,  this.mode, 'descending');
        let firstData = Object.values(sortedData)[0];
        let datesCount = /*firstData.length*/ 30;
        let keys = Object.keys(sortedData);
        let categoryCount = keys.length;
        let xAxisData = [];
        let customData = [];
        let legendData = [];
        let dataList = [];

        legendData.push('trend');

        let encodeY = [];
        for (let i = 0; i < datesCount; i++) {
            legendData.push(moment(firstData[firstData.length - (datesCount - i)].date).format("MM.D.YY"));
            dataList.push([]);
            encodeY.push(1 + i);
        }

        keys.forEach((key, index) => {
            xAxisData.push(key);
            let customVal = [index];
            customData.push(customVal);

            for (let i = 0; i < datesCount; i++) {
                if (sortedData[key].length - (datesCount - i) > 0) {
                    let value = sortedData[key][sortedData[key].length - (datesCount - i)][parameter];
                    let prevValue = sortedData[key][sortedData[key].length - (datesCount - i) - 1][parameter];
                    let diff = value - prevValue > 0 ? value - prevValue : 0;

                    dataList[i].push(diff);
                    customVal.push(diff);
                }
            }
        });

        let defineZoomRange = country => {
          let startValue = 0;
          let endValue = 4;
          let countryIndex = xAxisData.indexOf(country);

          if (countryIndex !== -1) {
              startValue = endValue = countryIndex;
          }

          return {startValue: startValue, endValue: endValue};
        };

        let dataZoomRange = defineZoomRange(this.country);

        function renderItem(params, api) {
            var xValue = api.value(0);
            var currentSeriesIndices = api.currentSeriesIndices();
            var barLayout = api.barLayout({
                barGap: '30%', barCategoryGap: '20%', count: currentSeriesIndices.length - 1
            });

            var points = [];
            for (var i = 0; i < currentSeriesIndices.length; i++) {
                var seriesIndex = currentSeriesIndices[i];
                if (seriesIndex !== params.seriesIndex) {
                    var point = api.coord([xValue, api.value(seriesIndex)]);
                    point[0] += barLayout[i - 1].offsetCenter;
                    point[1] -= 20;
                    points.push(point);
                }
            }
            var style = api.style({
                stroke: api.visual('color'),
                fill: null
            });

            return {
                type: 'polyline',
                shape: {
                    points: points
                },
                style: style
            };
        }

        let option = {
            grid: {
              width: '87%',
              top: 40
            },
            tooltip: {
                trigger: 'item',
                borderWidth: 2,
                borderColor: styles.tooltip.borderColor
            },
            //legend: {
            //    data: legendData
            //},
            dataZoom: [{
                type: 'slider',
                height: '30px',
                bottom: '5px',
                startValue: dataZoomRange.startValue,
                endValue: dataZoomRange.endValue,
                fillerColor: styles.dataZoom.fillerColor,
                textStyle: {
                    color: this.style === 'dark' ? '#d5ece9' : '#000'
                }
            }
            , {
                type: 'inside',
                start: 50,
                end: 70
            }],
            xAxis: {
                data: xAxisData,
                axisLine: {
                    lineStyle: {
                        color: this.style === 'dark' ? '#d5ece9' : '#000'
                    }
                }
            },
            yAxis: {
                axisLine: {
                    lineStyle: {
                        color: this.style === 'dark' ? '#d5ece9' : '#000'
                    }
                }
            },
            series: [{
                type: 'custom',
                name: 'trend',
                renderItem: renderItem,
                itemStyle: {
                    borderWidth: 2
                },
                encode: {
                    x: 0,
                    y: encodeY
                },
                data: customData,
                z: 100
            }].concat(echarts.util.map(dataList, function (data, index) {
                return {
                    type: 'bar',
                    animation: false,
                    name: legendData[index + 1],
                    itemStyle: {
                        opacity: 1,
                        color: styles.itemStyle.color
                    },
                    data: data
                };
            }))
        };

        this.barsTrend.setOption(option);
    }

    resize(container) {
        this.container = container;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.barsTrend.resize(this.width, this.height);
    };
}

export default BarsTrend;
