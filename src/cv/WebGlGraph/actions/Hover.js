import {select, event as d3Event} from 'd3-selection';

class Hover {
    constructor(props) {
        let self = this;
        this.layer = props.layer;
        this.canvasLayer = props.canvasLayer;
        this.elements = props.elements;
        this.zoom = props.actions.zoom;
        this.finder = props.actions.find;
        this.hoverTimer = null;

        select(this.canvasLayer)
            .on('mousemove', () => {
                this.hoverEvent(props.elements);
            });
    }

    hoverEvent(elements) {
        let event = d3Event;
        let self = this;

        // hoverDraw is resource heavy, so only do it when the mouse stops
        clearTimeout(this.hoverTimer);
        this.hoverTimer = setTimeout(() => self.hoverCallback(event, elements), 50);
    };

    hoverCallback(event, elements) {
        let offset = this.finder.getMouseOffset(event);
        let circle = elements.circle;
        let line = elements.line;
        let arrow = elements.arrow;
        let foundItem = undefined;

        // Priority: Circle -> Line -> Arrow
        if (circle) {
            foundItem =  this.finder.findWebGlElement(offset.x, offset.y, circle);

            /*if (foundItem) {
                circle.setLuminousIds('hovered', [foundItem.id]);
            } else {
                circle.setLuminousIds('hovered', []);
            }

            circle.build();
            this.layer.renderer.render(this.layer.scene, this.layer.camera);*/

            if (foundItem) {
                if (foundItem.description) {
                    let html = '';
                    let transform = this.zoom.getTransform();

                    foundItem.description.forEach(str => html += '<div style="margin-bottom: 10px">' + str + '</div>');

                    select('div.info-tooltip')
                        .style('display', 'flex')
                        .style('left', foundItem.x * transform.k + transform.x + foundItem.radius * transform.k + 10 + 'px')
                        .style('top', foundItem.y * transform.k + transform.y - foundItem.radius * transform.k + 'px')
                        .html(html);
                } else {
                    select('div.info-tooltip').style('display', 'none');
                }
            } else {
                select('div.info-tooltip').style('display', 'none');
            }
        }

        if (line && foundItem === undefined) {
            let foundItem = this.finder.findWebGlElement(offset.x, offset.y, line);
        }

        if (arrow && foundItem === undefined) {
            let foundItem = this.finder.findWebGlElement(offset.x, offset.y, arrow);
        }

    }

}

export default Hover;
