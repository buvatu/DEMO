import { ACCESS_TOKEN, COMPANY_ID, COMPANY_NAME, EMAIL, LOGIN, LOGOUT, ROLE, ROLE_NAME, STATUS, USERNAME, USER_ID } from '../constants';

export const setCurrentLoggedInUser = (userInfo) => {
  localStorage.setItem(ACCESS_TOKEN, userInfo.token);
  localStorage.setItem(USER_ID, userInfo.userID);
  localStorage.setItem(USERNAME, userInfo.username);
  localStorage.setItem(EMAIL, userInfo.email);
  localStorage.setItem(ROLE, userInfo.role);
  localStorage.setItem(ROLE_NAME, userInfo.roleName);
  localStorage.setItem(STATUS, userInfo.status);
  localStorage.setItem(COMPANY_ID, userInfo.companyID);
  localStorage.setItem(COMPANY_NAME, userInfo.companyName);
  return {
    type: LOGIN,
    payload: {
      userID: userInfo.userID,
      username: userInfo.username,
      email: userInfo.email,
      role: userInfo.role,
      roleName: userInfo.roleName,
      isActive: userInfo.status === 'A',
      companyID: userInfo.companyID,
      companyName: userInfo.companyName,
    },
  };
};

export const removeCurrentLoggedInUser = () => {
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(USER_ID);
  localStorage.removeItem(USERNAME);
  localStorage.removeItem(EMAIL);
  localStorage.removeItem(COMPANY_ID);
  localStorage.removeItem(COMPANY_NAME);
  localStorage.removeItem(ROLE);
  localStorage.removeItem(ROLE_NAME);
  localStorage.removeItem(STATUS);
  return {
    type: LOGOUT,
    payload: {},
  };
};
