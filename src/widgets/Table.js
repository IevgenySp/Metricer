import {ModuleRegistry} from '@ag-grid-community/core';
import {Grid} from "@ag-grid-community/core";
import {ClientSideRowModelModule} from '@ag-grid-community/client-side-row-model';
import "@ag-grid-community/core/dist/styles/ag-grid.css";
import "@ag-grid-community/core/dist/styles/ag-theme-balham.css";
import { getSorted } from '../accessors/pomberCovidData.accessor';
import numeral from 'numeral';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

class Table {
    constructor(props) {
        this.container = props.container;
        this.data = props.data;
    }

    build() {
        const sortedData = getSorted(this.data, 'confirmed', 'descending');
        const headers = ['country', 'confirmed', 'deaths', 'recovered'];
        let rowData = [];
        //const colWidth = this.container.offsetWidth / 4;

        Object.keys(sortedData).forEach(item => {
           let lastData = sortedData[item][sortedData[item].length - 1];
           let prevData = sortedData[item][sortedData[item].length - 2];
           let row = {};

           row[headers[0]] = item;
           row[headers[1]] = {
               data: numeral(lastData[headers[1]]).format('0,0'),
               diff: lastData[headers[1]] - prevData[headers[1]],
               color: '#ffc108'
           };
           row[headers[2]] = {
               data: numeral(lastData[headers[2]]).format('0,0'),
               diff: lastData[headers[2]] - prevData[headers[2]],
               color: '#f44337'
           };
           row[headers[3]] = {
               data: numeral(lastData[headers[3]]).format('0,0'),
               diff: lastData[headers[3]] - prevData[headers[3]],
               color: '#8bc34a'
           };
           rowData.push(row);
        });

        function CustomTooltip() {}

        CustomTooltip.prototype.init = function(params) {
            let eGui = (this.eGui = document.createElement('div'));

            eGui.classList.add('custom-tooltip');
            eGui.style['background-color'] = '#0a1a20';
            eGui.innerHTML = '<div>' + params.value + '</div>';
        };

        CustomTooltip.prototype.getGui = function() {
            return this.eGui;
        };

        function CellRenderer() {}

        CellRenderer.prototype.init = function(params) {
            let eGui = (this.eGui = document.createElement('div'));

            eGui.classList.add('custom-cell');
            eGui.innerHTML = Number(params.value.diff) > 0 ?
                '<div class="table-cell"><div>' +  params.value.data + '</div><div style="font-size: 10px; margin-top: -2px; color: ' + params.value.color + '">' + '+' + numeral(params.value.diff).format('0,0') + '</div>' :
                '<div>' + params.value.data + '</div>';
        };

        CellRenderer.prototype.getGui = function() {
            return this.eGui;
        };

        const gridOptions = {
            defaultColDef: {
                tooltipComponent: 'customTooltip',
            },
            tooltipShowDelay: 0,
            columnDefs: [
                {headerName: headers[0], field: headers[0], tooltipField: headers[0]},
                {headerName: headers[1], field: headers[1], cellRenderer: 'cellRenderer'},
                {headerName: headers[2], field: headers[2], cellRenderer: 'cellRenderer'},
                {headerName: headers[3], field: headers[3], cellRenderer: 'cellRenderer'}
            ],
            rowData: rowData,
            components: {
                customTooltip: CustomTooltip,
                cellRenderer: CellRenderer
            },
        };

        this.GridOptions = gridOptions;
        this.GridTable = new Grid(this.container, gridOptions);
        this.GridOptions.api.sizeColumnsToFit();
    }

    resize(container) {
        this.container = container;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.GridOptions.api.sizeColumnsToFit();
    };
}

export default Table;
