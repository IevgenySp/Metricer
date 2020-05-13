import React, { Component } from 'react';

class ReactReporterText extends Component {
    constructor(props) {
        super(props);
        this.config = this.props.config;
        this.state = {mode: 'read', text: this.props.text || ''};
    }

    componentDidMount() {

    }

    componentDidUpdate() {
        if (this.textArea) {
            this.textArea.focus();
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.mode !== this.state.mode
            || nextProps.text !== this.props.text
            || nextState.text !== this.state.text;
    }

    handleClick(ev) {
        this.setState({
            mode: 'write'
        })
    }

    handleMouseEnter(ev) {

    }

    handleMouseLeave(ev) {
        this.setState({
            mode: 'read',
            text: this.text
        });
    }

    handleTextChange(ev) {
        this.text = ev.target.value;
    }

    handleToolboxClean(ev) {
       ev.stopPropagation();
       this.text = '';
       this.setState({
           mode: 'read',
           text: ''
       })
    }

    handleToolboxSource(ev) {
        ev.stopPropagation();
        if (this.config.text) {
            this.text = this.config.text;
            this.setState({
                mode: 'read',
                text: this.config.text
            })
        }
    }

    render() {
        const text = this.props.text || '';
        const style = {
            width: this.config.width + 'px',
            height: this.config.height + 'px',
            marginLeft: this.config.left + 'px',
            marginTop: this.config.top + 'px'
        };
        const textToolbox = () => {
            return <div className="react-reporter-text-toolbox"
                        ref={element => { this.textToolbox = element }}>
                <div className="react-reporter-text-toolbox-item react-reporter-text-toolbox-clear" title="clear section" onClick={this.handleToolboxClean.bind(this)}>C</div>
                <div className="react-reporter-text-toolbox-item react-reporter-text-toolbox-source" title="get text from source" onClick={this.handleToolboxSource.bind(this)}>S</div>
                <div className="react-reporter-text-toolbox-item react-reporter-text-toolbox-analisis" title="get text from data analysis">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" enableBackground="new 0 0 200 200" height="40px" id="Layer_1" version="1.1" viewBox="0 0 200 200" width="20px" xmlSpace="preserve"><g>
                        <path d="M100,94.456c-1.713,0-3.323-0.667-4.534-1.878c-1.214-1.211-1.881-2.823-1.881-4.539V30.155   c0-0.464-0.181-0.903-0.51-1.232c-0.659-0.655-1.806-0.658-2.462-0.003c-0.332,0.332-0.514,0.771-0.514,1.235v44.217   c0,1.713-0.667,3.323-1.878,4.534c-2.428,2.428-6.653,2.425-9.073,0c-1.212-1.211-1.879-2.823-1.879-4.534V48.209   c0-0.467-0.18-0.904-0.508-1.23c-0.664-0.666-1.807-0.661-2.467-0.003c-0.329,0.329-0.509,0.766-0.509,1.233v11.513   c0,1.709-0.666,3.32-1.876,4.533c-2.423,2.426-6.642,2.426-9.075,0.006c-1.215-1.218-1.881-2.829-1.881-4.539   c0-0.467-0.182-0.906-0.511-1.235c-0.328-0.329-0.767-0.511-1.232-0.511H21.858v-4.672H59.21c1.714,0,3.325,0.667,4.537,1.879   c1.211,1.214,1.878,2.825,1.878,4.539c0,0.464,0.182,0.901,0.511,1.232c0.655,0.65,1.808,0.656,2.467-0.001   c0.328-0.329,0.508-0.766,0.508-1.23V48.209c0-1.716,0.667-3.328,1.881-4.537c2.422-2.423,6.652-2.425,9.071,0.001   c1.209,1.205,1.878,2.818,1.878,4.536v26.163c0,0.466,0.184,0.903,0.513,1.233c0.656,0.655,1.807,0.655,2.465-0.001   c0.326-0.328,0.508-0.766,0.508-1.232V30.155c0-1.714,0.667-3.326,1.881-4.537c2.415-2.42,6.65-2.423,9.072,0.001   c1.211,1.209,1.879,2.821,1.879,4.536V88.04c0,0.467,0.18,0.904,0.509,1.232c0.66,0.659,1.804,0.659,2.464,0   c0.33-0.329,0.511-0.768,0.511-1.232V54.635c0-1.709,0.667-3.32,1.875-4.533c2.437-2.432,6.652-2.426,9.077-0.004   c1.214,1.215,1.881,2.826,1.881,4.537v9.333c0,0.467,0.181,0.904,0.507,1.232c0.656,0.655,1.807,0.657,2.467,0   c0.327-0.328,0.509-0.765,0.509-1.232V44.165c0-1.717,0.667-3.329,1.88-4.539c2.425-2.419,6.648-2.417,9.071,0   c1.213,1.218,1.88,2.829,1.88,4.539v25.394c0,0.464,0.18,0.902,0.508,1.229c0.661,0.66,1.806,0.664,2.467,0   c0.329-0.327,0.509-0.763,0.509-1.229v-9.839c0-1.711,0.668-3.322,1.879-4.536c1.209-1.212,2.819-1.879,4.538-1.879h37.352v4.672   H140.79c-0.467,0-0.904,0.181-1.231,0.508c-0.331,0.332-0.513,0.771-0.513,1.235v9.839c0,1.716-0.669,3.327-1.88,4.536   c-2.422,2.42-6.641,2.426-9.069,0c-1.213-1.209-1.881-2.822-1.881-4.536V44.165c0-0.466-0.183-0.904-0.511-1.236   c-0.648-0.645-1.805-0.654-2.466,0.006c-0.327,0.326-0.508,0.763-0.508,1.23v19.803c0,1.717-0.669,3.33-1.881,4.539   c-2.422,2.42-6.646,2.42-9.071-0.002c-1.211-1.211-1.877-2.821-1.877-4.537v-9.333c0-0.464-0.182-0.903-0.513-1.233   c-0.656-0.656-1.806-0.658-2.465,0.003c-0.326,0.328-0.51,0.767-0.51,1.23V88.04c0,1.711-0.667,3.323-1.878,4.536   C103.323,93.789,101.713,94.456,100,94.456z" fill="#D9D8D7"/><g><rect fill="#333C49" height="13.606" width="11.403" x="94.3" y="117.322"/><path d="M99.999,0C67.232,0,40.688,26.549,40.688,59.303c0,32.765,26.544,59.313,59.311,59.313    c32.755,0,59.313-26.549,59.313-59.313C159.312,26.549,132.754,0,99.999,0z M99.988,106.758    c-26.194,0-47.443-21.236-47.443-47.455c0-26.211,21.249-47.446,47.443-47.446c26.214,0,47.471,21.235,47.471,47.446    C147.459,85.521,126.202,106.758,99.988,106.758z" fill="#3F4A5A"/><path d="M111.219,136.322v52.476c0,6.185-5.014,11.202-11.217,11.202c-6.199,0-11.218-5.018-11.218-11.202v-52.476    H111.219z" fill="#3F4A5A"/>
                        <path d="M111.214,136.316H88.791v-1.383c0-1.019,0.391-2.052,1.172-2.833s1.801-1.172,2.823-1.172h14.433    c1.021,0,2.042,0.391,2.823,1.172s1.172,1.814,1.172,2.833V136.316z" fill="#E6E5E5"/></g></g>
                    </svg>
                </div>
            </div>
        };
        const textElement = () => {
          let textEl;
          let externalStyle = this.config.textClass ? this.config.textClass : '';

          if (this.props.text && this.props.text !== '') {
              if (this.state.mode === 'read') {
                  textEl = <div className="react-reporter-text-read-mode-external">{this.props.text}</div>
              } else if (this.state.mode === 'write') {
                  textEl = <textarea className={"react-reporter-text-area" + ' ' + externalStyle} defaultValue={this.props.text}
                                     onChange={this.handleTextChange.bind(this)}
                                     ref={element => { this.textArea = element }}/>
              }
          } else if (this.state.text && this.state.text !== '') {
              if (this.state.mode === 'read') {
                  textEl = <div className={"react-reporter-text-read-mode"  + ' ' +  externalStyle}>{this.state.text}</div>
              } else if (this.state.mode === 'write') {
                  textEl = <textarea className={"react-reporter-text-area"  + ' ' +  externalStyle} defaultValue={this.state.text}
                                     onChange={this.handleTextChange.bind(this)}
                                     ref={element => { this.textArea = element }}/>
              }
          } else {
              if (this.state.mode === 'read') {
                  textEl = <div className='paper-block-text-placeholder' style={{height: this.config.height + 'px'}}>Enter text here</div>;
              } else if (this.state.mode === 'write') {
                  textEl = <textarea className={"react-reporter-text-area"  + ' ' +  externalStyle} defaultValue={''}
                                     onChange={this.handleTextChange.bind(this)}
                                     ref={element => { this.textArea = element }}/>
              }
          }

          return textEl;
        };

        return (<div className="react-reporter-text"
                     onClick={this.handleClick.bind(this)}
                     onMouseEnter={this.handleMouseEnter.bind(this)}
                     onMouseLeave={this.handleMouseLeave.bind(this)}>
            {textToolbox()}
            {textElement()}
        </div>)
    }
}

export default ReactReporterText;
