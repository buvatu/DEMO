import { CloudUpload32 } from '@carbon/icons-react';
import {
  Button,
  ComboBox,
  ComposedModal,
  InlineNotification,
  Loading,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TextInput,
} from 'carbon-components-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { assignErrorMessage, setLoadingValue, setSubmitValue } from '../../actions/commonAction';
import { deleteSupplier, getSupplierList, insertSupplier, updateSupplier } from '../../services';

class Supplier extends Component {
  constructor(props) {
    super(props);
    this.state = {
      supplierList: [],

      newSupplierID: '',
      newSupplierIDErrorMessage: '',
      newSupplierName: '',
      newSupplierNameErrorMessage: '',
      newTaxCode: '',
      newPhoneNumber: '',
      newDescription: '',

      updatedSupplierID: '',
      updatedSupplierName: '',
      updatedSupplierNameErrorMessage: '',
      updatedTaxCode: '',
      updatedPhoneNumber: '',
      updatedDescription: '',
    };
  }

  componentDidMount = async () => {
    const { setLoading } = this.props;
    setLoading(true);
    const getSupplierListResult = await getSupplierList();
    setLoading(false);
    this.setState({
      supplierList: getSupplierListResult.data
        .map((e, index) => {
          e.id = index.toString();
          return e;
        })
        .sort((a, b) => a.supplier_name.localeCompare(b.supplier_name)),
    });
  };

  reload = async () => {
    const { setLoading, setSubmitResult } = this.props;
    setSubmitResult('');
    setLoading(true);
    const getSupplierListResult = await getSupplierList();
    setLoading(false);
    this.setState({
      supplierList: getSupplierListResult.data
        .map((e, index) => {
          e.id = index.toString();
          return e;
        })
        .sort((a, b) => a.supplier_name.localeCompare(b.supplier_name)),
      newSupplierID: '',
      newSupplierIDErrorMessage: '',
      newSupplierName: '',
      newSupplierNameErrorMessage: '',
      newTaxCode: '',
      newPhoneNumber: '',
      newDescription: '',

      updatedSupplierID: '',
      updatedSupplierName: '',
      updatedSupplierNameErrorMessage: '',
      updatedTaxCode: '',
      updatedPhoneNumber: '',
      updatedDescription: '',
    });
  };

  addNewSupplier = async () => {
    const { setLoading, setSubmitResult, setErrorMessage, auth } = this.props;
    const { supplierList, newSupplierID, newSupplierName, newTaxCode, newPhoneNumber, newDescription } = this.state;
    let hasError = false;
    if (newSupplierID.trim() === '') {
      this.setState({ newSupplierIDErrorMessage: 'Mã nhà cung cấp không được bỏ trống' });
      hasError = true;
    }
    if (
      supplierList
        .map((e) => {
          return e.supplier_id;
        })
        .includes(newSupplierID.trim())
    ) {
      this.setState({ newSupplierIDErrorMessage: 'Mã nhà cung cấp đã tồn tại' });
      hasError = true;
    }
    if (newSupplierName.trim() === '') {
      this.setState({ newSupplierNameErrorMessage: 'Tên nhà cung cấp không được bỏ trống' });
      hasError = true;
    }
    if (
      supplierList
        .map((e) => {
          return e.supplier_name;
        })
        .includes(newSupplierName.trim())
    ) {
      this.setState({ newSupplierNameErrorMessage: 'Tên nhà cung cấp đã tồn tại' });
      hasError = true;
    }
    if (hasError) {
      return;
    }
    setLoading(true);
    const getAddSupplierResult = await insertSupplier(newSupplierID, newSupplierName, newTaxCode, newPhoneNumber, newDescription, auth.userID);
    setLoading(false);
    if (getAddSupplierResult.data === 1) {
      setSubmitResult('Nhà cung cấp mới được thêm thành công!');
    } else {
      setErrorMessage('Nhà cung cấp mới đã tồn tại. Vui lòng kiểm tra lại.');
    }
  };

