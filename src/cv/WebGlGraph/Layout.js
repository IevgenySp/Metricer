import { forceSimulation, forceCenter, forceLink, forceManyBody, forceX, forceY, forceCollide } from 'd3-force';

class Layout {
    constructor(props) {
        this.width = props.width;
        this.height = props.height;
        this.options = props.options || {
            width: this.width,
            height: this.height,
            friction: 0.3,
            gravity: 0.1,
            distance: 220,
            force: 900,
            alphaMin: 0.02,
            initialAlpha: 0.7,
            forceStrength: 0.7
        };
        this.simulation = this.init(this.options);
    }

    init(options) {
        let simulation = forceSimulation()
            .force('center', forceCenter(options.width / 2, options.height / 2))
            .force('link', forceLink())
            .force('charge', forceManyBody())
            .force('forceX', forceX())
            .force('forceY', forceY())
            .force('collide', forceCollide());
        simulation.alphaMin(options.alphaMin);
        simulation.velocityDecay(options.friction);
        simulation.force('forceX').strength(options.gravity).x(options.width / 2);
        simulation.force('forceY').strength(options.gravity).y(options.height / 2);
        simulation.force('link').id(function(d) {return d.id;}).distance(function(d) {return d.distance || options.distance;});
        simulation.force('charge').strength(-options.force);
        simulation.force('collide')
            .radius(function(d){return d.radius;})
            .strength(options.forceStrength);
        // Updates ignored until this is run
        // Restarts the simulation (important if simulation has already slowed down)
        simulation.alpha(options.initialAlpha).restart();

        return simulation;
    }

    getSimulation() {
        return this.simulation
    }
}

export default Layout;
