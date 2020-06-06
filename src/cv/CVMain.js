import React, { Component } from 'react';
import Graph from './WebGlGraph/Graph';
import Textures from './WebGlGraph/Textures';

class CVMain extends Component {
    constructor(props) {
        super(props);

        this.state = {texturesLoaded: false};

        document.getElementById('loading-screen').style.display = 'none';
    }

    componentDidMount() {
        let self = this;
        let container = this.container;
        let width = container.offsetWidth;
        let height = container.offsetHeight;
        let texturesData;

        this.Graph = new Graph({container, width, height});

        texturesData = this.Graph.getTexturesData();

        if (texturesData.size > 0) {
            self.textures = new Textures({data: texturesData});
            self.textures.initWebGlTexture(() => self.setState({texturesLoaded: true}));
        } else {
            this.Graph.build();
        }
    }

    componentDidUpdate() {
        if (this.textures) {
            this.Graph.build(this.textures);
        } else {
            this.Graph.build();
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }

    render() {
        const style = {
            width: 100 + '%',
            height: 100 + '%'
        };
        const cvStyle = {
            position: 'absolute',
            display: 'flex',
            width: '100%',
            height: '100%',
            color: 'rgb(45, 136, 165)',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1200px',
            zIndex: 0,
            textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #FFF, 1px 1px 0 #fff',
            opacity: 0.05,
            fontFamily: 'roboto condensed,sans-serif',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            overflow: 'hidden'
        };
        const graphStyle = {
            width: 100 + '%',
            height: 100 + '%',
            zIndex: 1,
            position: 'relative'
        };
        const tooltipStyle = {
            width: '200px',
            position: 'absolute',
            top: 0,
            left: 0,
            background: '#0a3438',
            border: '1px solid #184350',
            borderRadius: '5px',
            zIndex: 2,
            color: '#fff',
            fontSize: '14px',
            //fontFamily: 'monospace',
            fontFamily: 'noto sans,sans-serif',
            padding: '5px',
            flexDirection: 'column',
            letterSpacing: '0.1pt',
            textTransform: 'none',
            display: 'none'
        };

        return (
            <div style={style}>
                <div style={cvStyle}>CV</div>
                <div style={graphStyle} ref={element => { this.container = element }}/>
                <div style={tooltipStyle} className='info-tooltip' />
            </div>
        )
    }
}

export default CVMain;
