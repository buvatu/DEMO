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
  Pagination,
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
      supplierListDisplay: [],
      page: 1,
      pageSize: 10,

      newSupplierID: '',
      newSupplierIDErrorMessage: '',
      newSupplierName: '',
      newSupplierNameErrorMessage: '',
      newTaxCode: '',
      newPhoneNumber: '',
      newAddress: '',

      id: '',
      updatedSupplierID: '',
      updatedSupplierName: '',
      updatedSupplierNameErrorMessage: '',
      updatedTaxCode: '',
      updatedPhoneNumber: '',
      updatedAddress: '',
    };
  }

  componentDidMount = async () => {
    const { setLoading } = this.props;
    setLoading(true);
    const getSupplierListResult = await getSupplierList();
    setLoading(false);
    const supplierList = getSupplierListResult.data.sort((a, b) => a.supplierName.localeCompare(b.supplierName));
    this.setState({
      supplierList,
      supplierListDisplay: supplierList.slice(0, 10),
    });
  };

  reload = async () => {
    const { setLoading, setSubmitResult } = this.props;
    setSubmitResult('');
    setLoading(true);
    const getSupplierListResult = await getSupplierList();
    setLoading(false);
    const supplierList = getSupplierListResult.data.sort((a, b) => a.supplierName.localeCompare(b.supplierName));
    this.setState({
      supplierList,
      page: 1,
      pageSize: 10,
      supplierListDisplay: supplierList.slice(0, 10),
      newSupplierID: '',
      newSupplierIDErrorMessage: '',
      newSupplierName: '',
      newSupplierNameErrorMessage: '',
      newTaxCode: '',
      newPhoneNumber: '',
      newAddress: '',

      id: '',
      updatedSupplierID: '',
      updatedSupplierName: '',
      updatedSupplierNameErrorMessage: '',
      updatedTaxCode: '',
      updatedPhoneNumber: '',
      updatedAddress: '',
    });
  };

  addNewSupplier = async () => {
    const { setLoading, setSubmitResult, setErrorMessage } = this.props;
    const { supplierList, newSupplierID, newSupplierName, newTaxCode, newPhoneNumber, newAddress } = this.state;
    let hasError = false;
    if (newSupplierID.trim() === '') {
      this.setState({ newSupplierIDErrorMessage: 'Mã nhà cung cấp không được bỏ trống' });
      hasError = true;
    }
    if (newSupplierID !== '' && supplierList.find((e) => e.supplierID === newSupplierID) !== undefined) {
      this.setState({ newSupplierIDErrorMessage: 'Mã nhà cung cấp đã tồn tại' });
      hasError = true;
    }
    if (newSupplierName.trim() === '') {
      this.setState({ newSupplierNameErrorMessage: 'Tên nhà cung cấp không được bỏ trống' });
      hasError = true;
    }
    if (hasError) {
      return;
    }
    setLoading(true);
    try {
      await insertSupplier({ supplierID: newSupplierID, supplierName: newSupplierName, taxCode: newTaxCode, phoneNumber: newPhoneNumber, address: newAddress });
      setSubmitResult('Nhà cung cấp mới được thêm thành công!');
    } catch {
      setErrorMessage('Nhà cung cấp mới đã tồn tại. Vui lòng kiểm tra lại.');
    }
    setLoading(false);
  };

  updateSupplier = async () => {
    const { setLoading, setSubmitResult, setErrorMessage } = this.props;
    const { id, updatedSupplierID, updatedSupplierName, updatedTaxCode, updatedPhoneNumber, updatedAddress } = this.state;
    if (updatedSupplierName.trim() === '') {
      this.setState({ updatedSupplierNameErrorMessage: 'Tên nhà cung cấp không được bỏ trống' });
      return;
    }
    setLoading(true);
    try {
      await updateSupplier({
        id,
        supplierID: updatedSupplierID,
        supplierName: updatedSupplierName,
        taxCode: updatedTaxCode,
        phoneNumber: updatedPhoneNumber,
        address: updatedAddress,
      });
      setSubmitResult('Nhà cung cấp được cập nhật thành công!');
    } catch {
      setErrorMessage('Có lỗi khi cập nhật nhà cung cấp. Vui lòng kiểm tra lại.');
    }
    setLoading(false);
  };

  deleteSupplier = async () => {
    const { setLoading, setSubmitResult, setErrorMessage } = this.props;
    const { id, updatedSupplierID } = this.state;
    if (updatedSupplierID === '') {
      setErrorMessage('Vui lòng chọn nhà cung cấp.');
      return;
    }
    setLoading(true);
    try {
      await deleteSupplier(id);
      setSubmitResult('Nhà cung cấp đã được xoá thành công!');
    } catch {
      setErrorMessage('Có lỗi khi xoá nhà cung cấp. Vui lòng kiểm tra lại.');
    }
    setLoading(false);
  };

  render() {
    // Props first
    const { setErrorMessage, common } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const {
      supplierList,
      supplierListDisplay,
      page,
      pageSize,

      newSupplierID,
      newSupplierIDErrorMessage,
      newSupplierName,
      newSupplierNameErrorMessage,
      newTaxCode,
      newPhoneNumber,
      newAddress,

      updatedSupplierID,
      updatedSupplierName,
      updatedSupplierNameErrorMessage,
      updatedTaxCode,
      updatedPhoneNumber,
      updatedAddress,
    } = this.state;

    const supplierIDList = supplierList.map((e) => {
      return { id: e.supplierID, label: e.supplierID.concat(' - ').concat(e.supplierName) };
    });

    return (
      <div className="supplier">
        {/* Loading */}
        {isLoading && <Loading Address="Loading data. Please wait..." withOverlay />}
        {/* Success Modal */}
        <ComposedModal className="btn-success" open={submitResult !== ''} size="sm" onClose={() => this.reload()}>
          <ModalHeader iconAddress="Close" title={<div>Thao tác thành công</div>} />
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
                onChange={(e) => this.setState({ newSupplierID: e.target.value, newSupplierIDErrorMessage: '' })}
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
                onChange={(e) => this.setState({ newSupplierName: e.target.value, newSupplierNameErrorMessage: '' })}
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
                id="newAddress-TextInput"
                placeholder=""
                labelText="Địa chỉ"
                value={newAddress}
                onChange={(e) => this.setState({ newAddress: e.target.value })}
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
                items={supplierIDList}
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
                selectedItem={updatedSupplierID === '' ? null : supplierIDList.find((e) => e.id === updatedSupplierID)}
                onChange={(e) => {
                  if (e.selectedItem == null) {
                    this.setState({ id: '', updatedSupplierID: '', updatedSupplierName: '', updatedTaxCode: '', updatedPhoneNumber: '', updatedAddress: '' });
                  } else {
                    const selectedSupplier = supplierList.find((item) => item.supplierID === e.selectedItem.id);
                    this.setState({
                      id: selectedSupplier.id,
                      updatedSupplierID: selectedSupplier.supplierID,
                      updatedSupplierName: selectedSupplier.supplierName,
                      updatedTaxCode: selectedSupplier.taxCode,
                      updatedPhoneNumber: selectedSupplier.phoneNumber,
                      updatedAddress: selectedSupplier.address,
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
                id="updatedAddress-TextInput"
                placeholder=""
                labelText="Địa chỉ"
                value={updatedAddress}
                onChange={(e) => this.setState({ updatedAddress: e.target.value })}
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
                    {supplierListDisplay.map((supplier, index) => (
                      <TableRow key={`row-${index.toString()}`}>
                        <TableCell>{supplier.supplierID}</TableCell>
                        <TableCell>{supplier.supplierName}</TableCell>
                        <TableCell>{supplier.taxCode}</TableCell>
                        <TableCell>{supplier.phoneNumber}</TableCell>
                        <TableCell>{supplier.address}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Pagination
                className="fixed-pagination"
                backwardText="Previous page"
                forwardText="Next page"
                itemsPerPageText="Items per page:"
                page={page}
                pageNumberText="Page Number"
                pageSize={pageSize}
                pageSizes={[10, 20, 30, 40, 50]}
                totalItems={supplierList.length}
                onChange={(target) => {
                  this.setState({
                    supplierListDisplay: supplierList.slice((target.page - 1) * target.pageSize, target.page * target.pageSize),
                    page: target.page,
                    pageSize: target.pageSize,
                  });
                }}
              />
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
