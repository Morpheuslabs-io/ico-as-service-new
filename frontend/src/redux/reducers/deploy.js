import * as types from '../types';

const TIER_INITIAL_VALUES = {
  pricing_strategy: false,
  crowdsale: false,
  finalize_agent: false,
  register_tiers: false,
  register_crowdsale: false,
  allow_crowdsale: false,
  allow_finalize: false,
  register_whitelisted: false,
  register_finalize: false,
  register_token: false,
};

const initial_state = {
  safemath: false,
  token: false,
  crowdsale_address: false,
  reserve_token: false,
  vesting: false,
  ownership: false,
  d_tiers: [TIER_INITIAL_VALUES],
};

export default (state = initial_state, action) => {
  switch (action.type) {
    case types.SET_DEPLOY:
      return {
        ...state,
        safemath: action.data.safemath,
        token: action.data.token,
        crowdsale_address: action.data.crowdsale_address,
        reserve_token: action.data.reserve_token,
        ownership: action.data.ownership,
        vesting: action.data.vesting,
        d_tiers: action.data.d_tiers,
      };

    default:
      return state;
  }
}