  updateSupplier = async () => {
    const { setLoading, setSubmitResult, setErrorMessage, auth } = this.props;
    const { updatedSupplierID, updatedSupplierName, updatedTaxCode, updatedPhoneNumber, updatedDescription } = this.state;
    if (updatedSupplierName.trim() === '') {
      this.setState({ updatedSupplierNameErrorMessage: 'Tên nhà cung cấp không được bỏ trống' });
      return;
    }
    setLoading(true);
    const getUpdatSupplierResult = await updateSupplier(
      updatedSupplierID,
      updatedSupplierName,
      updatedTaxCode,
      updatedPhoneNumber,
      updatedDescription,
      auth.userID
    );
    setLoading(false);
    if (getUpdatSupplierResult.data === 1) {
      setSubmitResult('Nhà cung cấp được cập nhật thành công!');
      this.setState({ updatedSupplierID: '', updatedSupplierName: '', updatedTaxCode: '', updatedPhoneNumber: '', updatedDescription: '' });
    } else {
      setErrorMessage('Có lỗi khi cập nhật nhà cung cấp. Vui lòng kiểm tra lại.');
    }
  };

  deleteSupplier = async () => {
    const { setLoading, setSubmitResult, setErrorMessage } = this.props;
    const { updatedSupplierID } = this.state;
    setLoading(true);
    const getDeleteSupplierResult = await deleteSupplier(updatedSupplierID);
    setLoading(false);
    if (getDeleteSupplierResult.data === 1) {
      setSubmitResult('Nhà cung cấp đã được xoá thành công!');
    } else {
      setErrorMessage('Có lỗi khi xoá nhà cung cấp. Vui lòng kiểm tra lại.');
    }
  };

