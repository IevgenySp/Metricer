import { combineReducers } from 'redux';

import pomberCovidData from './pomberCovidData';
import styleTheme from './styleTheme';

export default combineReducers({
    pomberCovidData,
    styleTheme
});
