
class Analizer {
    constructor(props) {
        this.config = props.config;

    }

    // Source: https://stackoverflow.com/questions/14161990/how-to-implement-growth-function-in-javascript
    static growth(known_y, known_x, new_x, use_const) {
        // default values for optional parameters:
        if ( typeof( known_x ) == 'undefined' ) {
            known_x = [];
            for ( let i = 1; i <= known_y.length; i++ ) known_x.push(i);
        }
        if ( typeof( new_x ) == 'undefined' ) {
            new_x = [];
            for ( let i = 1; i <= known_y.length; i++ ) new_x.push(i);
        }
        if ( typeof( use_const ) == 'undefined' ) use_const = true;

        // calculate sums over the data:
        let n = known_y.length;
        let avg_x = 0;
        let avg_y = 0;
        let avg_xy = 0;
        let avg_xx = 0;

        for ( let i = 0; i < n; i++ ) {
            let x = known_x[i];
            let y = Math.log( known_y[i] );

            avg_x += x;
            avg_y += y;
            avg_xy += x*y;
            avg_xx += x*x;
        }
        avg_x /= n;
        avg_y /= n;
        avg_xy /= n;
        avg_xx /= n;

        // compute linear regression coefficients:
        let alpha;
        let beta;

        if ( use_const ) {
            beta = (avg_xy - avg_x*avg_y) / (avg_xx - avg_x*avg_x);
            alpha = avg_y - beta*avg_x;
        } else {
            beta = avg_xy / avg_xx;
            alpha = 0;
        }
        // console.log("alpha = " + alpha + ", beta = " +  beta);

        // compute and return result array:
        let new_y = [];
        for ( let i = 0; i < new_x.length; i++ ) {
            new_y.push( Math.exp( alpha + beta * new_x[i] ) );
        }
        return new_y;
    }

}

export default Analizer;
