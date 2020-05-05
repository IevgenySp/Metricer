import {select} from 'd3-selection';
import numeral from 'numeral';
import moment from 'moment';
import { getTotal, getLatestDate } from '../accessors/pomberCovidData.accessor';
import Banner from './Banner.js';

class ComplexKPI {
    constructor(props) {
      this.container = props.container;
      this.headerLabel = props.headerLabel;
      this.data = props.data;
    };

    build() {
        let d3parent = select(this.container);
        let data = getLatestDate(this.data);

        d3parent.select('div.kpi-header').remove();
        let d3Header = d3parent.append('div')
            .attr('class', 'kpi-header')
            .text(this.headerLabel);

        d3Header.append('div')
            .attr('class', 'kpi-header-date')
            .text(moment(data).format("MM.D.YY"));

        d3parent.select('div.kpi-body').remove();
        let d3Main = d3parent.append('div')
            .attr('class', 'kpi-body');

        let d3LeftPanel = d3Main.append('div')
            .attr('class', 'kpi-inner-right-panel');

        let d3Icons = d3LeftPanel.append('div')
            .attr('class', 'kpi-icons');

        d3Icons.append('div').attr('class', 'icon-coronavirus');
        d3Icons.append('div').attr('class', 'icon-biohazard');

        let innerRightLabels = d3LeftPanel.append('div')
            .attr('class', 'kpi-inner-right-labels');

        innerRightLabels.append('div')
            .attr('class', 'right-labels-text1')
            .text('covid-19');

        innerRightLabels.append('div')
            .attr('class', 'right-labels-text2')
            .text('coronavirus');

        let d3Statistic = d3Main.append('div')
            .attr('class', 'kpi-statistic');

        let d3TotalStatistic = d3Statistic.append('div')
            .attr('class', 'kpi-total-statistic');

        d3TotalStatistic.append('div')
            .attr('class', 'kpi-total-statistic-label')
            .text('coronavirus cases');

        let cases = getTotal(this.data);

        d3TotalStatistic.append('div')
            .attr('class', 'kpi-total-statistic-number')
            .text(numeral(cases.totalCases).format('0,0'));

        let d3DetailedStatistic = d3Statistic.append('div')
            .attr('class', 'kpi-detailed-statistic');

        let d3DDethStatistic = d3DetailedStatistic.append('div')
            .attr('class', 'kpi-detailed-death-statistic');

        d3DDethStatistic.append('div')
            .attr('class', 'kpi-detailed-death-statistic-label')
            .text('deaths');

        d3DDethStatistic.append('div')
            .attr('class', 'kpi-detailed-death-statistic-number')
            .text(numeral(cases.deathCases).format('0,0'));

        let d3DRecoverStatistic = d3DetailedStatistic.append('div')
            .attr('class', 'kpi-detailed-recover-statistic');

        d3DRecoverStatistic.append('div')
            .attr('class', 'kpi-detailed-recover-statistic-label')
            .text('recovered');

        d3DRecoverStatistic.append('div')
            .attr('class', 'kpi-detailed-recover-statistic-number')
            .text(numeral(cases.recoverCases).format('0,0'));

        let d3Banner = d3Main.append('div')
            .attr('class', 'kpi-banner');

        let bannerStrings = ['humanity in trouble.', 'pray for medics all over the world.'];
        let kpiBanner = new Banner({container: d3Banner.node(), strings: bannerStrings});

        kpiBanner.build();
    };
}

export default ComplexKPI;
