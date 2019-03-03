import * as types from '../types';
import moment from 'moment';

const TIER_INITIAL_VALUES = {
  sequence: 1,
  tierName: 'Tier ',
  allowModifying: 'no',
  startDate: moment().add(1, 'day'),
  startTime: moment(),
  endDate: moment().add(2, 'day'),
  endTime: moment(),
  lockDate: moment().add(3, 'day'),
  unlockDate: moment().add(5, 'day'),
  rate: 0,
  supply: 0,
  whitelist: [],
};

const initial_state = {
  wallet_address: '',
  email_address: '',
  gasPrice: '3.01',
  mincap: 0,
  enableWhitelisting: 'no',
  tiers: [{...TIER_INITIAL_VALUES, tierName: 'Tier 1'}],
};

export default (state = initial_state, action) => {
  switch (action.type) {
    case types.SET_STEP_3:
      return {
        ...state,
        wallet_address: action.data.wallet_address,
        email_address: action.data.email_address,
        gasPrice: action.data.gasPrice,
        mincap: action.data.mincap,
        enableWhitelisting: action.data.enableWhitelisting,
        tiers: action.data.tiers,
      };

    default:
      return state;
  }
}
