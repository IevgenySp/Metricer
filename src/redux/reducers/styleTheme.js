import {getCookie, setCookie} from "../../accessors/cookies.accessor";

const styleCookie = getCookie('metriker-style-theme');
const initialState = styleCookie !== undefined ? styleCookie : 'dark';

export default function styleTheme(state = initialState, action){
    if (action.type === 'STYLE_THEME_CHANGE') {
        setCookie('metriker-style-theme', action.payload);
        return action.payload;
    }
    return state;
}
