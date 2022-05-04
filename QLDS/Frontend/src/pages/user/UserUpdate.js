import { CloudUpload32 } from '@carbon/icons-react';
import {
  Button,
  Checkbox,
  ComposedModal,
  DatePicker,
  DatePickerInput,
  Dropdown,
  InlineNotification,
  Loading,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
} from 'carbon-components-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { assignErrorMessage, setLoadingValue, setSubmitValue } from '../../actions/commonAction';
import { getUserInfo, updateUserInfo } from '../../services';

class UserUpdate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userID: '',
      username: '',
      email: '',
      sex: 'M',
      dob: '',
      phoneNumber: '',
      role: '',
      roleName: '',
      roleList: [],
      companyList: [],
      companyID: '',
      address: '',
      changePasswordFlag: true,
      oldPassword: '',
      newPassword: '',
      retypePassword: '',
    };
  }

  componentDidMount = async () => {
    const { setLoading, location, setErrorMessage } = this.props;
    const params = new URLSearchParams(location.search);
    if (params == null) {
      setErrorMessage('Không có mã định danh nhân viên!!!');
      return;
    }
    const userID = params.get('userID');
    setLoading(true);
    try {
      const getUserInfoResult = await getUserInfo(userID);
      this.setState({
        userID,
        username: getUserInfoResult.data.username,
        email: getUserInfoResult.data.email,
        sex: getUserInfoResult.data.sex,
        dob: getUserInfoResult.data.dob,
        phoneNumber: getUserInfoResult.data.phoneNumber,
        role: getUserInfoResult.data.role,
        roleName: getUserInfoResult.data.roleName,
        roleList: [{ id: getUserInfoResult.data.role, label: getUserInfoResult.data.roleName }],
        address: getUserInfoResult.data.address,
        companyID: getUserInfoResult.data.companyID,
        companyList: [{ id: getUserInfoResult.data.companyID, label: getUserInfoResult.data.companyName }],
      });
      if (getUserInfoResult.data.status === 'NA') {
        setErrorMessage('Tài khoản của bạn chưa được kích hoạt. Bạn cần thay đổi mật khẩu để kích hoat tài khoản của mình.');
      }
    } catch (error) {
      setErrorMessage('Mã định danh nhân viên không đúng!!!');
    }
    setLoading(false);
  };

  formatDate = (inputDate) => {
    const yyyy = inputDate.getFullYear().toString();
    const mm = `0${inputDate.getMonth() + 1}`.slice(-2);
    const dd = `0${inputDate.getDate()}`.slice(-2);
    return `${dd}/${mm}/${yyyy}`;
  };

  updateUser = async () => {
    const { userID, username, email, sex, dob, phoneNumber, role, roleName, address, changePasswordFlag, oldPassword, newPassword, retypePassword } = this.state;
    const { auth, setLoading, setErrorMessage, setSubmitResult } = this.props;
    setErrorMessage('');
    let hasError = false;
    if (!changePasswordFlag && !auth.isActive) {
      setErrorMessage('Bạn cần đổi mật khẩu để kích hoạt tài khoản của mình.');
      hasError = true;
    }
    if (changePasswordFlag && (oldPassword === '' || newPassword === '')) {
      setErrorMessage('Mật khẩu không được bỏ trống.');
      hasError = true;
    }
    if (changePasswordFlag && newPassword !== retypePassword) {
      setErrorMessage('Mật khẩu mới gõ lại không chính xác. Vui lòng thử lại');
      this.setState({ retypePassword: '' });
      hasError = true;
    }
    if (hasError) {
      return;
    }
    setLoading(true);
    try {
      await updateUserInfo({ userID, username, email, sex, dob, phoneNumber, role, roleName, address }, oldPassword, newPassword);
      setSubmitResult(
        <div>
          Thông tin nhân viên được cập nhật thành công!. <br />
          Để kích hoạt tài khoản, bạn cần đăng xuất rồi đăng nhập trở lại.
        </div>
      );
    } catch (error) {
      setErrorMessage('Mật khẩu không đúng hoặc email mới đã có trong hệ thống. Vui lòng thử lại.');
    }
    setLoading(false);
  };

  render() {
    const {
      userID,
      username,
      email,
      sex,
      dob,
      phoneNumber,
      role,
      roleList,
      companyList,
      companyID,
      address,
      changePasswordFlag,
      oldPassword,
      newPassword,
      retypePassword,
    } = this.state;
    const { common, setErrorMessage, setSubmitResult, history } = this.props;
    const { errorMessage, isLoading, submitResult } = common;

    return (
      <div className="user-update">
        {/* Loading */}
        {isLoading && <Loading description="Loading data. Please wait..." withOverlay />}
        {/* Success Modal */}
        <ComposedModal
          className="btn-success"
          open={submitResult !== ''}
          size="sm"
          onClose={() => {
            setSubmitResult('');
            history.push('/home');
          }}
        >
          <ModalHeader iconDescription="Close" title={<div>Thao tác thành công</div>} />
          <ModalBody aria-label="Modal content">
            <div className="form-icon">
              <CloudUpload32 className="icon-prop" />
              <p className="bx--modal-content__text">{submitResult}</p>
            </div>
          </ModalBody>
          <ModalFooter
            onRequestSubmit={() => {
              setSubmitResult('');
              history.push('/home');
            }}
            primaryButtonText="OK"
            secondaryButtonText=""
          />
        </ComposedModal>
        {/* Error Message */}
        <div className="bx--grid">
          <div className="bx--row">
            {errorMessage !== '' && <InlineNotification lowContrast kind="error" title={errorMessage} onCloseButtonClick={() => setErrorMessage('')} />}
          </div>
        </div>
        <br />
        <div className="view-header--box">
          <h4>Cập nhật thông tin nhân viên</h4>
        </div>
        <br />

        <div className="bx--grid">
          <br />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="userID-TextInput"
                placeholder="Vui lòng nhập mã nhân viên"
                labelText="Mã định danh nhân viên"
                disabled
                value={userID}
                onChange={(e) => this.setState({ userID: e.target.value })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="username-TextInput"
                placeholder="Vui lòng nhập tên nhân viên"
                labelText="Tên nhân viên"
                value={username}
                onChange={(e) => this.setState({ username: e.target.value })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <Dropdown
                id="sex-Dropdown"
                titleText="Giới tính"
                label=""
                items={[
                  { id: 'M', label: 'Nam' },
                  { id: 'F', label: 'Nữ' },
                ]}
                selectedItem={[
                  { id: 'M', label: 'Nam' },
                  { id: 'F', label: 'Nữ' },
                ].find((e) => e.id === sex)}
                onChange={(e) => this.setState({ sex: e.selectedItem.id })}
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput id="email-TextInput" placeholder="Vui lòng nhập địa chỉ email" labelText="Email" value={email} disabled />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <DatePicker datePickerType="single" dateFormat="d/m/Y" onChange={(e) => this.setState({ dob: this.formatDate(e[0]) })} value={dob}>
                <DatePickerInput datePickerType="single" placeholder="dd/mm/yyyy" labelText="Ngày sinh" id="dob-datepicker" />
              </DatePicker>
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="phoneNumber-TextInput"
                placeholder="Vui lòng nhập số điện thoại"
                labelText="Số điện thoại"
                value={phoneNumber}
                onChange={(e) => this.setState({ phoneNumber: e.target.value })}
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <Dropdown
                id="role-Dropdown"
                titleText="Vị trí"
                label=""
                disabled
                items={roleList}
                selectedItem={roleList.find((e) => e.id === role)}
                onChange={(e) => this.setState({ role: e.selectedItem.id, roleName: e.selectedItem.label })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <Dropdown
                id="company-Dropdown"
                titleText="Công ty"
                label=""
                disabled
                items={companyList}
                selectedItem={companyList.find((e) => e.id === companyID)}
                onChange={(e) => this.setState({ companyID: e.selectedItem.id })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="address-TextInput"
                placeholder="Vui lòng nhập địa chỉ"
                labelText="Địa chỉ"
                value={address}
                onChange={(e) => this.setState({ address: e.target.value })}
              />
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <Checkbox
                id="changePassword-checkbox"
                checked={changePasswordFlag}
                onChange={(e) => this.setState({ changePasswordFlag: e })}
                labelText="Đổi mật khẩu"
              />
            </div>
          </div>

          <br />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="oldPassword-TextInput"
                type="password"
                disabled={!changePasswordFlag}
                placeholder="Vui lòng nhập mật khẩu cũ"
                labelText="Mật khẩu cũ"
                value={oldPassword}
                onChange={(e) => this.setState({ oldPassword: e.target.value })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="newPassword-TextInput"
                type="password"
                placeholder="Vui lòng nhập mật khẩu mới"
                labelText="Mật khẩu mới"
                disabled={!changePasswordFlag}
                value={newPassword}
                onChange={(e) => this.setState({ newPassword: e.target.value })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="retypePassword-TextInput"
                type="password"
                placeholder="Vui lòng nhập lại mật khẩu mới"
                labelText="Nhập lại mật khẩu mới"
                disabled={!changePasswordFlag}
                value={retypePassword}
                onChange={(e) => this.setState({ retypePassword: e.target.value })}
              />
            </div>
          </div>

          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
          <br />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <Button onClick={() => this.updateUser()}>Cập nhật</Button>
            </div>
            <div className="bx--col-lg-3 bx--col-md-3">
              <Button onClick={() => history.push('/home')}>Quay về trang chủ</Button>
            </div>
          </div>
          <br />
          <br />
          <br />
        </div>
      </div>
    );
  }
}

UserUpdate.propTypes = {
  setErrorMessage: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  setSubmitResult: PropTypes.func.isRequired,
  common: PropTypes.shape({ errorMessage: PropTypes.string, submitResult: PropTypes.string, isLoading: PropTypes.bool }).isRequired,
  auth: PropTypes.shape({
    userID: PropTypes.string,
    role: PropTypes.string,
    roleName: PropTypes.string,
    companyID: PropTypes.string,
    companyName: PropTypes.string,
    isActive: PropTypes.bool,
  }).isRequired,
  history: PropTypes.instanceOf(Object).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
  }).isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  common: state.common,
});

const mapDispatchToProps = (dispatch) => ({
  setErrorMessage: (errorMessage) => dispatch(assignErrorMessage(errorMessage)),
  setLoading: (loading) => dispatch(setLoadingValue(loading)),
  setSubmitResult: (submitResult) => dispatch(setSubmitValue(submitResult)),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserUpdate);
