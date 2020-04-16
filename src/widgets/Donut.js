class Donut {
    constructor(props) {
        this.canvas = props.canvas;
        this.animating = false;
        this.hoveredDonutAndSegment = null;
    };

    build(geometries, options) {
        const context = this.canvas.getContext('2d');

        let animateSegments = progress => {
            this.animating = progress < 1;
            context.clearRect(0,0 , context.canvas.width, context.canvas.height);

            for (let item of geometries) {
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
            let hovered = options.hovered;

            this.hoveredDonutAndSegment = null;

            context.clearRect(0,0 , context.canvas.width, context.canvas.height);

            for (let item of geometries) {
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

                angles.forEach((angle, index) => {
                    context.beginPath();
                    context.fillStyle = geometry.colors[index];
                    context.strokeStyle = '#000';
                    context.lineWidth = 1;
                    context.moveTo(geometry.x, geometry.y);
                    context.arc(geometry.x, geometry.y, geometry.radius, angle.start, angle.end);
                    context.lineTo(geometry.x, geometry.y);

                    if (context.isPointInPath(hovered.x, hovered.y) && this.hoverGeometry(hovered) === item[0] && !this.animating) {
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
        };

        if (options.animate) {
            this.animate({
                duration: 1000,
                // https://learn.javascript.ru/js-animation
                timing(timeFraction) {
                    return 1 - Math.sin(Math.acos(timeFraction));
                },
                draw(progress) {
                    animateSegments(progress);
                }
            });
        } else if (options.hovered) {
            buildSegments({hovered: options.hovered});
        }
    };

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
}

export default Donut;