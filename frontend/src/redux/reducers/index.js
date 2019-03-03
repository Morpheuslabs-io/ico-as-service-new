import { combineReducers } from 'redux';

import wizard from './wizard';
import step1 from './step1';
import step2 from './step2';
import step3 from './step3';
import step5 from './step5';
import error from './error';
import deploy from './deploy';
import token from './token';

export default combineReducers({
  wizard,
  step1,
  step2,
  step3,
  step5,
  error,
  deploy,
  token,
});
