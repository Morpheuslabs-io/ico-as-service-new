import * as types from '../types';
import moment from 'moment';

const initial_state = {
  errorName: '',
  errorTicker: '',
  errorDecimals: '',

  errorWalletAddress: '',
  errorEmailAddress: '',
  errorMincap: '',
  errorCustomGas: '',
  errorTiers: [{
    startError: '',
    endError: '',
    errorLock: '',
    errorRate: '',
    errorSupply: '',
    errorTierName: '',
  }],
};

export default (state = initial_state, action) => {
  switch (action.type) {
    case types.SET_ERROR:
      return {
        ...state,
        errorName: action.data.errorName,
        errorTicker: action.data.errorTicker,
        errorDecimals: action.data.errorDecimals,
        errorWalletAddress: action.data.errorWalletAddress,
        errorEmailAddress: action.data.errorEmailAddress,
        errorMincap: action.data.errorMincap,
        errorCustomGas: action.data.errorCustomGas,
        errorTiers: action.data.errorTiers,
      };

    default:
      return state;
  }
}
