import { Button, InlineNotification, Loading, TextInput } from 'carbon-components-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { setCurrentLoggedInUser } from '../actions/authAction';
import { assignErrorMessage, setLoadingValue } from '../actions/commonAction';
import { login } from '../services';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userID: '',
      password: '',
      isUserIDInvalid: false,
      userIDErrorMessage: '',
      isPasswordInvalid: false,
      passwordErrorMessage: '',
      redirect: '',
    };
  }

  login = async () => {
    this.setState({ isUserIDInvalid: false, isPasswordInvalid: false });
    const { setErrorMessage, setLoading } = this.props;
    setErrorMessage('');
    const { userID, password } = this.state;
    let hasError = false;
    if (userID.trim() === '') {
      this.setState({ isUserIDInvalid: true, userIDErrorMessage: 'Tên tài khoản không thể bỏ trống' });
      hasError = true;
    }

    if (password.trim() === '') {
      this.setState({ isPasswordInvalid: true, passwordErrorMessage: 'Mật khẩu không thể bỏ trống' });
      hasError = true;
    }
    if (hasError) {
      return;
    }

    setLoading(true);
    try {
      const getLoginResult = await login(userID, password);
      const { setUserInfo } = this.props;
      setUserInfo(getLoginResult.data);
      if (getLoginResult.data.status === 'NA') {
        this.setState({ redirect: <Redirect to={`/user/update?userID=${userID}`} /> });
        return;
      }
      this.setState({ redirect: <Redirect to="/home" /> });
    } catch (error) {
      if (error.response === undefined) {
        setErrorMessage('Có lỗi khi kết nối tới máy chủ!!!');
        setLoading(false);
        return;
      }
      if (error.response.data == null) {
        this.setState({ isUserIDInvalid: true, userIDErrorMessage: 'Tên tài khoản không đúng' });
      } else {
        this.setState({ isPasswordInvalid: true, passwordErrorMessage: 'Mật khẩu không chính xác' });
      }
    }
    setLoading(false);
  };

  render() {
    const { userID, password, isUserIDInvalid, isPasswordInvalid, userIDErrorMessage, passwordErrorMessage, redirect } = this.state;
    if (redirect !== '') {
      return redirect;
    }
    const { common, setErrorMessage } = this.props;
    const { errorMessage, isLoading } = common;

    return (
      <div className="login">
        {isLoading && <Loading description="Loading data. Please wait..." withOverlay />}
        {/* Error Message */}
        <div className="bx--grid">
          <div className="bx--row">
            {errorMessage !== '' && <InlineNotification lowContrast kind="error" title={errorMessage} onCloseButtonClick={() => setErrorMessage('')} />}
          </div>
        </div>
        <br />

        <div className="bx--grid">
          <br />
          <br />
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-4" />
            <div className="bx--col-lg-4">
              <h4>Sử dụng tài khoản đã được cấp phát để đăng nhập vào hệ thống</h4>
            </div>
            <div className="bx--col-lg-4" />
          </div>
          <br />
          <br />
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-4" />
            <div className="bx--col-lg-4">
              <TextInput
                maxLength="64"
                id="username-TextInput"
                placeholder="Vui lòng nhập tài khoản"
                labelText="Tên đăng nhập"
                value={userID}
                onChange={(e) => this.setState({ userID: e.target.value, isUserIDInvalid: false })}
                invalid={isUserIDInvalid}
                invalidText={userIDErrorMessage}
              />
            </div>
            <div className="bx--col-lg-4" />
          </div>
          <br />
          <br />
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-4" />
            <div className="bx--col-lg-4">
              <TextInput
                maxLength="64"
                id="password-Password"
                type="password"
                labelText="Mật khẩu"
                placeholder="Vui lòng nhập mật khẩu chính xác"
                value={password}
                onChange={(e) => this.setState({ password: e.target.value, isPasswordInvalid: false })}
                invalid={isPasswordInvalid}
                invalidText={passwordErrorMessage}
              />
            </div>
            <div className="bx--col-lg-4" />
          </div>
          <br />
          <br />
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-4" />
            <div className="bx--col-lg-4">
              <Button onClick={() => this.login()}>Login</Button>
            </div>
            <div className="bx--col-lg-4" />
          </div>
          <br />
          <br />
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-4" />
            <div className="bx--col-lg-4">
              <p style={{ fontSize: 'inherit' }}>
                <strong>Điều khoản sử dụng:</strong>
                <br />
                Khi đăng nhập vào hệ thống, có nghĩa người thực thi sẽ cho hệ thống phép truy cập, sử dụng và lưu trữ các thông tin cá nhân đã được cung cấp cho
                hệ thống trước đó.
                <br />
                Nhân viên cần có ý thức bảo mật hệ thống để đảm bảo an toàn thông tin.
              </p>
            </div>
            <div className="bx--col-lg-4" />
          </div>
        </div>
      </div>
    );
  }
}

Login.propTypes = {
  setUserInfo: PropTypes.func.isRequired,
  setErrorMessage: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  common: PropTypes.shape({ errorMessage: PropTypes.string, isLoading: PropTypes.bool }).isRequired,
  auth: PropTypes.shape({
    userID: PropTypes.string,
    isActive: PropTypes.bool,
  }).isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  common: state.common,
});

const mapDispatchToProps = (dispatch) => ({
  setUserInfo: (userInfo) => dispatch(setCurrentLoggedInUser(userInfo)),
  setErrorMessage: (errorMessage) => dispatch(assignErrorMessage(errorMessage)),
  setLoading: (loading) => dispatch(setLoadingValue(loading)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
