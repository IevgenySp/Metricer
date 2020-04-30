import L from 'leaflet';
import * as d3 from "d3";
import '../../node_modules/leaflet-customlayer';
import countriesCentroids from '../utils/countriesCentroids';
import Donut from './Donut.js';
import { getTotalByCountry, countriesCentroidsMapping, getMinMax } from '../accessors/pomberCovidData.accessor';
import '../../node_modules/leaflet/dist/leaflet.css'

const tileUrl = "http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/{z}/{x}/{y}.png";

class MapDonut {
    constructor(props) {
        this.container = props.container;
        this.data = props.data;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.map = L.map(this.container.id, {
            renderer: L.canvas(),
            worldCopyJump: true,
            minZoom: 1.5,
            maxZoom: 6,
            zoomSnap: 0.25,
            maxBounds: [[-90, -170], [90, 190]],
            maxBoundsViscosity: 0.8,
        }).setView([31.505, 30.09], 1.5);
        this.tileLayer =  L.tileLayer(tileUrl).addTo(this.map);

        /*var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
            maxZoom: 20,
            attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        }).addTo(this.map);*/

        /*L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
            // minZoom: 0,
            // maxZoom: 18,
            noWrap: true,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            id: 'mapbox.light'
        }).addTo(this.map);*/
    }

    build() {
        let self = this;
        let renderIndex = 0;
        let donutData = getTotalByCountry(this.data);
        let container = document.createElement('canvas');
        let pixelRatio = window.devicePixelRatio;
        container.width = this.width * pixelRatio;
        container.height = this.height * pixelRatio;
        container.style.width = this.width + 'px';
        container.style.height = this.height + 'px';
        let canvasLayer = new L.customLayer({
            container: container,
            //padding: 0.1
        });

        canvasLayer.on('layer-mounted', function() {
            let context = this.getContainer().getContext('2d');
            context.scale(pixelRatio, pixelRatio);
            self.Donut = new Donut({container: self.container, canvas: this.getContainer(), pixelRatio: pixelRatio});
        });

        canvasLayer.on('layer-render', function() {
            if (this.getContainer().width / pixelRatio !== self.container.offsetWidth) {
                self.Donut.resize(self.container.offsetWidth, self.container.offsetHeight, pixelRatio);
            }

            countriesCentroids.forEach(arr => {
                let latlng = L.latLng(arr[1], arr[2]);
                //let point = self.map.project(latlng, this._zoom);
                let point = self.map.latLngToContainerPoint(latlng);
                let data = donutData.get(arr[3]);
                let mappedData = countriesCentroidsMapping();

                if (!data) {
                    let mappedItem = mappedData.get(arr[3]);
                    data = donutData.get(mappedItem);
                }

                if (data) {
                    data.x = point.x;
                    data.y = point.y;
                }
            });

            self.Donut.build(donutData, {
                animate: renderIndex === 0,
                config: self.donutConfig(self.data, self.map._zoom)
            });

            renderIndex++;
        });

        canvasLayer.addTo(this.map);
    }

    donutConfig(dataSet, zoom) {
        let minMax = getMinMax(dataSet, ['US']);
        let linearScaleZ = d3.scaleLinear()
            .domain([1.5, 6])
            .range([7.5, 30]);
        let zoomCoef = linearScaleZ(zoom);
        let minMaxRadius = [5 + zoomCoef, 12 + zoomCoef];
        let linearScale = d3.scaleLinear()
            .domain([minMax.confirmed.min, minMax.confirmed.max])
            .range(minMaxRadius);
        let radius = (data, key) => {
            if (key === 'US') {
                return 16 + zoomCoef;
            } else {
                return   linearScale(data.confirmed);
            }

        };

        return {
            colors: ['#ffc107', '#F44336', '#8bc34a'],
            labels: ['infected', 'deaths', 'recovered'],
            rawData: this.pureData,
            percents: this.percentage,
            radius: radius
        };
    }

    pureData(data) {
        let infected = data.confirmed - data.recovered - data.deaths;
        let stats = [infected, data.deaths, data.recovered];

        return stats;
    }

    percentage(data) {
        let infected = data.confirmed - data.recovered - data.deaths;
        let stats = [infected, data.deaths, data.recovered];

        return stats.map(stat => (stat / data.confirmed) * 100);
    };

    resize(container) {
        this.container = container;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
    };
}

export default MapDonut;
