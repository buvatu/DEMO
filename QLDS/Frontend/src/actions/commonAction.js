import { SET_ERROR_MESSAGE, SET_LOADING_VALUE, SET_SUBMIT_VALUE } from '../constants';

export const assignErrorMessage = (errorMessage) => ({
  type: SET_ERROR_MESSAGE,
  payload: errorMessage,
});

export const setLoadingValue = (isLoadingValue) => ({
  type: SET_LOADING_VALUE,
  payload: isLoadingValue,
});

export const setSubmitValue = (submitResult) => ({
  type: SET_SUBMIT_VALUE,
  payload: submitResult,
});
