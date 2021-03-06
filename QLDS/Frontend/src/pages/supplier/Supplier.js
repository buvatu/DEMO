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
      this.setState({ newSupplierIDErrorMessage: 'M?? nh?? cung c???p kh??ng ???????c b??? tr???ng' });
      hasError = true;
    }
    if (newSupplierID !== '' && supplierList.find((e) => e.supplierID === newSupplierID) !== undefined) {
      this.setState({ newSupplierIDErrorMessage: 'M?? nh?? cung c???p ???? t???n t???i' });
      hasError = true;
    }
    if (newSupplierName.trim() === '') {
      this.setState({ newSupplierNameErrorMessage: 'T??n nh?? cung c???p kh??ng ???????c b??? tr???ng' });
      hasError = true;
    }
    if (hasError) {
      return;
    }
    setLoading(true);
    try {
      await insertSupplier({ supplierID: newSupplierID, supplierName: newSupplierName, taxCode: newTaxCode, phoneNumber: newPhoneNumber, address: newAddress });
      setSubmitResult('Nh?? cung c???p m???i ???????c th??m th??nh c??ng!');
    } catch {
      setErrorMessage('Nh?? cung c???p m???i ???? t???n t???i. Vui l??ng ki???m tra l???i.');
    }
    setLoading(false);
  };

  updateSupplier = async () => {
    const { setLoading, setSubmitResult, setErrorMessage } = this.props;
    const { id, updatedSupplierID, updatedSupplierName, updatedTaxCode, updatedPhoneNumber, updatedAddress } = this.state;
    if (updatedSupplierName.trim() === '') {
      this.setState({ updatedSupplierNameErrorMessage: 'T??n nh?? cung c???p kh??ng ???????c b??? tr???ng' });
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
      setSubmitResult('Nh?? cung c???p ???????c c???p nh???t th??nh c??ng!');
    } catch {
      setErrorMessage('C?? l???i khi c???p nh???t nh?? cung c???p. Vui l??ng ki???m tra l???i.');
    }
    setLoading(false);
  };

  deleteSupplier = async () => {
    const { setLoading, setSubmitResult, setErrorMessage } = this.props;
    const { id, updatedSupplierID } = this.state;
    if (updatedSupplierID === '') {
      setErrorMessage('Vui l??ng ch???n nh?? cung c???p.');
      return;
    }
    setLoading(true);
    try {
      await deleteSupplier(id);
      setSubmitResult('Nh?? cung c???p ???? ???????c xo?? th??nh c??ng!');
    } catch {
      setErrorMessage('C?? l???i khi xo?? nh?? cung c???p. Vui l??ng ki???m tra l???i.');
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
          <ModalHeader iconAddress="Close" title={<div>Thao t??c th??nh c??ng</div>} />
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
          <h4>Danh s??ch nh?? cung c???p</h4>
        </div>
        <br />

        {/* Content page */}
        <div className="bx--grid">
          <div className="bx--row">
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="newSupplierID-TextInput"
                placeholder=""
                helperText="V?? d???: NCC_000001"
                labelText="M?? nh?? cung c???p"
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
                labelText="T??n nh?? cung c???p"
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
                labelText="M?? s??? thu???"
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
                labelText="S??? ??i???n tho???i"
                value={newPhoneNumber}
                onChange={(e) => this.setState({ newPhoneNumber: e.target.value })}
              />
            </div>
            <div className="bx--col-lg-4">
              <TextInput
                id="newAddress-TextInput"
                placeholder=""
                labelText="?????a ch???"
                value={newAddress}
                onChange={(e) => this.setState({ newAddress: e.target.value })}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.addNewSupplier()} style={{ marginTop: '1rem' }}>
                Th??m
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
                titleText="????n v??? cung c???p"
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
                labelText="T??n nh?? cung c???p"
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
                labelText="M?? s??? thu???"
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
                labelText="S??? ??i???n tho???i"
                value={updatedPhoneNumber}
                onChange={(e) => this.setState({ updatedPhoneNumber: e.target.value })}
              />
            </div>
            <div className="bx--col-lg-4">
              <TextInput
                id="updatedAddress-TextInput"
                placeholder=""
                labelText="?????a ch???"
                value={updatedAddress}
                onChange={(e) => this.setState({ updatedAddress: e.target.value })}
              />
            </div>
            <div className="bx--col-lg-4">
              <Button onClick={() => this.updateSupplier()} style={{ marginTop: '1rem', marginRight: '1rem' }} disabled={updatedSupplierID === ''}>
                C???p nh???t
              </Button>
              <Button onClick={() => this.deleteSupplier()} style={{ marginTop: '1rem' }} disabled={updatedSupplierID === ''}>
                Xo??
              </Button>
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-12">
              <TableContainer title={`C?? t???t c??? ${supplierList.length} nh?? cung c???p.`}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader style={{ width: '10%' }}>M?? nh?? cung c???p</TableHeader>
                      <TableHeader style={{ width: '30%' }}>T??n nh?? cung c???p</TableHeader>
                      <TableHeader style={{ width: '10%' }}>M?? s??? thu???</TableHeader>
                      <TableHeader style={{ width: '10%' }}>S??? ??i???n tho???i</TableHeader>
                      <TableHeader style={{ width: '40%' }}>?????a ch???</TableHeader>
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
