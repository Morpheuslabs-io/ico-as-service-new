import * as types from '../types';

const initial_state = {
  whitelist_cap: true
};

export default (state = initial_state, action) => {
  switch (action.type) {
    case types.SET_WHITELIST_CAP:
      return {
        ...state,
        whitelist_cap: action.data.whitelist_cap
      };

    default:
      return state;
  }
}
