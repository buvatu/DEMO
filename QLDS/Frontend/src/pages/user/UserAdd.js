import { CloudUpload32 } from '@carbon/icons-react';
import {
  Button,
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
import { getCompanyList, insertUserInfo } from '../../services';

class UserAdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userID: '',
      userIDErrorMessage: '',
      username: '',
      email: '',
      emailErrorMessage: '',
      sex: 'M',
      dob: '',
      phoneNumber: '',
      role: '',
      roleName: '',
      roleErrorMessage: '',
      roleList: [],
      companyList: [],
      companyID: '',
      companyIDErrorMessage: '',
      companyName: '',
      address: '',
    };
  }

  componentDidMount = async () => {
    const { auth, setLoading } = this.props;
    // Add new user for company
    if (auth.role === 'SysAdmin') {
      setLoading(true);
      const getCompanyListResult = await getCompanyList();
      setLoading(false);
      this.setState({
        companyList: getCompanyListResult.data.map((e) => {
          return { id: e.companyID, label: e.companyName };
        }),
        role: 'CompanyAdmin',
        roleName: 'Quản lý công ty',
        roleList: [{ id: 'CompanyAdmin', label: 'Quản lý công ty' }], // SysAdmin add CompanyAdmin only
      });
    } else {
      this.setState({
        companyID: auth.companyID,
        companyList: [{ id: auth.companyID, label: auth.companyName }],
        roleList: [
          { id: 'phongketoantaichinh', label: 'Phòng Kế toán - Tài chính' },
          { id: 'phongkehoachvattu', label: 'Phòng Kế hoạch - Vật tư' },
          { id: 'phongkythuat', label: 'Phòng Kỹ thuật' },
          { id: 'bangiamdoc', label: 'Ban Giám đốc' },
        ],
      });
    }
  };

  formatDate = (inputDate) => {
    const yyyy = inputDate.getFullYear().toString();
    const mm = `0${inputDate.getMonth() + 1}`.slice(-2);
    const dd = `0${inputDate.getDate()}`.slice(-2);
    return `${dd}/${mm}/${yyyy}`;
  };

  addUser = async () => {
    const { userID, username, email, sex, dob, phoneNumber, role, roleName, companyID, companyName, address } = this.state;
    const { setLoading, setErrorMessage, setSubmitResult } = this.props;
    setErrorMessage('');
    this.setState({ userIDErrorMessage: '', emailErrorMessage: '', roleErrorMessage: '', companyIDErrorMessage: '' });

    let hasError = false;
    if (userID.trim() === '') {
      this.setState({ userIDErrorMessage: 'Mã nhân viên không được bỏ trống.' });
      hasError = true;
    }
    if (email.trim() === '') {
      this.setState({ emailErrorMessage: 'Email không được bỏ trống.' });
      hasError = true;
    }
    if (email !== '' && !email.includes('@gmail.com')) {
      this.setState({ emailErrorMessage: 'Hệ thống chỉ hỗ trợ gmail.' });
      hasError = true;
    }
    if (role === '') {
      this.setState({ roleErrorMessage: 'Vị trí nhân viên không được bỏ trống.' });
      hasError = true;
    }
    if (companyID === '') {
      this.setState({ companyIDErrorMessage: 'Công ty không được bỏ trống.' });
      hasError = true;
    }
    if (hasError) {
      return;
    }
    setLoading(true);
    try {
      await insertUserInfo({ userID, username, email, sex, dob, phoneNumber, role, roleName, address, companyID, companyName });
      setSubmitResult('Thông tin nhân viên được thêm thành công!');
    } catch (error) {
      setErrorMessage('Mã định danh nhân viên hoặc emai đã tồn tại. Xin vui lòng thử lại.');
    }
    setLoading(false);
  };

  render() {
    const {
      userID,
      userIDErrorMessage,
      username,
      email,
      emailErrorMessage,
      sex,
      dob,
      phoneNumber,
      role,
      roleErrorMessage,
      roleList,
      companyList,
      companyID,
      companyIDErrorMessage,
      address,
    } = this.state;

    const { auth, common, setErrorMessage, setSubmitResult, history } = this.props;
    const { errorMessage, isLoading, submitResult } = common;

    return (
      <div className="user-add">
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
          <h4>Thêm nhân viên mới</h4>
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
                helperText="Ví dụ: bvhien, dsmanh..."
                value={userID}
                onChange={(e) => this.setState({ userID: e.target.value })}
                invalid={userIDErrorMessage !== ''}
                invalidText={userIDErrorMessage}
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
              <TextInput
                id="email-TextInput"
                placeholder="Vui lòng nhập địa chỉ email"
                labelText="Email"
                value={email}
                onChange={(e) => this.setState({ email: e.target.value, emailErrorMessage: '' })}
                invalid={emailErrorMessage !== ''}
                invalidText={emailErrorMessage}
              />
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
                items={roleList}
                selectedItem={roleList.find((e) => e.id === role)}
                onChange={(e) => this.setState({ role: e.selectedItem.id, roleName: e.selectedItem.label, roleErrorMessage: '' })}
                invalid={roleErrorMessage !== ''}
                invalidText={roleErrorMessage}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <Dropdown
                id="company-Dropdown"
                titleText="Công ty"
                label=""
                disabled={auth.role !== 'SysAdmin'}
                items={companyList}
                selectedItem={companyList.find((e) => e.id === companyID)}
                onChange={(e) => this.setState({ companyID: e.selectedItem.id, companyName: e.selectedItem.label, companyIDErrorMessage: '' })}
                invalid={companyIDErrorMessage !== ''}
                invalidText={companyIDErrorMessage}
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
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
          <br />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <Button onClick={() => this.addUser()}>Thêm</Button>
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

UserAdd.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(UserAdd);
