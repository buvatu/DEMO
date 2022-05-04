import { CloudUpload32 } from '@carbon/icons-react';
import { Button, ComposedModal, InlineNotification, Loading, ModalBody, ModalFooter, ModalHeader, TextInput } from 'carbon-components-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { assignErrorMessage, setLoadingValue, setSubmitValue } from '../../actions/commonAction';
import { insertCompanyInfo } from '../../services';

class CompanyChange extends Component {
  constructor(props) {
    super(props);
    this.state = {
      companyID: '',
      companyIDErrorMessage: '',
      companyName: '',
      companyNameErrorMessage: '',
      address: '',
      phoneNumber: '',
      director: '',
      taxCode: '',
    };
  }

  addCompany = async () => {
    const { companyID, companyName, address, phoneNumber, director, taxCode } = this.state;
    const { setErrorMessage, setSubmitResult, setLoading } = this.props;

    let hasError = false;
    if (companyID === '') {
      this.setState({ companyIDErrorMessage: 'Mã công ty không được bỏ trống' });
      hasError = true;
    }
    if (companyName === '') {
      this.setState({ companyNameErrorMessage: 'Tên công ty không được bỏ trống' });
      hasError = true;
    }
    if (hasError) {
      return;
    }
    try {
      setLoading(true);
      await insertCompanyInfo({ companyID, companyName, address, phoneNumber, director, taxCode });
      setLoading(false);
      setSubmitResult('Thông tin công ty được thêm thành công!');
    } catch (error) {
      setErrorMessage('Công ty đã tồn tại. Vui lòng kiểm tra lại.');
    }
  };

  render() {
    const { companyID, companyIDErrorMessage, companyName, companyNameErrorMessage, address, phoneNumber, director, taxCode } = this.state;
    const { common, setErrorMessage, setSubmitResult, history } = this.props;
    const { errorMessage, isLoading, submitResult } = common;

    return (
      <div className="company-add">
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
          <h4>Thêm công ty thành viên</h4>
        </div>
        <br />

        <div className="bx--grid">
          <br />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-4">
              <TextInput
                id="companyID-TextInput"
                placeholder="Vui lòng nhập mã công ty"
                labelText="Mã định danh công ty"
                helperText="Ví dụ: XN_DM_VINH, XN_DM_HANOI,..."
                value={companyID}
                onChange={(e) => this.setState({ companyID: e.target.value })}
                invalid={companyIDErrorMessage !== ''}
                invalidText={companyIDErrorMessage}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-6">
              <TextInput
                id="companyName-TextInput"
                placeholder="Vui lòng nhập tên công ty"
                labelText="Tên công ty"
                value={companyName}
                onChange={(e) => this.setState({ companyName: e.target.value })}
                invalid={companyNameErrorMessage !== ''}
                invalidText={companyNameErrorMessage}
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-4">
              <TextInput
                id="taxCode-TextInput"
                placeholder="Vui lòng nhập mã số thuế"
                labelText="Mã số thuế"
                value={taxCode}
                onChange={(e) => this.setState({ taxCode: e.target.value })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-6">
              <TextInput
                id="address-TextInput"
                placeholder="Vui lòng nhập địa chỉ công ty"
                labelText="Địa chỉ công ty"
                value={address}
                onChange={(e) => this.setState({ address: e.target.value })}
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-4">
              <TextInput
                id="director-TextInput"
                placeholder="Vui lòng nhập tên giám đốc"
                labelText="Giám đốc"
                value={director}
                onChange={(e) => this.setState({ director: e.target.value })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-6">
              <TextInput
                id="phoneNumber-TextInput"
                placeholder="Vui lòng nhập số điện thoại công ty"
                labelText="Số điện thoại công ty"
                value={phoneNumber}
                onChange={(e) => this.setState({ phoneNumber: e.target.value })}
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
            <div className="bx--col-lg-4">
              <Button onClick={() => this.addCompany()}>Thêm</Button>
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-4">
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

CompanyChange.propTypes = {
  setErrorMessage: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  setSubmitResult: PropTypes.func.isRequired,
  common: PropTypes.shape({ submitResult: PropTypes.string, errorMessage: PropTypes.string, isLoading: PropTypes.bool }).isRequired,
  auth: PropTypes.shape({
    isAuthenticated: PropTypes.bool,
    userID: PropTypes.string,
    username: PropTypes.string,
    role: PropTypes.string,
    roleName: PropTypes.string,
    address: PropTypes.string,
    isActive: PropTypes.bool,
    companyID: PropTypes.string,
    companyName: PropTypes.string,
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

export default connect(mapStateToProps, mapDispatchToProps)(CompanyChange);
