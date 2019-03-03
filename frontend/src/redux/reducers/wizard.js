import * as types from '../types';

const initial_state = {
  step: 1
};

export default (state = initial_state, action) => {
  switch (action.type) {
    case types.SET_STEP:
      return {
        ...state,
        step: action.data
      };

    default:
      return state;
  }
}
