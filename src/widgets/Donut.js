import Tooltip from './Tooltip.js'

class Donut {
    constructor(props) {
        let self = this;
        this.container = props.container;
        this.canvas = props.canvas;
        this.pixelRatio = props.pixelRatio;
        this.animating = false;
        this.hoveredDonutAndSegment = null;
        this.geometries = new Map();
        this.Tooltip = new Tooltip({container: this.container, options: {width: 150, height: 80}});
        this.canvas.onmousemove = e => {
            this.hover(e);
        };
    };

    build(data, options) {
        this.buildGeometries(data, options.config);
        this.draw(options);
    };

    draw(options) {
        const context = this.canvas.getContext('2d');

        let animateSegments = progress => {
            this.animating = progress < 1;
            context.clearRect(0,0 , context.canvas.width, context.canvas.height);

            for (let item of this.geometries) {
                let geometry = item[1];

                const angles = this.percentsToAngles(geometry.percents);

                angles.forEach((angle, index) => {
                    let cumulativeAngle = angle.start + angle.end * progress;
                    let angleEnd = cumulativeAngle < angle.end ? cumulativeAngle : angle.end;

                    context.beginPath();
                    context.fillStyle = geometry.colors[index];
                    context.lineWidth = 1;
                    context.moveTo(geometry.x, geometry.y);
                    context.arc(geometry.x, geometry.y, geometry.radius, angle.start, angleEnd);
                    context.lineTo(geometry.x, geometry.y);
                    context.stroke();
                    context.fill();

                    if (geometry.innerRadius && geometry.innerColor) {
                        context.beginPath();
                        context.fillStyle = geometry.innerColor;
                        context.arc(geometry.x, geometry.y, geometry.innerRadius, 0, Math.PI * 2);
                        context.fill();
                    }
                })
            }
        };
        let buildSegments = options => {
            let hovered = options ? options.hovered: null;

            this.hoveredDonutAndSegment = null;

            context.clearRect(0,0 , context.canvas.width, context.canvas.height);

            for (let item of this.geometries) {
                let geometry = item[1];
                const angles = this.percentsToAngles(geometry.percents);

                angles.forEach((angle, index) => {
                    context.beginPath();
                    context.fillStyle = geometry.colors[index];
                    context.strokeStyle = '#000';
                    context.lineWidth = 1;
                    context.moveTo(geometry.x, geometry.y);
                    context.arc(geometry.x, geometry.y, geometry.radius, angle.start, angle.end);
                    context.lineTo(geometry.x, geometry.y);
                    context.stroke();
                    context.fill();

                    if (geometry.innerRadius && geometry.innerColor) {
                        context.beginPath();
                        context.fillStyle = geometry.innerColor;
                        context.arc(geometry.x, geometry.y, geometry.innerRadius, 0, Math.PI * 2);
                        context.fill();
                    }
                });

                if (hovered !== null) {
                    angles.forEach((angle, index) => {
                        context.beginPath();
                        context.fillStyle = geometry.colors[index];
                        context.strokeStyle = '#000';
                        context.lineWidth = 1;
                        context.moveTo(geometry.x, geometry.y);
                        context.arc(geometry.x, geometry.y, geometry.radius, angle.start, angle.end);
                        context.lineTo(geometry.x, geometry.y);

                        if (context.isPointInPath(hovered.x * this.pixelRatio, hovered.y * this.pixelRatio) && this.hoverGeometry(hovered) === item[0] && !this.animating) {
                            context.lineWidth = 3;
                            context.strokeStyle = '#d5ece9';
                            context.stroke();
                            context.fill();
                            this.hoveredDonutAndSegment = [item[0], index];
                        }

                        if (geometry.innerRadius && geometry.innerColor) {
                            context.beginPath();
                            context.fillStyle = geometry.innerColor;
                            context.arc(geometry.x, geometry.y, geometry.innerRadius, 0, Math.PI * 2);
                            context.fill();
                        }
                    });
                }
            }
        };

        if (options && options.animate) {
            this.animate({
                duration: 2000,
                // https://learn.javascript.ru/js-animation
                timing(timeFraction) {
                    return 1 - Math.sin(Math.acos(timeFraction));
                },
                draw(progress) {
                    animateSegments(progress);
                }
            });
        } else if (options && options.hovered) {
            buildSegments({hovered: options.hovered});
        } else {
            buildSegments();
        }
    };

