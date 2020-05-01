//import * as d3 from "d3";
import {select} from 'd3-selection';

class Banner {
    constructor(props) {
        this.container = props.container;
        this.strings = props.strings || [];
    };

    build() {
      let splittedStrings = this.strings.map(string => {
          return string.split('');
      });
      let d3Container = select(this.container);
      let str = '';
      let counter = 0;
      let animateStr = (string, counter, i) => {
          setTimeout(() => {
              if (i === 0) {
                  str = string;
              } else {
                  str += string;
              }
              d3Container.text(str);
          },150 * counter)
      };
      splittedStrings.forEach((stringArr, index) => {
          stringArr.forEach((string, i) => {
              if (index > 0) {
                  setTimeout(() => {animateStr(string, counter++, i)}, 1000 * index);
              } else {
                  animateStr(string, counter++, i);
              }
          });
      });



      /*let sIndex = 0;
      let index = 0;
      let str = '';
      let animateStr = () => {
          str += splittedStrings[sIndex][index++];
          d3Container.text(str);
          if (index === splittedStrings[sIndex].length - 1) {
              sIndex++;
              if (splittedStrings[sIndex]) {
                  index = 0;
                  str = '';
              } else {
                  clearInterval(intr);
              }
          }
      };
      let intr = setInterval(animateStr, 150);*/

    };
}

export default Banner;
