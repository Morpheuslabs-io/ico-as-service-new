import * as types from '../types';

export const setStep = (step) => (dispatch, getState) => {
  dispatch({
    type: types.SET_STEP,
    data: step
  });
};

export const setStep1 = (step1) => (dispatch, getState) => {
  dispatch({
    type: types.SET_WHITELIST_CAP,
    data: step1
  });
};

export const setStep2 = (step2) => (dispatch, getState) => {
  dispatch({
    type: types.SET_STEP_2,
    data: step2
  });
};

export const setStep3 = (step3) => (dispatch, getState) => {
  dispatch({
    type: types.SET_STEP_3,
    data: step3
  });
};

export const setStep5 = (step5) => (dispatch, getState) => {
  dispatch({
    type: types.SET_STEP_5,
    data: step5
  });
};

export const setError = (error) => (dispatch, getState) => {
  dispatch({
    type: types.SET_ERROR,
    data: error
  });
};

export const setDeploy = (deploy) => (dispatch, getState) => {
  dispatch({
    type: types.SET_DEPLOY,
    data: deploy
  });
};

export const setToken = (token) => (dispatch, getState) => {
  dispatch({
    type: types.SET_TOKEN,
    data: token
  });
};