import { combineReducers } from 'redux';

import pomberCovidData from './pomberCovidData';
import styleTheme from './styleTheme';
import turnOnOffVideo from './turnOnOffVideo';

export default combineReducers({
    pomberCovidData,
    styleTheme,
    turnOnOffVideo
});