  render() {
    // Props first
    const { setErrorMessage, common } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const {
      supplierList,

      newSupplierID,
      newSupplierIDErrorMessage,
      newSupplierName,
      newSupplierNameErrorMessage,
      newTaxCode,
      newPhoneNumber,
      newDescription,

      updatedSupplierID,
      updatedSupplierName,
      updatedSupplierNameErrorMessage,
      updatedTaxCode,
      updatedPhoneNumber,
      updatedDescription,
    } = this.state;

    return (
      <div className="supplier">
        {/* Loading */}
        {isLoading && <Loading description="Loading data. Please wait..." withOverlay />}
        {/* Success Modal */}
        <ComposedModal className="btn-success" open={submitResult !== ''} size="sm" onClose={() => this.reload()}>
          <ModalHeader iconDescription="Close" title={<div>Thao tác thành công</div>} />
          <ModalBody aria-label="Modal content">
            <div className="form-icon">
              <CloudUpload32 className="icon-prop" />
              <p className="bx--modal-content__text">{submitResult}</p>
            </div>
          </ModalBody>
          <ModalFooter onRequestSubmit={() => this.reload()} primaryButtonText="OK" secondaryButtonText="" />
        </ComposedModal>
        {/* Error Message */}
        <div className="bx--grid">
          <div className="bx--row">
            {errorMessage !== '' && <InlineNotification lowContrast kind="error" title={errorMessage} onCloseButtonClick={() => setErrorMessage('')} />}
          </div>
        </div>
        <br />
        <div className="view-header--box">
          <h4>Danh sách nhà cung cấp</h4>
        </div>
        <br />

        {/* Content page */}
        <div className="bx--grid">
          <div className="bx--row">
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="newSupplierID-TextInput"
                placeholder=""
                helperText="Ví dụ: NCC_000001"
                labelText="Mã nhà cung cấp"
                value={newSupplierID}
                onChange={(e) => this.setState({ newSupplierID: e.target.value })}
                invalid={newSupplierIDErrorMessage !== ''}
                invalidText={newSupplierIDErrorMessage}
              />
            </div>
            <div className="bx--col-lg-4">
              <TextInput
                id="newSupplierName-TextInput"
                placeholder=""
                labelText="Tên nhà cung cấp"
                value={newSupplierName}
                onChange={(e) => this.setState({ newSupplierName: e.target.value })}
                invalid={newSupplierNameErrorMessage !== ''}
                invalidText={newSupplierNameErrorMessage}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="newTaxCode-TextInput"
                placeholder=""
                labelText="Mã số thuế"
                value={newTaxCode}
                onChange={(e) => this.setState({ newTaxCode: e.target.value })}
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="newPhoneNumber-TextInput"
                placeholder=""
                labelText="Số điện thoại"
                value={newPhoneNumber}
                onChange={(e) => this.setState({ newPhoneNumber: e.target.value })}
              />
            </div>
            <div className="bx--col-lg-4">
              <TextInput
                id="newDescription-TextInput"
                placeholder=""
                labelText="Địa chỉ"
                value={newDescription}
                onChange={(e) => this.setState({ newDescription: e.target.value })}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.addNewSupplier()} style={{ marginTop: '1rem' }}>
                Thêm
              </Button>
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-3 bx--col-md-3">
              <ComboBox
                id="supplier-ComboBox"
                titleText="Đơn vị cung cấp"
                placeholder=""
                label=""
                items={supplierList.map((e) => {
                  return {
                    id: e.supplier_id,
                    label: e.supplier_id.concat(' - ').concat(e.supplier_name),
                  };
                })}
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
                selectedItem={
                  updatedSupplierID === ''
                    ? null
                    : supplierList
                        .map((e) => {
                          return {
                            id: e.supplier_id,
                            label: e.supplier_id.concat(' - ').concat(e.supplier_name),
                          };
                        })
                        .find((e) => e.id === updatedSupplierID)
                }
                onChange={(e) => {
                  if (e.selectedItem == null) {
                    this.setState({ updatedSupplierID: '', updatedSupplierName: '', updatedTaxCode: '', updatedPhoneNumber: '', updatedDescription: '' });
                  } else {
                    const selectedSupplier = supplierList.find((item) => item.supplier_id === e.selectedItem.id);
                    this.setState({
                      updatedSupplierID: selectedSupplier.supplier_id,
                      updatedSupplierName: selectedSupplier.supplier_name,
                      updatedTaxCode: selectedSupplier.tax_code,
                      updatedPhoneNumber: selectedSupplier.phone_number,
                      updatedDescription: selectedSupplier.description,
                    });
                  }
                }}
              />
            </div>
            <div className="bx--col-lg-4">
              <TextInput
                id="updatedSupplierName-TextInput"
                placeholder=""
                labelText="Tên nhà cung cấp"
                value={updatedSupplierName}
                onChange={(e) => this.setState({ updatedSupplierName: e.target.value })}
                invalid={updatedSupplierNameErrorMessage !== ''}
                invalidText={updatedSupplierNameErrorMessage}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="updatedTaxCode-TextInput"
                placeholder=""
                labelText="Mã số thuế"
                value={updatedTaxCode}
                onChange={(e) => this.setState({ updatedTaxCode: e.target.value })}
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="updatedPhoneNumber-TextInput"
                placeholder=""
                labelText="Số điện thoại"
                value={updatedPhoneNumber}
                onChange={(e) => this.setState({ updatedPhoneNumber: e.target.value })}
              />
            </div>
            <div className="bx--col-lg-4">
              <TextInput
                id="updatedDescription-TextInput"
                placeholder=""
                labelText="Địa chỉ"
                value={updatedDescription}
                onChange={(e) => this.setState({ updatedDescription: e.target.value })}
              />
            </div>
            <div className="bx--col-lg-4">
              <Button onClick={() => this.updateSupplier()} style={{ marginTop: '1rem', marginRight: '1rem' }} disabled={updatedSupplierID === ''}>
                Cập nhật
              </Button>
              <Button onClick={() => this.deleteSupplier()} style={{ marginTop: '1rem' }} disabled={updatedSupplierID === ''}>
                Xoá
              </Button>
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-12">
              <TableContainer title={`Có tất cả ${supplierList.length} nhà cung cấp.`}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader style={{ width: '10%' }}>Mã nhà cung cấp</TableHeader>
                      <TableHeader style={{ width: '30%' }}>Tên nhà cung cấp</TableHeader>
                      <TableHeader style={{ width: '10%' }}>Mã số thuế</TableHeader>
                      <TableHeader style={{ width: '10%' }}>Số điện thoại</TableHeader>
                      <TableHeader style={{ width: '40%' }}>Địa chỉ</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {supplierList.map((row, index) => (
                      <TableRow key={`row-${index.toString()}`}>
                        <TableCell>{row.supplier_id}</TableCell>
                        <TableCell>{row.supplier_name}</TableCell>
                        <TableCell>{row.tax_code}</TableCell>
                        <TableCell>{row.phone_number}</TableCell>
                        <TableCell>{row.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <div className="bx--col-lg-2 bx--col-md-2" />
          </div>
          <br />
          <br />
          <br />
        </div>
      </div>
    );
  }
}

Supplier.propTypes = {
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
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
  }).isRequired,
};

const mapStateToProps = (state) => ({
  common: state.common,
  auth: state.auth,
});

const mapDispatchToProps = (dispatch) => ({
  setErrorMessage: (errorMessage) => dispatch(assignErrorMessage(errorMessage)),
  setLoading: (loading) => dispatch(setLoadingValue(loading)),
  setSubmitResult: (submitResult) => dispatch(setSubmitValue(submitResult)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Supplier);
