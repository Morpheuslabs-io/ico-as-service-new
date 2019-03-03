import * as types from '../types';
import moment from 'moment';

const INIT_VESTING = {
  startVesting: moment().add(10, 'day'),
  endVesting: moment().add(15, 'day'),
  amount: 0,
};

const initial_state = {
  vestings: [],
};

export default (state = initial_state, action) => {
  switch (action.type) {
    case types.SET_STEP_5:
      return {
        ...state,
        vestings: action.data.vestings,
      };

    default:
      return state;
  }
}
