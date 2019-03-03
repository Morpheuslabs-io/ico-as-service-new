import * as types from '../types';

const initial_state = {
  token: "",
};

export default (state = initial_state, action) => {
  switch (action.type) {
    case types.SET_TOKEN:
      return {
        ...state,
        token: action.data.token,
      };

    default:
      return state;
  }
}
