import Analizer from '../Analizer';
import { getTotalByDate, getSorted, getTotalByCountry, getLatestDate } from '../../accessors/pomberCovidData.accessor';
import moment from 'moment';
import numeral from 'numeral';

class AnalizerPomberCovid19 {
    constructor(props) {
        this.data = props.data;
        this.sections = {
            total: {
                deaths: [],
                confirmed: [],
                recovered: []
            },
            dynamic: {
                deathsRate: [],
                recovered: [],
                deathsNumbers: []
            },
            countriesStats: {
                peaks: [],
                changingDynamic: [],
                recoveringRate: []
            }
        };
        this.setTotalSection();
        this.setDynamicSection();
        this.setCountriesStatsSection();
    }

    getTotalGrowth(parameter) {
        let total = getTotalByDate(this.data);
        let dates = Object.keys(total);
        let knownX = [];
        let knownY = [];
        let latestX = 0;
        let datesLength = dates.length - 1;

        dates.forEach((key, index) => {
            if (index > datesLength - 5) {
                knownX.push(index);
                knownY.push(total[key][parameter]);
                latestX = index;
            }
        });

        let addDates = days => {
            let datesArr = [];

            for (let i = 1; i <= days; i++) {
                let nextDay = moment(dates[dates.length-1]).add(i, 'days').format('YYYY-M-DD');
                datesArr.push(nextDay);
            }

            return datesArr;
        };

        let days = addDates(5);
        let newX = [latestX+1, latestX+2, latestX+3, latestX+4, latestX+5];
        let growth = Analizer.growth(knownY, knownX, newX);

        return {
            dates: days,
            growth: growth
        }
    }

    getDynamic(deathRateCountries, recoveredCountries, deathsMaxCountries) {
        let deathsSort = getSorted(this.data, 'deaths', 'descending');
        let totalByCountry = getTotalByCountry(this.data);
        let deathsRate = [];
        let recovered = [];
        let deathsNumbers = [];

        for (let item of totalByCountry) {
            deathsRate.push({
                country: item[0],
                rate: (item[1].deaths / item[1].confirmed) * 100
            });

            if (item[1].confirmed - item[1].deaths - item[1].recovered === 0) {
                recovered.push(item[0]);
            }
        }

        deathsRate.sort((a, b) => b.rate - a.rate);
        deathsRate = deathsRate.filter((item, index) => {
           return index < deathRateCountries;
        });
        recovered = recovered.sort().filter((item, index) => {
           return index < recoveredCountries;
        });

        Object.keys(deathsSort).forEach((key, index) => {
            let lastElement = deathsSort[key][deathsSort[key].length - 1];

            if (index < deathsMaxCountries) {
                deathsNumbers.push({
                    country: key,
                    deaths: lastElement.deaths
                });
            }
        });

        return {deathsRate, recovered, deathsNumbers}
    }

