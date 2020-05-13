import React, { Component } from 'react';
import Reporter from '../Reporter.js';
import ReactReporterText from './ReactReporterText';

class ReactReporter extends Component {
    constructor(props) {
        super(props);
        this.container = props.container;
        this.config = props.config;
        this.Reporter = new Reporter(props.config);
        this.pages = 2;

        let reporterScheema = {};
        let textScheema = {};

        for (let i = 0; i < this.pages; i++) {
            reporterScheema[i] = {};
            textScheema[i] = {};
            let scheemaId = 'default' + (i + 1);

            this.Reporter.getElementsScheema(scheemaId).forEach((item, index) => {
                if (item.type === 'widget') {
                    reporterScheema[i]['paper-block-' + i + '-' + index] = {
                        id: item.id,
                        width: item.width,
                        height: item.height,
                        left: item.left,
                        top: item.top,
                        widgetId: null
                    };
                } else if (item.type === 'text') {
                    textScheema[i]['paper-block-' + i + '-' + index] = {
                        id: item.id,
                        source: item.source ? item.source : null,
                        width: item.width,
                        height: item.height,
                        left: item.left,
                        top: item.top,
                        widgetId: null,
                        textClass: item.textClass ? item.textClass : null
                    };

                    //TODO: Temporery hardcoded part
                    if (item.reportSource && item.reportSource === 'reportHeader') {
                        textScheema[i]['paper-block-' + i + '-' + index].text = this.config['reportHeader'];
                    }
                }
            });
        }

        this.state = {width: 0, height: 0, reporterScheema, textScheema};
    }

    updateDimensions() {
        let container = this.container;

        this.setState({
            width: container.offsetWidth,
            height: container.offsetHeight
        });
    };

    drag(ev) {
        ev.dataTransfer.setData('widgetId', ev.target.getAttribute('data-id'));
    }

    dragEnter(ev) {
        ev.target.style.color = 'rgba(139, 195, 74, 0.8)';
    }

    dragLeave(ev) {
        ev.target.style.color = '#ccc';
    }

    allowDrop(ev) {
        ev.preventDefault();
    }

    drop(ev) {
        ev.preventDefault();
        // ev.target - top element of event
        // ev.currentTarget - root element on which event originally fired
        let containerClass = ev.currentTarget.className.split(' ')[1];
        let widgetId = ev.dataTransfer.getData('widgetId');
        let reporterScheema = this.state.reporterScheema;
        let ids = containerClass.split('-');
        let pageId = ids[ids.length - 2];
        reporterScheema[pageId][containerClass].widgetId = widgetId;

        this.setState({reporterScheema})
    }

    export() {
        // div.reporter-document-wrapper needed to provide proper scrolling work
        let docPages = document.querySelector(".reporter-document-wrapper").childNodes;
        let name = this.config.reportName ? this.config.reportName : 'default-report';
        // Action needed for correct capturing of element by html2canvas library
        window.scrollTo(0,0);
        Reporter.export(docPages, name);
    }

    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions.bind(this));
        //this.buildChart(this.container);
    }

    componentDidUpdate() {
        //this.updateChart(this.container);
    }

    shouldComponentUpdate(nextProps, nextState) {
        /*return nextProps.chart !== this.props.chart ||
            nextState.animationLayerActive !== this.state.animationLayerActive;*/
        return true;
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions.bind(this));
    }

    render() {
        const docSize = this.config.documentSize ? this.config.documentSize : ['a4', 72];
        const dimensions = this.Reporter.getSize(...docSize);
        const style = {
          width: dimensions.width + 'px',
          height: dimensions.height + 'px'
        };
        const headerTitle = 'Document: ' + docSize[0] + ', Resolution: ' + docSize[1] + 'dpi';
        const widgets = this.config.widgets.map((widget, index) =>
           <div key={index} className={"reporter-icon"} title={widget.name}>
               <div className={"reporter-icon-style reporter-icon-" + widget.type} data-id={widget.id} draggable={true} onDragStart={this.drag}>
               </div>
               {widget.subicon !== undefined ? <div className="reporter-subicon" style={{background: widget.subicon.color}}>{widget.subicon.label}</div> : null}
           </div>);
        const controls = [{name: 'Download', type: 'download'}].map((control, index) =>
            <div key={index} className={"reporter-control"} title={control.name}>
                <div className={"reporter-control-style reporter-control-" + control.type}>
                </div>
            </div>
        );

        // Generate document structure
        const docStructure = (pages, scheemas) => {
          let docPages = [];
          let pageStructure = pageId => {
              let pageScheema = this.state.reporterScheema[pageId];

              // Get all widgets blocks
              return Object.keys(pageScheema).map((key, index) => {
                  let item = pageScheema[key];
                  let itemStyle = {background: this.config.theme === 'dark' ? 'rgb(10, 26, 31)' : 'none', width: '100%', height: '100%'};
                  // Map needs unique id of container
                  let getComponent = () => {
                      let component;

                      if (this.config.widgets[item.widgetId].type === 'map') {
                          component = this.config.widgets[item.widgetId].component(pageId + '_' + index);
                      } else {
                          component = this.config.widgets[item.widgetId].component;
                      }

                      return component;
                  };
                  let widget = item.widgetId !== null ?
                      <div style={itemStyle}>{getComponent()}</div> : <div className="paper-block-placeholder">Drop widget here</div>;
                  let style = {width: item.width + 'px', height: item.height + 'px',
                      marginLeft: item.left + 'px', marginTop: item.top + 'px'};


                  return (<div className={'paper-block ' + key} key={index} style={style}
                               onDrop={this.drop.bind(this)}
                               onDragOver={this.allowDrop}
                               onDragEnter={this.dragEnter}
                               onDragLeave={this.dragLeave}>
                      {widget}
                  </div>);
              });
          };
          let textStructure = pageId => {
              let textScheema = this.state.textScheema[pageId];
              let textWidgets = [];

              // Get all text blocks
              Object.keys(textScheema).map((key, index) => {
                  let item = textScheema[key];
                  let text = '';
                  let style = {width: item.width + 'px', height: item.height + 'px',
                      marginLeft: item.left + 'px', marginTop: item.top + 'px'};

                  if (item.source !== undefined && item.source !== null) {
                      let block = this.state.reporterScheema[pageId];
                      let blockKey = Object.keys(block).find(key => block[key].id === item.source);
                      let widgetId = block[blockKey].widgetId;

                     if (widgetId !== null) {
                         if (this.config.widgets[widgetId] && this.config.widgets[widgetId].description) {
                             text = 'Fig.' + block[blockKey].id.split('_')[1] + ' ' + this.config.widgets[widgetId].description;
                         }
                     }
                  }

                  textWidgets.push(<div className="paper-block-text" style={style} key={index}><ReactReporterText config={item} text={text}/></div>);
              });

              return textWidgets;
          };

          for (let i = 0; i < pages; i++) {
              docPages.push(<div className="reporter-paper" key={i} style={style}>{pageStructure(i)}{textStructure(i)}</div>);
          }

          return docPages;
        };

        return (
            <div className="reporter-main">
                <div className="reporter-header">{/*headerTitle*/}</div>
                <div className="reporter-body">
                    <div className="reporter-toolbar-left">
                        {widgets}
                    </div>
                    <div className="reporter-document">
                        <div className="reporter-document-wrapper">
                            {docStructure(this.pages)}
                        </div>
                    </div>
                    <div className="reporter-toolbar-right" onClick={this.export.bind(this)}>
                        {controls}
                    </div>
                </div>
            </div>
        )
    }
}

export default ReactReporter;
