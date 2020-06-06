class Find {
    constructor(props) {
        this.renderer = props.renderer;
        this.camera = props.camera;
        this.picking = props.pickingElements;
    }

    getMouseOffset(e) {
        if (e.offsetX !== undefined && e.offsetX !== 0) {
            return { x: e.offsetX, y: e.offsetY };
        } else {
            return { x: e.layerX, y: e.layerY };
        }
    }

    findWebGlElement(x, y, element) {
        let foundObject = undefined;
        let data = element.getData().geometries;
        let type = element.type;

        switch(type) {
            case 'circle':
                foundObject = this.findWebGlCircle(x, y, data);
                break;
            case 'line':
                foundObject = this.findWebGlLine(x, y, data);
                break;
            case 'arrow':
                foundObject = this.findWebGlArrow(x, y, data);
        }

        return foundObject;
    };

    findWebGlCircle(x, y, data) {
        let vertexId;
        let item = undefined;
        let vertexPixelBuffer = new Uint8Array(4);
        let eventX = x;
        let eventY = y;

        // Used whenever the mouse pointer needs to find if it is on top of a node
        if (data.size === 0) {
            return;
        }

        if (!x) {
            // Implies this was initiated by an attempted drag
            if (d3 && d3.event) {
                // In contextMenu offsetX is part of root event
                eventX = d3.event.sourceEvent ? d3.event.sourceEvent.offsetX : d3.event.offsetX;
                // In contextMenu offsetY is part of root event
                eventY = d3.event.sourceEvent ? d3.event.sourceEvent.offsetY : d3.event.offsetY;
            }
        }

        if (typeof this.renderer === null) {
            return;
        }

        this.renderer.setRenderTarget(this.picking.pickingCircleTexture);
        this.renderer.render(this.picking.circlesPickingScene, this.camera);
        this.renderer.readRenderTargetPixels(
            this.picking.pickingCircleTexture, eventX, this.picking.pickingCircleTexture.height - eventY, 1, 1, vertexPixelBuffer);

        vertexId = (vertexPixelBuffer[0]<<16)|(vertexPixelBuffer[1]<<8)|(vertexPixelBuffer[2]);

        if (vertexId !== 0) {
            let geometries = [...data.values()];

            if (geometries[vertexId-1]) {
                item = geometries[vertexId-1];
            }
        }

        this.renderer.setRenderTarget(null);

        return item;
    };

    findWebGlLine(x, y, data) {
        let edgeId;
        let item = undefined;
        let edgePixelBuffer = new Uint8Array(4);
        let eventX = x;
        let eventY = y;

        // Used whenever the mouse pointer needs to find if it is on top of a node
        if (data.size === 0) {
            return;
        }

        if (!x) {
            // Implies this was initiated by an attempted drag
            if (d3 && d3.event) {
                // In contextMenu offsetX is part of root event
                eventX = d3.event.sourceEvent ? d3.event.sourceEvent.offsetX : d3.event.offsetX;
                // In contextMenu offsetY is part of root event
                eventY = d3.event.sourceEvent ? d3.event.sourceEvent.offsetY : d3.event.offsetY;
            }
        }

        if (typeof renderer === null) {
            return;
        }

        this.renderer.setRenderTarget(this.picking.pickingLineTexture);
        this.renderer.render(this.picking.linesPickingScene, this.camera);
        this.renderer.readRenderTargetPixels(
            this.picking.pickingLineTexture, eventX, this.picking.pickingLineTexture.height - eventY, 1, 1, edgePixelBuffer );

        edgeId = (edgePixelBuffer[0]<<16)|(edgePixelBuffer[1]<<8)|(edgePixelBuffer[2]);

        if (edgeId !== 0) {
            let geometries = [...data.values()];

            if (geometries[edgeId-1]) {
                item = geometries[edgeId-1];
            }
        }

        this.renderer.setRenderTarget(null);

        return item;
    };

    findWebGlArrow(x, y, data) {
        let arrowId;
        let item = undefined;
        let arrowPixelBuffer = new Uint8Array(4);

        if (typeof renderer === null) {
            return;
        }

        this.renderer.setRenderTarget(this.picking.pickingArrowTexture);
        this.renderer.render(this.picking.arrowsPickingScene, this.camera);
        this.renderer.readRenderTargetPixels(
            this.picking.pickingArrowTexture, x, this.picking.pickingArrowTexture.height - y, 1, 1, arrowPixelBuffer );

        arrowId = (arrowPixelBuffer[0]<<16)|(arrowPixelBuffer[1]<<8)|(arrowPixelBuffer[2]);

        if (arrowId !== 0) {
            let geometries = [...data.values()];

            if (geometries[arrowId-1]) {
                item = geometries[arrowId-1];
            }
        }

        this.renderer.setRenderTarget(null);

        return item;
    };

}

export default Find;
