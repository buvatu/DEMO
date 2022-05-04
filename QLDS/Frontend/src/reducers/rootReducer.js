import { combineReducers } from 'redux';
import { LOGOUT } from '../constants';
import auth from './authReducer';
import common from './commonReducer';

const appReducer = combineReducers({
  auth,
  common,
});

const rootReducer = (state, action) => {
  if (action.type === LOGOUT) {
    // eslint-disable-next-line no-param-reassign
    state = undefined;
  }

  return appReducer(state, action);
};

export default rootReducer;
