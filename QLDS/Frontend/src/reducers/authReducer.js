import { ACCESS_TOKEN, COMPANY_ID, COMPANY_NAME, EMAIL, LOGIN, LOGOUT, ROLE, ROLE_NAME, STATUS, USERNAME, USER_ID } from '../constants';

const initState = {
  isAuthenticated: localStorage.getItem(ACCESS_TOKEN) !== null,
  userID: localStorage.getItem(USER_ID),
  username: localStorage.getItem(USERNAME),
  email: localStorage.getItem(EMAIL),
  role: localStorage.getItem(ROLE),
  roleName: localStorage.getItem(ROLE_NAME),
  isActive: localStorage.getItem(STATUS) === 'A',
  companyID: localStorage.getItem(COMPANY_ID),
  companyName: localStorage.getItem(COMPANY_NAME),
};

const auth = (state = initState, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        isAuthenticated: true,
        userID: action.payload.userID,
        username: action.payload.username,
        email: action.payload.email,
        role: action.payload.role,
        roleName: action.payload.roleName,
        isActive: action.payload.isActive,
        companyID: action.payload.companyID,
        companyName: action.payload.companyName,
      };
    case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        userID: '',
        username: '',
        email: '',
        role: '',
        roleName: '',
        address: '',
        isActive: false,
        companyID: '',
        companyName: '',
      };
    default:
      return state;
  }
};

export default auth;
