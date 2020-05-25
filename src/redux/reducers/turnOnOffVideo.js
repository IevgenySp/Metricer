let initialState = false;

export default function turnOnOffVideo(state = initialState, action){
    if (action.type === 'TURN_ON_OFF_VIDEO') {
        return action.payload;
    }
    return state;
}
