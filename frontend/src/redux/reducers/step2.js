import * as types from '../types';

const initial_state = {
  name: '',
  ticker: '',
  decimals: 18,
  reserved_token: [],
};

export default (state = initial_state, action) => {
  switch (action.type) {
    case types.SET_STEP_2:
      return {
        ...state,
        name: action.data.name,
        ticker: action.data.ticker,
        decimals: action.data.decimals,
        reserved_token: action.data.reserved_token,
      };

    default:
      return state;
  }
}