    getCountriesStats(countriesArr, recoveringRate, dynamicCountriesLimit, dynamicLimit) {
        // Countries Peaks
        let confirmedSort = getSorted(this.data, 'confirmed', 'descending');
        let countries = countriesArr;
        let latestDate = getLatestDate(this.data);
        let getPeaks = (data, n = 3, peakList = [] ) => {
            return data.reduce( ( a, v, i, _a, end_index = _a.length - 1 ) => {
                let change = v - _a[ i - 1 ] || 0,
                    mate = i + Math.sign( change ),
                    payload = {
                        change,
                        i,
                        mate
                    };
                if ( change ) a.peaks.push( payload );
                return ( i === end_index ) ? ( a.peaks.forEach( _ => {
                    if ( peakList.includes( _.i ) ) return;
                    if ( mate = a.peaks.find( __ => __.i === _.mate ) ) {
                        a.samePeak.push( {
                            highpoint: data[ _.i ] > data[ mate.i ] ? _.i : mate.i,
                            steepness: mate.change > _.change ? mate.change : _.change
                        } )
                        peakList.push( _.i, mate.i );
                    }
                } ), a ) : a;
            }, {
                peaks: [],
                samePeak: []
            } ).samePeak.sort( ( _, __ ) => __.steepness - _.steepness )
                .map(({highpoint})=>highpoint)
                .slice( 0, n );
        };
        let getPeaksInfo = country => {
            let confirmedData = confirmedSort[country].map(item => item.confirmed);
            let peaks = getPeaks(confirmedData, 3, []);
            let peaksData = peaks.sort((a, b) => a - b).map(peak => {
                let data = confirmedSort[country][peak];
                let start = moment(latestDate, "YYYY-MM-DD");
                let end = moment(data.date, "YYYY-MM-DD");
                //Difference in number of days
                let dateDiff = Math.round(moment.duration(start.diff(end)).asDays());

                return {
                    country: country,
                    date: data.date,
                    dateDiff: dateDiff
                }
            });

            return peaksData;
        };
        let countriesPeaks = countries.map(country => {
           return getPeaksInfo(country);
        });

        // Recovering rate
        let recoveringRates = [];
        Object.keys(confirmedSort).forEach((key, index) => {
            if (index < recoveringRate) {
                let lastElement = confirmedSort[key][confirmedSort[key].length - 1];

                recoveringRates.push({
                    country: key,
                    rate: (lastElement.recovered / lastElement.confirmed) * 100
                })
            }
        });

        recoveringRates.sort((a, b) => b.rate - a.rate);

        // Confirmed cases change dynamic
        let changeDynamic = [];
        let changeDynamicSpeed = [];
        let averageSpeed = [];

        Object.keys(confirmedSort).forEach((key, index) => {
            if (index < dynamicCountriesLimit) {
                let dataLength = confirmedSort[key].length;
                let cDynamic = [];

                confirmedSort[key].forEach((item, index) => {
                    if (index > confirmedSort[key].length - dynamicLimit - 2) {
                        if (index > 0) {
                            let currentValue = item.confirmed;
                            let prevValue = confirmedSort[key][index-1].confirmed;
                            let diff = currentValue - prevValue;

                            if (diff && diff >= 0) {
                                cDynamic.push({
                                    country: key,
                                    date: item.date,
                                    diff: diff
                                })
                            }
                        }
                    }
                });

                changeDynamic.push(cDynamic);
            }
        });

        //console.log(changeDynamic)

        changeDynamic.forEach(item => {
            let cDynamicSpeed = [];

            item.forEach((obj, index) => {
                if (index > 0) {
                    let currentDiff = obj.diff;
                    let prevDiff = item[index-1].diff;
                    let speedPercents = 100 - (prevDiff / currentDiff * 100);

                    cDynamicSpeed.push({
                        country: obj.country,
                        date: obj.date,
                        speedPercent: speedPercents
                    })
                }
            });

            changeDynamicSpeed.push(cDynamicSpeed);
        });

        changeDynamicSpeed.forEach(item => {
            let totalPercent = 0;

            item.forEach(obj => {
               totalPercent += obj.speedPercent;
            });

            totalPercent /= item.length;

            averageSpeed.push({
                country: item[0].country,
                avgPercent: totalPercent
            })
        });

        averageSpeed.sort((a, b) => a.avgPercent - b.avgPercent);

        return {countriesPeaks, recoveringRates, averageSpeed}
    };

    setTotalSection() {
        let confirmedTotal = this.getTotalGrowth('confirmed');
        let deathsTotal = this.getTotalGrowth('deaths');
        let recoveredTotal = this.getTotalGrowth('recovered');

        confirmedTotal.dates.forEach((date, index) => {
            this.sections.total.confirmed.push({
                string: 'Amount of world total confirmed cases may reach ' + numeral(confirmedTotal.growth[index]).format('0,0') + ' till ' + date + ' \n\n',
                parts: [
                    'Amount of world total confirmed cases may reach ',
                    numeral(confirmedTotal.growth[index]).format('0,0'),
                    ' till ', date]
            });
        });

        deathsTotal.dates.forEach((date, index) => {
            this.sections.total.deaths.push({
                string: 'Amount of world total deaths cases may reach ' + numeral(deathsTotal.growth[index]).format('0,0') + ' till ' + date + ' \n\n',
                parts: [
                    'Amount of world total deaths cases may reach ',
                    numeral(deathsTotal.growth[index]).format('0,0'),
                    ' till ', date]
            });
        });

        recoveredTotal.dates.forEach((date, index) => {
            this.sections.total.recovered.push({
                string: 'Amount of world total recovered cases may reach ' + numeral(recoveredTotal.growth[index]).format('0,0') + ' till ' + date + ' \n\n',
                parts: [
                    'Amount of world total recovered cases may reach ',
                    numeral(recoveredTotal.growth[index]).format('0,0'),
                    ' till ', date]
            });
        });
    }

