import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas/dist/html2canvas.min';

class Reporter {
    constructor(props) {
        this.config = props.config;
        this.sizesScheema = {
            a4: {
                dpi300: {width: 2480, height: 3508},
                dpi72: {width: 595, height: 842}
            }
        };
        this.elementsScheema = {
          default1: [
              {
                  id: 'widget_0', width: 260, height: 300, left: 300, top: 140, type: 'widget'
              },
              {
                  id: 'text_0', width: 260, height: 40, left: 300, top: 455, type: 'text', source: 'widget_0'
              },
              {
                  id: 'widget_1', width: 260, height: 230, left: 300, top: 520, type: 'widget'
              },
              {
                  id: 'text_1', width: 260, height: 40, left: 300, top: 765, type: 'text', source: 'widget_1'
              },

              {
                  id: 'text_2', width: 530, height: 70, left: 30, top: 45, type: 'text', textClass: 'header', reportSource: 'reportHeader'
              },
              {
                  id: 'text_3', width: 240, height: 355, left: 30, top: 140, type: 'text', analizer: true, analizerSource: 'widget_0'
              },
              {
                  id: 'text_4', width: 240, height: 285, left: 30, top: 520, type: 'text', analizer: true, analizerSource: 'widget_1'
              }
          ],
          default2: [
              {
                  id: 'widget_0', width: 490, height: 300, left: 50, top: 100, type: 'widget'
              },
              {
                  id: 'text_0', width: 490, height: 40, left: 50, top: 415, type: 'text', source: 'widget_0'
              },
              {
                  id: 'widget_1', width: 320, height: 265, left: 50, top: 485, type: 'widget'
              },
              {
                  id: 'text_1', width: 320, height: 40, left: 50, top: 765, type: 'text', source: 'widget_1'
              },

              {
                  id: 'text_2', width: 490, height: 40, left: 50, top: 40, type: 'text', textClass: 'header'
              },
              {
                  id: 'text_3', width: 150, height: 320, left: 390, top: 485, type: 'text', analizer: true, analizerSource: 'widget_0'
              }
          ],
        }
    }

    getSize(format, dpi = 72) {
        return this.sizesScheema[format]['dpi' + dpi];
    }

    getElementsScheema(type) {
        return this.elementsScheema[type];
    }

    static export(docDOMPages, name) {
        let pdf = new jsPDF('p', 'mm', 'a4');
        let pagesLength = docDOMPages.length - 1;
        // Make sure that all async iterations follows in chain
        let pagesGeneration = elementIndex => {
            html2canvas(docDOMPages[elementIndex], {
                //allowTaint: true,
                scale: 2,
                useCORS: true
            }).then(canvas => {
                let imgData = canvas.toDataURL("image/jpeg", 1.0);
                let hratio = canvas.height / canvas.width;
                let width = pdf.internal.pageSize.getWidth();
                let height = width * hratio;

                pdf.addImage(imgData, 'JPEG', 0, 0, width, height);

                if (elementIndex === pagesLength){
                    pdf.save(name + '.pdf');
                } else{
                    pdf.addPage();
                    pagesGeneration(elementIndex + 1);
                }
            });
        };

        pagesGeneration(0);
    }
}

export default Reporter;
