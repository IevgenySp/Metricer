
const initialState = [];

export default function pomberCovidData(state = initialState, action){
    if (action.type === 'POMBER_COVID_DATA_UPDATE') {
        return action.payload;
    }
    return state;
}