    setDynamicSection() {
        let dynamic = this.getDynamic(10, 100, 10);
        let deathsRateStr = '';
        let recovered = '';
        let deathsNumbers = '';

        dynamic.deathsRate.forEach(item => {
            deathsRateStr += item.country + '(' + numeral(item.rate).format('0.0') + '%) ';
        });

        let rLength = dynamic.recovered.length - 1;
        dynamic.recovered.forEach((item, index) => {
           if (index < rLength) {
               recovered += item + ', ';
           } else {
               recovered += item
           }
        });

        dynamic.deathsNumbers.forEach((item, index) => {
            deathsNumbers += item.country + '(' + numeral(item.deaths).format('0,0') + ') ';
        });

        this.sections.dynamic.deathsRate.push({
           string: 'Top 10 countries with highest deaths rate: ' + deathsRateStr + ' \n\n',
           parts: [
               'Top 10 countries with highest deaths rate: ',
               deathsRateStr
           ]
        });
        this.sections.dynamic.recovered.push({
            string: 'Countries fully recovered from COVID-19: ' + recovered + ' \n\n',
            parts: [
                'Countries fully recovered from COVID-19: ',
                recovered
            ]
        });
        this.sections.dynamic.deathsNumbers.push({
            string: 'Top 10 countries with highest deaths numbers: ' + deathsNumbers + ' \n\n',
            parts: [
                'Top 10 countries with highest deaths numbers: ',
                deathsNumbers
            ]
        });
    }

    setCountriesStatsSection() {
        let countriesStats = this.getCountriesStats(['Russia', 'Ukraine', 'US', 'Austria', 'Spain'], 10, 10, 10);

        countriesStats.countriesPeaks.forEach(peakArr => {
            let str1 = '' + peakArr[0].country + ' ';
            let str2 = 'have ' + peakArr[peakArr.length - 1].dateDiff + ' days left from the biggest peak which means that country ';
            let str3 = peakArr[peakArr.length - 1].dateDiff > 20 ? 'already passed pandemic plateau' : 'not reach pandemic plateau';
            let totalStr = str1 + str2 + str3 + ' \n\n';

            this.sections.countriesStats.peaks.push({
                string: totalStr,
                parts: [
                    str1, str2 + str3
                ]
            });
        });

        countriesStats.recoveringRates.forEach(rateObj => {
            let str1 = '' + rateObj.country + ' ';
            let str2 = 'have ' + numeral(rateObj.rate).format('0.0') + '% recovering rate ';
            let str3 = rateObj.rate > 50 ?
                ' which is higher that in other countries with more than 100 000 confirmed cases' :
                ' which is lower that in other countries with more than 100 000 confirmed cases';
            let totalStr = str1 + str2 + str3 + ' \n\n';

            this.sections.countriesStats.changingDynamic.push({
                string: totalStr,
                parts: [
                    str1, str2 + str3
                ]
            });
        });

        countriesStats.averageSpeed.forEach(speedObj => {
            let str1 = '' + speedObj.country + ' ';
            let str2 = speedObj.avgPercent < 0 ?
                'have ' + numeral(Math.abs(speedObj.avgPercent)).format('0.0') + '% pandemic spreading speed decrease' :
                'have ' + numeral(speedObj.avgPercent).format('0.0') + '% pandemic spreading speed increase';
            let str3 = Math.abs(speedObj.avgPercent) > 50 ?
                ' which is higher that in other countries with more than 100 000 confirmed cases' :
                ' which is lower that in other countries with more than 100 000 confirmed cases';
            let totalStr = str1 + str2 + str3 + ' \n\n';

            this.sections.countriesStats.recoveringRate.push({
                string: totalStr,
                parts: [
                    str1, str2 + str3
                ]
            });
        });
    }

    getRandomFromSections(sections) {
        let strValues = [];
        let sectionFunc = section => {
            let sections = section.split('.');
            let path = this.sections;
            let strValue = '';

            sections.forEach(section => {
                if (path !== undefined) {
                    path = path[section];
                }
            });

            if (Array.isArray(path)) {
                strValue = path[Math.floor(Math.random() * path.length)];
            }

            return strValue;
        };

        if (Array.isArray(sections)) {
            sections.forEach(section => {
               let strV =  sectionFunc(section);
                strValues.push(strV);
            });
        } else {
            let strV =  sectionFunc(section);
            strValues.push(strV);
        }

        return strValues;
    }
}

export default AnalizerPomberCovid19;
