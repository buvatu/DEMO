import { SET_ERROR_MESSAGE, SET_LOADING_VALUE, SET_MATERIAL_LIST_VALUE, SET_SUBMIT_VALUE } from '../constants';

const initState = {
  errorMessage: '',
  submitResult: '',
  isLoading: false,
  materialList: [],
};

const common = (state = initState, action) => {
  switch (action.type) {
    case SET_ERROR_MESSAGE:
      return { ...state, errorMessage: action.payload };
    case SET_SUBMIT_VALUE:
      return { ...state, submitResult: action.payload };
    case SET_LOADING_VALUE:
      return { ...state, isLoading: action.payload };
    case SET_MATERIAL_LIST_VALUE:
      return { ...state, materialList: action.payload };
    default:
      return state;
  }
};

export default common;