    hover(event) {
        // important: correct mouse position:
        let rect = this.canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        let hoveredGeometry = this.isPointInsideDonut({x, y}, this.geometries);

        if (hoveredGeometry.length > 0) {
            this.canvas.style.cursor = 'pointer';
            this.draw({hovered: {id: hoveredGeometry, x: x, y: y } });

            let tooltipInfo = this.getHoveredDonutAndSegment();
            let tooltipBorderColor = null;
            let tooltipHeader = null;
            let tooltipLabel = null;
            let tooltipNumber = null;
            if (tooltipInfo !== null) {
                tooltipBorderColor = this.geometries.get(tooltipInfo[0]).colors[tooltipInfo[1]];
                tooltipHeader = this.geometries.get(tooltipInfo[0]).headerLabel;
                tooltipLabel = this.geometries.get(tooltipInfo[0]).labels[tooltipInfo[1]];
                tooltipNumber = this.geometries.get(tooltipInfo[0]).rawData[tooltipInfo[1]];
            }

            this.Tooltip.show({x, y, tooltipBorderColor, tooltipHeader, tooltipLabel, tooltipNumber});
        } else {
            this.canvas.style.cursor = 'default';
            this.draw();
            this.Tooltip.hide();
        }
    };

    buildGeometries(data, config) {
        for (let item of data) {
            if (item[1].x && item[1].y) {
                let radius = 10;
                let innerRadius = 5;
                let innerColor = '#0a1a1f';
                let colors = ['green'];
                let rawData = null;
                let percents = [100];
                let labels = [''];

                if (config) {
                    if (config.radius)  radius = this.checkParam(config.radius, item[1], item[0]);
                    if (config.innerRadius)  innerRadius = this.checkParam(config.innerRadius, item[1], item[0]);
                    if (config.innerColor)  innerColor = this.checkParam(config.innerColor, item[1], item[0]);
                    if (config.colors)  colors = this.checkParam(config.colors, item[1], item[0]);
                    if (config.rawData) rawData = this.checkParam(config.rawData, item[1], item[0]);
                    if (config.percents) percents = this.checkParam(config.percents, item[1], item[0]);
                    if (config.labels) labels = this.checkParam(config.labels, item[1], item[0]);
                }

                this.geometries.set(item[0], {
                   headerLabel: item[0],
                   x: item[1].x,
                   y: item[1].y,
                   radius: radius,
                   //innerRadius: innerRadius,
                   //innerColor: innerColor,
                   colors: colors,
                   startAngle: Math.PI * 1.5,
                   endAngle: Math.PI,
                   anticlockwise: false,
                   rawData: rawData,
                   percents: percents,
                   labels: labels
                });
            }
        }
    }

    percentsToAngles(percents) {
      const percentForRad = 0.062831853071796;
      const rads = percents.map(percent => percent * percentForRad);
      const angles = [];
      let startAngle = Math.PI * 1.5;
      let endAngle = Math.PI * 1.5;

      rads.forEach(rad => {
          startAngle = endAngle;
          endAngle += rad;
          angles.push({start: startAngle, end: endAngle})
      });

      return angles;
    };

    animate({timing, draw, duration}) {
        let start = performance.now();

        requestAnimationFrame(function animate(time) {
            // timeFraction изменяется от 0 до 1
            let timeFraction = (time - start) / duration;
            if (timeFraction > 1) timeFraction = 1;

            // вычисление текущего состояния анимации
            let progress = timing(timeFraction);

            draw(progress); // отрисовать её

            if (timeFraction < 1) {
                requestAnimationFrame(animate);
            }
        });
    }

    isPointInsideDonut(point, geometries) {
        let items = [];

        for (let item of geometries) {
            let distPoints = (point.x - item[1].x) * (point.x - item[1].x) + (point.y - item[1].y) * (point.y - item[1].y);
            let sqrRadius = item[1].radius * item[1].radius;

            if (distPoints < sqrRadius) {
                items.push(item[0]);
            }
        }

        return items;
    }

    hoverGeometry(hovered) {
      if (hovered.id.length > 1) {
          return hovered.id[hovered.id.length -1];
      } else {
          return hovered.id[0];
      }
    };

    getHoveredDonutAndSegment() {
        return this.hoveredDonutAndSegment;
    }

    checkParam(param, item, key) {
      let result = param;

      if (param instanceof Function) {
          result = param(item, key);
      }

      return result;
    };

    resize(width, height, pixelRatio) {
        this.canvas.width = width * pixelRatio;
        this.canvas.height = height * pixelRatio;
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        let context = this.canvas.getContext('2d');
        context.scale(pixelRatio, pixelRatio);
    };
}

export default Donut;
