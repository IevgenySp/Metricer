import L from 'leaflet';
//import * as d3 from "d3";
import { scaleLinear } from 'd3-scale';
import '../../node_modules/leaflet-customlayer';
import countriesCentroids from '../utils/countriesCentroids';
import Donut from './Donut.js';
import { getTotalByCountry, countriesCentroidsMapping, getMinMax } from '../accessors/pomberCovidData.accessor';
import '../../node_modules/leaflet/dist/leaflet.css'

//TODO: layer loaded only via http which makes site insecure
//const tileUrl = "http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/{z}/{x}/{y}.png";
//TODO: layer not loaded on production server with 403 error
//const tileUrl = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';
//TODO: layer not fits by style
/*const Stamen_Toner = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
});*/
//TODO: layer too dark
/*const CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
});*/
//TODO: layer needs esry-leaflet plugin which not works properly with ES6 imports
//const tileUrl = {url:'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer?f=jsapi'};

//TODO: still not optimal but the only available dark free layer for now
const tileUrl = 'https://cartocdn_{s}.global.ssl.fastly.net/base-midnight/{z}/{x}/{y}.png';

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

        let self = this;
        let layerAsyncLoading = () => {
            self.tileLayer = L.tileLayer(tileUrl).addTo(self.map);
        };

        setTimeout(layerAsyncLoading, 0);
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
        let linearScaleZ = scaleLinear()
            .domain([1.5, 6])
            .range([7.5, 30]);
        let zoomCoef = linearScaleZ(zoom);
        let minMaxRadius = [5 + zoomCoef, 12 + zoomCoef];
        let linearScale = scaleLinear()
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
